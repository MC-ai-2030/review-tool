import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ReviewClient from "./review-client";

export default async function ReviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await prisma.brand.findUnique({ where: { slug } });

  if (!brand) notFound();

  return <ReviewClient brand={brand} />;
}
