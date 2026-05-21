import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddApartmentForm } from "@/components/AddApartmentForm";

export default async function NewApartmentPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Get all users for point person selection
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Add New Apartment</h1>
        <p className="mt-2 text-zinc-600">
          Enter the details of the apartment you found
        </p>
      </div>

      <div className="bg-white rounded-lg border p-6">
        <AddApartmentForm users={users} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
