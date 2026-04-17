import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, encodeSession } from "@/lib/auth/session";
import { SESSION_COOKIE } from "@/lib/auth/types";
import { getWorkspaceById } from "@/data/workspaces";

export async function POST(request: Request) {
  const body = (await request.json()) as { workspaceId?: string };
  const workspaceId = body.workspaceId ?? "";
  if (!getWorkspaceById(workspaceId)) {
    return NextResponse.json({ error: "Invalid workspace." }, { status: 400 });
  }

  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const session = decodeSession(raw);
  if (!session) {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }

  const next = { ...session, workspaceId };
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, encodeSession(next), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
