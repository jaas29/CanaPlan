import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const password = body.password as string;

  const correctPassword = process.env.AUTH_PASSWORD || "canaplan2026";

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("canaplan-auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ error: "Contrasena incorrecta" }, { status: 401 });
}
