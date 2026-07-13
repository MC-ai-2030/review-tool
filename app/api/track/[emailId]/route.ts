import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ emailId: string }> }) {
  const { emailId } = await params;
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return Response.redirect("https://reviews-verified.com");
  }

  // Track click (fire-and-forget)
  prisma.sentEmail.update({
    where: { id: emailId },
    data: { clicked: true, clickedAt: new Date() },
  }).catch(() => {});

  return Response.redirect(url);
}
