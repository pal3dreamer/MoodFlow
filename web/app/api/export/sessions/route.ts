import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const sessions = await db.focusSession.findMany({
      where: { userId: user.id },
      include: { recordings: true },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ sessions });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
