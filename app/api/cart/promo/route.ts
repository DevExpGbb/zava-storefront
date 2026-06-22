import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cartItemSchema, totalize } from "@/lib/cart";

const RequestSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(200),
  promoCode: z.string().max(50).nullable().optional(),
  region: z.string().min(2).max(10),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const { items, promoCode, region } = parsed.data;
  const code = promoCode ?? null;

  const totals = totalize(items, code, region);

  return NextResponse.json({
    totals,
    promoCode: code,
    promoApplied: totals.discountCents > 0,
  });
}
