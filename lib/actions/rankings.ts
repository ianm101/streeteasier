"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function setRanking(apartmentId: string, rank: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Upsert: create or update the ranking
  await prisma.ranking.upsert({
    where: {
      apartmentId_userId: {
        apartmentId,
        userId: session.user.id,
      },
    },
    create: {
      apartmentId,
      userId: session.user.id,
      rank,
    },
    update: {
      rank,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/apartments/${apartmentId}`);
}

export async function getUserRanking(apartmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const ranking = await prisma.ranking.findUnique({
    where: {
      apartmentId_userId: {
        apartmentId,
        userId: session.user.id,
      },
    },
  });

  return ranking?.rank || null;
}
