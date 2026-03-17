import { NextRequest, NextResponse } from "next/server";
import { loginUser, registerUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "");
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (!email || !password) {
      return jsonError("Email and password are required.");
    }

    const user = await registerUser({ name, email, password });
    await loginUser(user.email, password);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Registration failed.");
  }
}
