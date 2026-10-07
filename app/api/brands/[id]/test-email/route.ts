import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { to, subject, body, flowType, blocks } = await request.json();

  if (!to) {
    return Response.json({ error: "E-mailadres is verplicht" }, { status: 400 });
  }

  const brand = await prisma.brand.findUniqueOrThrow({ where: { id } });

  const isCheckout = flowType === "abandoned_checkout";
  const dummyLineItems = isCheckout ? [
    { title: "Classic Sneakers", price: "89.95", quantity: 1, variantTitle: "42 / White", imageUrl: "" },
    { title: "Cotton T-Shirt", price: "34.95", quantity: 2, variantTitle: "M / Black", imageUrl: "" },
  ] : undefined;

  try {
    const result = await sendReviewEmail({
      to,
      customerName: "Test Klant",
      brandName: brand.name,
      brandSlug: brand.slug,
      logoUrl: brand.logoUrl,
      primaryColor: brand.primaryColor,
      language: brand.language,
      emailSubject: subject || "",
      emailBody: body || "",
      senderEmail: brand.senderEmail || undefined,
      senderName: brand.senderName || undefined,
      flowType: flowType || "review",
      checkoutUrl: isCheckout ? "https://shop.example.com/checkout/recover/test" : undefined,
      lineItems: dummyLineItems,
      currency: isCheckout ? "EUR" : undefined,
      emailBlocks: blocks || undefined,
    });

    const resendResult = result as { data?: { id?: string } | null; error?: { message?: string; name?: string } | null };
    if (resendResult.error) {
      console.error("Resend error:", resendResult.error);
      return Response.json(
        { error: `Resend: ${resendResult.error.message || resendResult.error.name || "onbekende fout"}` },
        { status: 500 }
      );
    }

    return Response.json({ success: true, emailId: resendResult.data?.id });
  } catch (error) {
    console.error("Test email error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Verzenden mislukt" },
      { status: 500 }
    );
  }
}
