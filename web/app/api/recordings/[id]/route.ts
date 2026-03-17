import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAudioObject } from "@/lib/minio";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const recording = await db.recording.findFirst({
      where: { id, userId: user.id },
      include: { focusSession: true },
    });

    if (!recording) {
      return jsonError("Recording not found.", 404);
    }

    return NextResponse.json(recording);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const recording = await db.recording.findFirst({
      where: { id, userId: user.id },
    });

    if (!recording) {
      return jsonError("Recording not found.", 404);
    }

    await deleteAudioObject(recording.objectKey);
    await db.recording.delete({ where: { id: recording.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
