import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json().catch(() => ({}));
    const nextName = String(body.name ?? user.name).trim();
    const nextEmail = String(body.email ?? user.email).trim().toLowerCase();

    if (!nextName || !nextEmail) {
      return jsonError("Name and email are required.");
    }

    const existing = await db.user.findFirst({
      where: {
        email: nextEmail,
        NOT: { id: user.id },
      },
    });

    if (existing) {
      return jsonError("That email is already in use.");
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        name: nextName,
        email: nextEmail,
      },
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        plan: updatedUser.plan,
        avatarUrl: updatedUser.avatarUrl,
      },
    });
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
