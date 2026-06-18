import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });
  return Response.json(brands);
}

export async function POST(request: NextRequest) {
  const { name, slug, logoUrl, primaryColor, trustpilotUrl, headingText, subText } =
    await request.json();

  if (!name || !slug || !trustpilotUrl) {
    return Response.json(
      { error: "Naam, slug en Trustpilot URL zijn verplicht" },
      { status: 400 }
    );
  }

  const normalized = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");

  if (!normalized) {
    return Response.json({ error: "Ongeldige slug" }, { status: 400 });
  }

  const existing = await prisma.brand.findUnique({ where: { slug: normalized } });
  if (existing) {
    return Response.json({ error: "Deze slug bestaat al" }, { status: 400 });
  }

  const brand = await prisma.brand.create({
    data: {
      name,
      slug: normalized,
      logoUrl: logoUrl || "",
      primaryColor: primaryColor || "#000000",
      trustpilotUrl,
      headingText: headingText || undefined,
      subText: subText || undefined,
    },
  });

  return Response.json(brand, { status: 201 });
}
