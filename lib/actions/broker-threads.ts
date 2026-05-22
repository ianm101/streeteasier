"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getGmailThread, getCombinedThreadBody } from "@/lib/gmail/client";
import { extractBrokerThreadInfo } from "@/lib/ai/apartment-parser";
import { revalidatePath } from "next/cache";
import { isBrokerThread } from "@/lib/utils/broker-utils";

/**
 * Create or update a broker thread from an email thread
 */
export async function createOrUpdateBrokerThread(
  threadId: string
): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Fetch the full Gmail thread
  const thread = await getGmailThread(session.user.id, threadId);
  if (!thread) {
    throw new Error("Thread not found");
  }

  // Get combined body for AI analysis
  const combinedBody = getCombinedThreadBody(thread);
  const firstMessage = thread.messages[0];

  // Extract broker info using AI
  const brokerInfo = await extractBrokerThreadInfo(
    combinedBody,
    thread.subject,
    firstMessage.from
  );

  // Check if broker thread already exists
  const existing = await prisma.brokerThread.findUnique({
    where: { emailThreadId: threadId },
  });

  if (existing) {
    // Update existing thread
    const updated = await prisma.brokerThread.update({
      where: { id: existing.id },
      data: {
        brokerName: brokerInfo.brokerName,
        brokerEmail: brokerInfo.brokerEmail,
        brokerPhone: brokerInfo.brokerPhone,
        brokerCompany: brokerInfo.brokerCompany,
        subject: thread.subject,
        lastEmailAt: thread.lastMessageDate,
        messageCount: thread.messageCount,
        summary: brokerInfo.summary,
        status: brokerInfo.status,
        mentionedAddresses: brokerInfo.mentionedAddresses,
        mentionedPrices: brokerInfo.mentionedPrices.filter((p): p is number => p !== null),
        userAsks: brokerInfo.userAsks,
        brokerAsks: brokerInfo.brokerAsks,
      },
    });

    revalidatePath("/broker-threads");
    return updated.id;
  } else {
    // Create new broker thread
    const created = await prisma.brokerThread.create({
      data: {
        emailThreadId: threadId,
        brokerName: brokerInfo.brokerName,
        brokerEmail: brokerInfo.brokerEmail,
        brokerPhone: brokerInfo.brokerPhone,
        brokerCompany: brokerInfo.brokerCompany,
        subject: thread.subject,
        lastEmailAt: thread.lastMessageDate,
        messageCount: thread.messageCount,
        summary: brokerInfo.summary,
        status: brokerInfo.status,
        mentionedAddresses: brokerInfo.mentionedAddresses,
        mentionedPrices: brokerInfo.mentionedPrices.filter((p): p is number => p !== null),
        userAsks: brokerInfo.userAsks,
        brokerAsks: brokerInfo.brokerAsks,
        addedById: session.user.id,
      },
    });

    revalidatePath("/broker-threads");
    return created.id;
  }
}

/**
 * Get all broker threads for the current user
 */
export async function getBrokerThreads() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const threads = await prisma.brokerThread.findMany({
    where: {
      addedById: session.user.id,
    },
    include: {
      apartments: {
        select: {
          id: true,
          address: true,
          unit: true,
          price: true,
          status: true,
        },
      },
      addedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      lastEmailAt: "desc",
    },
  });

  return threads;
}

/**
 * Get a single broker thread by ID
 */
export async function getBrokerThreadById(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const thread = await prisma.brokerThread.findUnique({
    where: { id },
    include: {
      apartments: {
        include: {
          rankings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      addedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return thread;
}

/**
 * Update broker thread status
 */
export async function updateBrokerThreadStatus(
  id: string,
  status: "active" | "cold" | "completed"
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.brokerThread.update({
    where: { id },
    data: { status },
  });

  revalidatePath("/broker-threads");
  revalidatePath(`/broker-threads/${id}`);
}

/**
 * Delete a broker thread
 */
export async function deleteBrokerThread(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.brokerThread.delete({
    where: { id },
  });

  revalidatePath("/broker-threads");
}
