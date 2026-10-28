import { describe, expect, it } from "vitest";
import { kitRequestSchema, kitReplySchema, ownsKitCrest } from "@/lib/kit-quotes";
const request = { clubName: "Harbour FC", sport: "Football", primaryColor: "#123456", secondaryColor: "#abcdef", quantity: 1, roster: [{ name: "Player", number: "1", size: "M" }], deliveryDate: "", deliveryAddress: "Victoria Island, Lagos", notes: "" };
describe("saved kit requests", () => {
  it("rejects missing team names and delivery details", () => {
    expect(kitRequestSchema.safeParse(request).success).toBe(true);
    expect(kitRequestSchema.safeParse({ ...request, clubName: "" }).success).toBe(false);
    expect(kitRequestSchema.safeParse({ ...request, deliveryAddress: "" }).success).toBe(false);
  });
  it("does not accept more players than kits", () => {
    expect(kitRequestSchema.safeParse({ ...request, roster: [...request.roster, ...request.roster] }).success).toBe(false);
  });
  it("only accepts the member's own crest folder", () => {
    expect(ownsKitCrest("member-a", "member-a/kit-crests/crest.png")).toBe(true);
    expect(ownsKitCrest("member-a", "member-b/kit-crests/crest.png")).toBe(false);
    expect(ownsKitCrest("member-a", "member-a/kit-crests/../crest.png")).toBe(false);
  });
  it("requires a positive dollar quote and details", () => {
    const quote = { id: "536ef525-9c61-4363-b427-fa27418e0394", usd: 599, note: "Fabric and delivery included" };
    expect(kitReplySchema.safeParse(quote).success).toBe(true);
    expect(kitReplySchema.safeParse({ ...quote, usd: 0 }).success).toBe(false);
    expect(kitReplySchema.safeParse({ ...quote, usd: 1.234 }).success).toBe(false);
    expect(kitReplySchema.safeParse({ ...quote, note: "" }).success).toBe(false);
  });
});