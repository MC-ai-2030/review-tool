import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flowType = request.nextUrl.searchParams.get("type") || "review";
  const emails = await prisma.flowEmail.findMany({
    where: { brandId: id, flowType },
    orderBy: { position: "asc" },
  });
  return Response.json(emails);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { emails, flowType = "review" } = await request.json() as {
    emails: { position: number; enabled: boolean; delayMinutes: number; subject: string; body: string }[];
    flowType?: string;
  };

  if (!emails || emails.length > 5) {
    return Response.json({ error: "Maximaal 5 e-mails per flow" }, { status: 400 });
  }

  // Delete existing for this flow type and recreate
  await prisma.flowEmail.deleteMany({ where: { brandId: id, flowType } });

  for (const email of emails) {
    await prisma.flowEmail.create({
      data: {
        brandId: id,
        flowType,
        position: email.position,
        enabled: email.enabled,
        delayMinutes: email.delayMinutes,
        subject: email.subject,
        body: email.body,
      },
    });
  }

  const result = await prisma.flowEmail.findMany({
    where: { brandId: id, flowType },
    orderBy: { position: "asc" },
  });

  return Response.json(result);
}
