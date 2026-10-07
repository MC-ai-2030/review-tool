import { prisma } from "@/app/lib/prisma";
import { sendReviewEmail } from "@/app/lib/email";
import { NextRequest } from "next/server";

const RESEND_MAX_SCHEDULE_MS = 72 * 60 * 60 * 1000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { email, name, flowType = "basic", vars } = await request.json() as {
    email: string;
    name?: string;
    flowType?: string;
    vars?: Record<string, string>;
  };

  if (!email) {
    return Response.json({ error: "email is required" }, { status: 400 });
  }

  const brand = await prisma.brand.findFirst({
    where: { id, emailEnabled: true },
    include: {
      flowEmails: {
        where: { flowType, enabled: true },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!brand) {
    return Response.json({ error: "brand not found or email disabled" }, { status: 404 });
  }

  // Check unsubscribe
  const unsubscribed = await prisma.unsubscribed.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (unsubscribed) {
    return Response.json({ skipped: true, reason: "unsubscribed" });
  }

  const customerName = name || "";
  const triggerId = `${flowType}_${Date.now()}`;
  const now = Date.now();
  const scheduled: { position: number; scheduledAt: string }[] = [];

  for (const flowEmail of brand.flowEmails) {
    const scheduledAt = new Date(now + flowEmail.delayMinutes * 60 * 1000);
    const delayMs = flowEmail.delayMinutes * 60 * 1000;

    if (delayMs <= RESEND_MAX_SCHEDULE_MS) {
      try {
        const sentEmail = await prisma.sentEmail.create({
          data: {
            brandId: brand.id,
            orderId: triggerId,
            flowType,
            flowPosition: flowEmail.position,
            customerEmail: email,
            customerName,
            scheduledAt,
            status: "scheduled",
          },
        });

        const result = await sendReviewEmail({
          to: email,
          customerName,
          brandName: brand.name,
          brandSlug: brand.slug,
          logoUrl: brand.logoUrl,
          primaryColor: brand.primaryColor,
          language: brand.language,
          emailSubject: flowEmail.subject,
          emailBody: flowEmail.body,
          senderEmail: brand.senderEmail || undefined,
          senderName: brand.senderName || undefined,
          trackingId: sentEmail.id,
          scheduledAt,
          flowType,
          emailBlocks: flowEmail.blocks || undefined,
          customVars: vars,
        });

        const resendEmailId = (result as { data?: { id?: string } })?.data?.id || "";
        await prisma.sentEmail.update({
          where: { id: sentEmail.id },
          data: { resendEmailId },
        });

        scheduled.push({ position: flowEmail.position, scheduledAt: scheduledAt.toISOString() });
      } catch (error) {
        console.error(`Trigger flow ${flowType} email ${flowEmail.position} error:`, error);
      }
    } else {
      await prisma.sentEmail.create({
        data: {
          brandId: brand.id,
          orderId: triggerId,
          flowType,
          flowPosition: flowEmail.position,
          customerEmail: email,
          customerName,
          scheduledAt,
          status: "pending",
        },
      });
      scheduled.push({ position: flowEmail.position, scheduledAt: scheduledAt.toISOString() });
    }
  }

  return Response.json({ success: true, flow: flowType, email, scheduled });
}
