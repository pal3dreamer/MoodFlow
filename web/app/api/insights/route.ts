import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getInsightsData } from "@/lib/dashboard";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await getInsightsData(user.id);
    return NextResponse.json(data);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
