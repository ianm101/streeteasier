import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getApartments } from "@/lib/actions/apartments";
import { fetchApartmentEmails } from "@/lib/actions/inbox";
import { ApartmentGrid } from "@/components/ApartmentGrid";
import { LikelyApartmentsSection } from "@/components/LikelyApartmentsSection";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const apartments = await getApartments();

  // Fetch high-relevance emails that haven't been converted to apartments yet
  let likelyEmails: Awaited<ReturnType<typeof fetchApartmentEmails>> = [];
  try {
    const allEmails = await fetchApartmentEmails();
    // Filter for high-relevance emails (score >= 40) that don't match existing apartments
    likelyEmails = allEmails
      .filter((email) => (email.relevanceScore || 0) >= 40)
      .filter((email) => {
        // Check if email subject/snippet contains an address that matches an existing apartment
        const emailText = `${email.subject} ${email.snippet}`.toLowerCase();
        return !apartments.some((apt) => {
          const address = apt.address.toLowerCase();
          return emailText.includes(address.split(" ")[0]); // Basic check for street number
        });
      })
      .slice(0, 6); // Limit to 6 emails
  } catch (error) {
    console.error("Error fetching likely apartments:", error);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Swiss Grid Header */}
        <div className="border-b-2 border-black pb-8 mb-12">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-6xl font-bold mb-2 tracking-tight uppercase">
                Apartments
              </h1>
              <p className="text-base text-gray-600 uppercase tracking-wide">
                {apartments.length} Active Listings
              </p>
            </div>
            <Link href="/apartments/new">
              <Button size="lg" className="bg-black text-white hover:bg-gray-900 px-8 py-6 text-sm font-bold uppercase tracking-wide">
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            </Link>
          </div>
        </div>

        <ApartmentGrid apartments={apartments as any} currentUserId={session.user.id} />

        {/* Likely Apartments from Inbox */}
        {likelyEmails.length > 0 && (
          <div className="mt-16 pt-16 border-t-2 border-black">
            <LikelyApartmentsSection emails={likelyEmails} />
          </div>
        )}
      </div>
    </div>
  );
}
