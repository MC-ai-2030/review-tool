import { NextRequest } from "next/server";

const PASSWORD = process.env.APP_PASSWORD || "review2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== PASSWORD) {
    return Response.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  const response = Response.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `review-auth=${PASSWORD}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 30}`
  );
  return response;
}
