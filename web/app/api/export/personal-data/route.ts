import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const [preferences, sessions, recordings] = await Promise.all([
      db.userPreference.findUnique({ where: { userId: user.id } }),
      db.focusSession.findMany({ where: { userId: user.id }, orderBy: { startedAt: "desc" } }),
      db.recording.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    ]);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
      preferences,
      sessions,
      recordings,
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
