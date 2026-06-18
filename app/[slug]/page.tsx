import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "@/app/lib/translations";
import ReviewClient from "./review-client";

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });

  if (!brand) notFound();

  const t = getTranslations(brand.language);

  return <ReviewClient brand={brand} t={t} />;
}
