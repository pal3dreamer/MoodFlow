import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    const preferences = await db.userPreference.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(preferences);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUser();
    const body = await request.json();
    const preferences = await db.userPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        ...body,
      },
      update: body,
    });

    return NextResponse.json(preferences);
  } catch {
    return jsonError("Unauthorized", 401);
  }
}
