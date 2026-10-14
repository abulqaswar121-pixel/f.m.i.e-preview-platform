import { beforeEach, describe, expect, it } from "vitest";

import { api } from "@/services/api";
import { seedSurveys } from "@/data";
import type { CartItem } from "@/types";

/**
 * Service-layer tests.
 *
 * The UI may only reach data through `src/services/api.ts`, so these assertions
 * cover the rules the interface depends on: administrator-configurable plan
 * limits, filtered survey analytics, the press-release workflow, simulated
 * commerce with stock effects, and persona-based sessions.
 */

const SAMPLE_SURVEY = "srv-pan-african-payments";

function cartLine(
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    imageUrl: string;
  },
  variant: string,
  quantity: number,
): CartItem {
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    currency: product.currency,
    variant,
    quantity,
    imageUrl: product.imageUrl,
  };
}

describe("Survey plans are administrator-configurable", () => {
  it("ships every plan as configurable and persists limit changes", async () => {
    const plans = await api.surveys.plans();
    expect(plans.length).toBeGreaterThan(0);
    expect(plans.every((plan) => plan.adminConfigurable)).toBe(true);

    const updated = await api.surveys.updatePlan("plan-free", {
      responseLimit: 250,
      questionLimit: 12,
    });
    expect(updated?.responseLimit).toBe(250);
    expect(updated?.questionLimit).toBe(12);

    const reread = await api.surveys.getPlan("plan-free");
    expect(reread?.responseLimit).toBe(250);
  });

  it("applies the configured response limit to newly created surveys", async () => {
    const survey = await api.surveys.create({
      title: "Configured limit check",
      category: "Technology",
      objective: "Confirm plan limits flow from configuration into new instruments.",
      audience: "Platform testers",
      planId: "plan-free",
      isAnonymous: true,
      isBranded: false,
      closingDate: "2026-12-31",
      openingDate: "2026-10-01",
      consentNotice: "Responses are anonymous and used only for this demonstration.",
      tags: ["testing"],
      questions: [
        {
          id: "q1",
          prompt: "Does the builder respect plan limits?",
          type: "single_choice",
          options: ["Yes", "No"],
          required: true,
        },
      ],
      creatorId: "user-survey-creator",
      creatorName: "Amara Okafor",
      submitForModeration: false,
    });

    expect(survey.responseLimit).toBe(250);
    expect(survey.status).toBe("draft");

    const submitted = await api.surveys.setStatus(
      survey.id,
      "pending_moderation",
      "Ready for review.",
    );
    expect(submitted?.status).toBe("pending_moderation");
    expect(submitted?.moderationNote).toBe("Ready for review.");
  });
});

describe("Survey analytics filters", () => {
  it("reports completion rate and mean duration for the whole sample", async () => {
    const result = await api.surveys.analytics(SAMPLE_SURVEY);
    expect(result.survey?.id).toBe(SAMPLE_SURVEY);
    expect(result.responses.length).toBeGreaterThan(0);
    expect(result.completionRate).toBeGreaterThanOrEqual(0);
    expect(result.completionRate).toBeLessThanOrEqual(100);
    expect(result.averageDurationSeconds).toBeGreaterThan(0);
    expect(result.perQuestion.length).toBeGreaterThan(0);
  });

  it("narrows the sample by segment and by country", async () => {
    const all = await api.surveys.analytics(SAMPLE_SURVEY);
    const segment = "Owner / founder";
    const bySegment = await api.surveys.analytics(SAMPLE_SURVEY, { segment });
    expect(bySegment.responses.length).toBeLessThan(all.responses.length);
    expect(bySegment.responses.every((response) => response.respondentSegment === segment)).toBe(
      true,
    );

    const country = "Nigeria";
    const byCountry = await api.surveys.analytics(SAMPLE_SURVEY, { country });
    expect(byCountry.responses.every((response) => response.respondentCountry === country)).toBe(
      true,
    );
  });

  it("honours an explicit date range", async () => {
    const future = await api.surveys.analytics(SAMPLE_SURVEY, { from: "2999-01-01" });
    expect(future.responses).toHaveLength(0);
    expect(future.completionRate).toBe(0);

    const historic = await api.surveys.analytics(SAMPLE_SURVEY, {
      from: "2000-01-01",
      to: "2999-01-01",
    });
    expect(historic.responses.length).toBeGreaterThan(0);
  });

  it("exports an aggregated CSV without respondent identifiers", async () => {
    const csv = await api.surveys.exportCsv(SAMPLE_SURVEY);
    expect(csv.split("\n").length).toBeGreaterThan(3);
    expect(csv.toLowerCase()).not.toContain("respondent id");
    expect(csv.toLowerCase()).not.toContain("email");
  });
});

describe("Press release workflow", () => {
  it("issues a reference, quotes, records payment and logs every move", async () => {
    const booking = await api.pressReleases.create({
      title: "Test campaign for workflow assertions",
      companyName: "Test Company Ltd",
      contactName: "Test Contact",
      contactEmail: "test.contact@testcompany.example",
      contactPhone: "+44 20 7946 0999",
      country: "United Kingdom",
      industry: "Technology",
      websiteUrl: "https://testcompany.example",
      tier: "tier_2_business",
      targetAudience: "Business and finance readers",
      distributionRegions: ["United Kingdom"],
      targetDate: "2026-12-01",
      contentDraft: "A sample announcement used to exercise the workflow.",
      mediaAttachments: [],
      addOnIds: ["proofread"],
      disclosureAcknowledged: true,
      consentToProcessing: true,
      userId: "user-corporate-pr",
    });

    expect(booking.referenceNumber).toMatch(/^FMIE-PR-\d{4}-\d+$/);
    expect(booking.status).toBe("submitted");
    expect(booking.timeline).toHaveLength(1);
    expect(booking.addOns.map((addOn) => addOn.id)).toContain("proofread");

    const quoted = await api.pressReleases.setQuote(booking.id, 2030);
    expect(quoted?.status).toBe("quote_sent");
    expect(quoted?.quoteAmount).toBe(2030);

    const paid = await api.pressReleases.markPaid(booking.id);
    expect(paid?.status).toBe("approved");
    expect(paid?.paidAt).toBeTruthy();

    const distributing = await api.pressReleases.updateStatus(
      booking.id,
      "distribution_in_progress",
      "Transmission started to verified channels.",
      "Eleanor Whitcombe",
    );
    expect(distributing?.status).toBe("distribution_in_progress");
    expect(distributing?.timeline.at(-1)?.actor).toBe("Eleanor Whitcombe");
    expect(distributing?.timeline.length ?? 0).toBeGreaterThan(4);

    const published = await api.pressReleases.addPublishedUrl(
      booking.id,
      "https://fmie.example/commercial/test",
    );
    expect(published?.publishedUrls).toContain("https://fmie.example/commercial/test");

    const scoped = await api.pressReleases.list({ userId: "user-corporate-pr" });
    expect(scoped.map((entry) => entry.id)).toContain(booking.id);
  });

  it("keeps unverified channels visible but flagged for administrators", async () => {
    const channels = await api.pressReleases.channels();
    const pending = channels.filter((channel) => channel.status !== "verified");
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every((channel) => channel.administratorNote.length > 0)).toBe(true);
  });
});

describe("Simulated commerce", () => {
  it("prices an order, decrements stock and produces an invoice", async () => {
    const products = await api.products.list();
    const product = products.find((entry) => entry.stockLevel >= 5);
    expect(product).toBeTruthy();
    const before = product!.stockLevel;

    const order = await api.orders.create({
      items: [cartLine(product!, product!.variants[0] ?? "Standard", 2)],
      email: "buyer@testcompany.example",
      address: {
        fullName: "Test Buyer",
        line1: "1 Test Street",
        city: "London",
        postcode: "EC1V 2NX",
        country: "United Kingdom",
        phone: "+44 20 7946 0999",
      },
      paymentMethod: "card",
      discount: 0,
      shipping: 6.95,
      userId: "user-corporate-pr",
    });

    expect(order.reference).toMatch(/^FMIE-ORD-\d{4}-\d+$/);
    expect(order.subtotal).toBe(Number((product!.price * 2).toFixed(2)));
    expect(order.total).toBe(Number((order.subtotal + order.shipping).toFixed(2)));
    expect(order.paymentReference).toMatch(/^SIM-/);

    const after = await api.products.getById(product!.id);
    expect(after?.stockLevel).toBe(before - 2);

    const invoice = await api.orders.invoiceText(order);
    expect(invoice).toContain(order.reference);
    expect(invoice.toLowerCase()).toContain("simulated");

    const moved = await api.orders.updateStatus(order.id, "shipped");
    expect(moved?.status).toBe("shipped");
  });
});

describe("Sessions and personas", () => {
  it("accepts any valid-looking email and switches persona without reloading", async () => {
    const created = await api.users.signIn("new.member@company.example");
    expect(created.role).toBe("registered_user");
    expect((await api.users.current())?.id).toBe(created.id);

    const admin = await api.users.switchPersona("user-administrator");
    expect(admin?.role).toBe("administrator");
    expect((await api.users.current())?.id).toBe("user-administrator");

    await api.users.signOut();
    expect(await api.users.current()).toBeUndefined();
  });

  it("resolves corporate organisations by name for the account view", async () => {
    const organization = await api.users.organizationByName("Vance Dynamics");
    expect(organization?.id).toBe("org-vance");
    expect(organization?.teamMembers.length).toBeGreaterThan(0);
    expect(organization?.invoices.length).toBeGreaterThan(0);
  });
});

describe("Administrator overview and reset", () => {
  beforeEach(() => {
    // Intentionally empty: the reset assertion below must see the mutations
    // made by the earlier suites in this file.
  });

  it("summarises the platform and restores the shipped sample data", async () => {
    const overview = await api.admin.overview();
    expect(overview.surveys.total).toBeGreaterThan(seedSurveys.length);
    expect(overview.pressReleases.total).toBeGreaterThan(0);
    expect(overview.commerce.orders).toBeGreaterThan(0);

    await api.admin.reset();

    const afterReset = await api.admin.overview();
    expect(afterReset.surveys.total).toBe(seedSurveys.length);
    const plans = await api.surveys.plans();
    expect(plans.find((plan) => plan.id === "plan-free")?.responseLimit).not.toBe(250);
  });
});
