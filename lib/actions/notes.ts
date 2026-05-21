"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addNote(apartmentId: string, body: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!body.trim()) {
    throw new Error("Note cannot be empty");
  }

  await prisma.note.create({
    data: {
      apartmentId,
      userId: session.user.id,
      body: body.trim(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/apartments/${apartmentId}`);
}

export async function deleteNote(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify the note belongs to the user
  const note = await prisma.note.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    throw new Error("Note not found");
  }

  if (note.userId !== session.user.id) {
    throw new Error("Unauthorized - you can only delete your own notes");
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  revalidatePath("/dashboard");
  revalidatePath(`/apartments/${note.apartmentId}`);
}
