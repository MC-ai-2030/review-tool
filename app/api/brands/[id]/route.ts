import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();

  const brand = await prisma.brand.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug.toLowerCase().replace(/[^a-z0-9-]/g, "") }),
      ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
      ...(data.primaryColor !== undefined && { primaryColor: data.primaryColor }),
      ...(data.trustpilotUrl !== undefined && { trustpilotUrl: data.trustpilotUrl }),
      ...(data.headingText !== undefined && { headingText: data.headingText }),
      ...(data.subText !== undefined && { subText: data.subText }),
    },
  });

  return Response.json(brand);
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.brand.delete({ where: { id } });
  return Response.json({ success: true });
}
