import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getInsightsData } from "@/lib/dashboard";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const insights = await getInsightsData(user.id);
    return NextResponse.json(insights);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
