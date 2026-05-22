import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApartments } from "@/lib/actions/apartments";
import { ApartmentGrid } from "@/components/ApartmentGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const apartments = await getApartments();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Your Apartments
            </h1>
            <p className="mt-2 text-zinc-600">
              Track and manage apartments you're interested in
            </p>
          </div>
          <Link href="/apartments/new">
            <Button size="lg" className="gap-2 shadow-md hover:shadow-lg transition-shadow">
              <Plus className="h-5 w-5" />
              Add Apartment
            </Button>
          </Link>
        </div>

        <ApartmentGrid apartments={apartments} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
