import { NextResponse } from "next/server";
import type { SessionPayload, UserRole } from "@/lib/auth/types";
import { SESSION_COOKIE } from "@/lib/auth/types";
import { encodeSession } from "@/lib/auth/session";
import { getWorkspaceById } from "@/data/workspaces";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    name?: string;
    workspaceId?: string;
    role?: UserRole;
  };

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password || password.length < 4) {
    return NextResponse.json({ error: "Valid email and password (4+ chars) required." }, { status: 400 });
  }

  const workspaceId = body.workspaceId ?? "ws-acme";
  if (!getWorkspaceById(workspaceId)) {
    return NextResponse.json({ error: "Invalid workspace." }, { status: 400 });
  }

  const role: UserRole =
    body.role === "viewer" || body.role === "editor" || body.role === "admin" ? body.role : "editor";

  const payload: SessionPayload = {
    email,
    name: (body.name ?? "New user").slice(0, 80),
    role,
    workspaceId,
  };

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, encodeSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
