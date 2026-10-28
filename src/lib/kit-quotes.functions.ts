import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { kitRequestSchema, kitReplySchema, ownsKitCrest } from "@/lib/kit-quotes";
import { NGN_PER_USD } from "@/lib/outlet-pricing";

export const submitKitRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => kitRequestSchema.parse(input))
  .handler(async ({ data, context }) => {
    if (data.crestPath) {
      if (!ownsKitCrest(context.userId, data.crestPath)) throw new Error("Please upload your team crest again.");
      const name = data.crestPath.split("/")[2];
      if (!name) throw new Error("Please upload your team crest again.");
      const { data: files, error } = await context.supabase.storage.from("member-files").list(`${context.userId}/kit-crests`, { search: name, limit: 100 });
      if (error || !files?.some((file) => file.name === name)) throw new Error("Your crest upload could not be found.");
    }
    const { data: row, error } = await context.supabase.from("kit_quotes").insert({
      user_id: context.userId, club_name: data.clubName, sport: data.sport, crest_path: data.crestPath,
      primary_color: data.primaryColor, secondary_color: data.secondaryColor, quantity: data.quantity,
      roster: data.roster, delivery_date: data.deliveryDate || null, delivery_address: data.deliveryAddress, notes: data.notes,
      status: "requested", quote_minor: null, quote_note: "",
    }).select("id").single();
    if (error || !row) throw new Error("Your request could not be saved. Please try again.");
    return row;
  });

export const listMyKitRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("kit_quotes").select("*").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("Your kit requests could not be loaded.");
    return data ?? [];
  });

export const getKitQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "administrator" });
    if (roleError || allowed !== true) throw new Error("Administrator access required.");
    const { data, error } = await context.supabase.from("kit_quotes").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("Kit requests could not be loaded.");
    return data ?? [];
  });

export const replyToKitRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => kitReplySchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "administrator" });
    if (roleError || allowed !== true) throw new Error("Administrator access required.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: saved, error } = await supabaseAdmin.from("kit_quotes").update({ status: "quoted", quote_minor: Math.round(data.usd * 100) * NGN_PER_USD, quote_note: data.note }).eq("id", data.id).select("id").single();
    if (error || !saved) throw new Error("Your quote could not be saved.");
    return { ok: true };
  });

export const getKitCrest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "administrator" });
    if (roleError || allowed !== true) throw new Error("Administrator access required.");
    const { data: row } = await context.supabase.from("kit_quotes").select("crest_path,user_id").eq("id", data.id).single();
    if (!row?.crest_path || !ownsKitCrest(row.user_id, row.crest_path)) throw new Error("No crest found.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file, error } = await supabaseAdmin.storage.from("member-files").createSignedUrl(row.crest_path, 300);
    if (error || !file) throw new Error("The crest could not be opened.");
    return { url: file.signedUrl };
  });