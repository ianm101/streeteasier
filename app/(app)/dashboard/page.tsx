import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApartments } from "@/lib/actions/apartments";
import { ApartmentsTable } from "@/components/ApartmentsTable";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const apartments = await getApartments();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Apartments</h1>
          <p className="mt-2 text-zinc-600">
            Track and manage apartments you're interested in
          </p>
        </div>
        <Link href="/apartments/new">
          <Button>Add Apartment</Button>
        </Link>
      </div>

      <ApartmentsTable apartments={apartments} currentUserId={session.user.id} />
    </div>
  );
}
