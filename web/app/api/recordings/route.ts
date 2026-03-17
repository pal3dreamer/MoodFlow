import { RecordingStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteAudioObject } from "@/lib/minio";
import { jsonError, parseSearchParams } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const params = parseSearchParams(request.url);
    const search = params.get("search")?.trim() ?? "";
    const status = params.get("status") ?? "All";
    const sort = params.get("sort") ?? "newest";

    const items = await db.recording.findMany({
      where: {
        userId: user.id,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { transcript: { contains: search, mode: "insensitive" } },
                { topic: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(status !== "All" ? { status: status.toUpperCase() as RecordingStatus } : {}),
      },
      include: { focusSession: true },
      orderBy:
        sort === "oldest"
          ? { createdAt: "asc" }
          : sort === "longest"
            ? { durationSeconds: "desc" }
            : { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    const recordings = await db.recording.findMany({ where: { userId: user.id } });
    await Promise.all(recordings.map((item) => deleteAudioObject(item.objectKey)));
    await db.recording.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
