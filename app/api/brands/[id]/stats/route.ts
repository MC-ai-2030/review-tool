import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const allEmails = await prisma.sentEmail.findMany({
    where: { brandId: id },
    select: {
      flowType: true,
      status: true,
      clicked: true,
      convertedRevenue: true,
      createdAt: true,
    },
  });

  function calcStats(flowType: string) {
    const emails = allEmails.filter((e) => e.flowType === flowType);
    const sent = emails.filter((e) => e.status === "scheduled" || e.status === "sent").length;
    const clicked = emails.filter((e) => e.clicked).length;
    const cancelled = emails.filter((e) => e.status === "cancelled").length;
    const pending = emails.filter((e) => e.status === "pending").length;
    const revenue = emails.reduce((sum, e) => sum + e.convertedRevenue, 0);
    const clickRate = sent > 0 ? Math.round((clicked / sent) * 100) : 0;

    // Last 7 days breakdown
    const now = new Date();
    const days: { date: string; sent: number; clicked: number; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayEmails = emails.filter((e) => e.createdAt.toISOString().slice(0, 10) === dateStr);
      days.push({
        date: dateStr,
        sent: dayEmails.filter((e) => e.status === "scheduled" || e.status === "sent").length,
        clicked: dayEmails.filter((e) => e.clicked).length,
        revenue: dayEmails.reduce((sum, e) => sum + e.convertedRevenue, 0),
      });
    }

    return { total: emails.length, sent, clicked, clickRate, cancelled, pending, revenue, days };
  }

  return Response.json({
    review: calcStats("review"),
    abandoned_checkout: calcStats("abandoned_checkout"),
  });
}
