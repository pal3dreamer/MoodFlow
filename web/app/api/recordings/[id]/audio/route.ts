import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { downloadAudioObject } from "@/lib/minio";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
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

    const audio = await downloadAudioObject(recording.objectKey);

    return new NextResponse(audio, {
      headers: {
        "Content-Type": recording.mimeType || "application/octet-stream",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
