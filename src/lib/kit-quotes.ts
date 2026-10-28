import { z } from "zod";

export const kitRequestSchema = z.object({
  clubName: z.string().trim().min(2, "Enter your team name.").max(160),
  sport: z.enum(["Football", "Basketball", "Corporate"]),
  crestPath: z.string().max(300).nullable().default(null),
  primaryColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  secondaryColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  quantity: z.number().int().min(1).max(10000),
  roster: z.array(z.object({ name: z.string().trim().min(1).max(120), number: z.string().max(10), size: z.enum(["S", "M", "L", "XL", "XXL"]) })).max(1000),
  deliveryDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
  deliveryAddress: z.string().trim().min(3, "Enter your delivery address.").max(1000),
  notes: z.string().trim().max(3000),
}).refine((data) => data.roster.length <= data.quantity, { message: "Player count cannot be more than the number of kits.", path: ["quantity"] });

export type KitRequestInput = z.infer<typeof kitRequestSchema>;
export const kitReplySchema = z.object({ id: z.string().uuid(), usd: z.number().positive().max(1000000).refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001, "Use no more than two decimal places."), note: z.string().trim().min(1, "Add the quote details.").max(3000) });

export function ownsKitCrest(userId: string, path: string): boolean {
  return path.startsWith(`${userId}/kit-crests/`) && path.split("/").length === 3 && !path.includes("..") && !path.includes("\\");
}