import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";

export async function GET() {
  // Find pending emails that should be sent within the next 72 hours
  const cutoff = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const pendingEmails = await prisma.sentEmail.findMany({
    where: {
      status: "pending",
      scheduledAt: { lte: cutoff },
    },
    include: { brand: { include: { flowEmails: true } } },
    take: 50,
  });

  let sent = 0;
  let skipped = 0;

  for (const entry of pendingEmails) {
    // Check unsubscribe
    const unsubscribed = await prisma.unsubscribed.findUnique({
      where: { email: entry.customerEmail.toLowerCase() },
    });
    if (unsubscribed) {
      await prisma.sentEmail.update({
        where: { id: entry.id },
        data: { status: "unsubscribed" },
      });
      skipped++;
      continue;
    }

    const flowEmail = entry.brand.flowEmails.find(
      (fe) => fe.position === entry.flowPosition
    );
    if (!flowEmail || !flowEmail.enabled) {
      await prisma.sentEmail.update({
        where: { id: entry.id },
        data: { status: "skipped" },
      });
      skipped++;
      continue;
    }

    try {
      await sendReviewEmail({
        to: entry.customerEmail,
        customerName: entry.customerName,
        brandName: entry.brand.name,
        brandSlug: entry.brand.slug,
        logoUrl: entry.brand.logoUrl,
        primaryColor: entry.brand.primaryColor,
        language: entry.brand.language,
        emailSubject: flowEmail.subject,
        emailBody: flowEmail.body,
        scheduledAt: entry.scheduledAt,
      });

      await prisma.sentEmail.update({
        where: { id: entry.id },
        data: { status: "scheduled" },
      });
      sent++;
    } catch (error) {
      console.error("Cron email error:", error);
    }
  }

  return Response.json({ sent, skipped, total: pendingEmails.length });
}
