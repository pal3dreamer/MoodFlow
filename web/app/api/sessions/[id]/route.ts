import { FocusSessionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const session = await db.focusSession.findFirst({
      where: { id, userId: user.id },
      include: { recordings: true },
    });

    if (!session) {
      return jsonError("Session not found.", 404);
    }

    return NextResponse.json(session);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const session = await db.focusSession.findFirst({
      where: { id, userId: user.id },
    });

    if (!session) {
      return jsonError("Session not found.", 404);
    }

    const endedAt = body.status === "completed" ? new Date() : body.endedAt ? new Date(body.endedAt) : session.endedAt;
    const durationSeconds =
      endedAt && session.startedAt
        ? Math.max(Math.round((endedAt.getTime() - session.startedAt.getTime()) / 1000), session.durationSeconds)
        : session.durationSeconds;

    const updated = await db.focusSession.update({
      where: { id: session.id },
      data: {
        title: body.title ?? session.title,
        topic: body.topic ?? session.topic,
        status:
          body.status === "completed"
            ? FocusSessionStatus.COMPLETED
            : body.status === "cancelled"
              ? FocusSessionStatus.CANCELLED
              : session.status,
        endedAt,
        durationSeconds,
      },
    });

    return NextResponse.json(updated);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
