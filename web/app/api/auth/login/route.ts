import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (!email || !password) {
      return jsonError("Email and password are required.");
    }

    const user = await loginUser(email, password);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Login failed.", 401);
  }
}
