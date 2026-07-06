import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { to, subject, body } = await request.json();

  if (!to) {
    return Response.json({ error: "E-mailadres is verplicht" }, { status: 400 });
  }

  const brand = await prisma.brand.findUniqueOrThrow({ where: { id } });

  try {
    await sendReviewEmail({
      to,
      customerName: "Test Klant",
      brandName: brand.name,
      brandSlug: brand.slug,
      logoUrl: brand.logoUrl,
      primaryColor: brand.primaryColor,
      language: brand.language,
      emailSubject: subject || "",
      emailBody: body || "",
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Verzenden mislukt" },
      { status: 500 }
    );
  }
}
