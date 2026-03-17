import { FocusSessionStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError, parseSearchParams } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const params = parseSearchParams(request.url);
    const search = params.get("search")?.trim() ?? "";
    const emotion = params.get("emotion") ?? "All";
    const status = params.get("status") ?? "All";
    const page = Number(params.get("page") ?? "1");
    const pageSize = Number(params.get("pageSize") ?? "10");
    const sort = params.get("sort") ?? "newest";

    const items = await db.focusSession.findMany({
      where: {
        userId: user.id,
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
        ...(status !== "All"
          ? {
              status: status.toUpperCase() as FocusSessionStatus,
            }
          : {}),
        ...(emotion !== "All"
          ? {
              OR: [
                { startEmotion: emotion },
                { endEmotion: emotion },
                { dominantEmotion: emotion },
              ],
            }
          : {}),
      },
      orderBy:
        sort === "highest"
          ? { score: "desc" }
          : sort === "oldest"
            ? { startedAt: "asc" }
            : { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await db.focusSession.count({
      where: {
        userId: user.id,
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
        ...(status !== "All"
          ? {
              status: status.toUpperCase() as FocusSessionStatus,
            }
          : {}),
      },
    });

    return NextResponse.json({ items, total, page, pageSize });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const title = String(body.title ?? "New Session");

    const active = await db.focusSession.findFirst({
      where: { userId: user.id, status: FocusSessionStatus.ACTIVE },
    });

    if (active) {
      return jsonError("You already have an active session.");
    }

    const session = await db.focusSession.create({
      data: {
        userId: user.id,
        title,
        topic: String(body.topic ?? "") || null,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await db.focusSession.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
