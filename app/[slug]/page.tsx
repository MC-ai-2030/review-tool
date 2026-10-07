import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "@/app/lib/translations";
import ReviewClient from "./review-client";

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Only select public fields: this object is serialized into the page HTML.
  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { name: true, logoUrl: true, primaryColor: true, trustpilotUrl: true, language: true },
  });

  if (!brand) notFound();

  const t = getTranslations(brand.language);

  return <ReviewClient brand={brand} t={t} />;
}
