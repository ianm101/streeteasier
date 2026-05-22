import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { fetchApartmentEmails, type ParsedEmail } from "@/lib/actions/inbox";
import { EmailInboxList } from "@/components/EmailInboxList";
import { InboxHeader } from "@/components/InboxHeader";

export default async function InboxPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  let emails: ParsedEmail[] = [];
  let error: string | null = null;

  try {
    emails = await fetchApartmentEmails();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch emails";
    emails = [];
  }

  const highRelevanceCount = emails.filter((email) => (email.relevanceScore || 0) >= 40).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        <InboxHeader emailCount={emails.length} highRelevanceCount={highRelevanceCount} />

        {error && (
          <div className="bg-red-50 border-l-4 border-red-600 p-6 mb-8">
            <h3 className="font-bold uppercase tracking-wide mb-2">Error Loading Emails</h3>
            <p className="text-sm mb-2">{error}</p>
            <p className="text-xs text-gray-600 uppercase tracking-wide">
              Authorize Gmail access by signing in with Google
            </p>
          </div>
        )}

        <EmailInboxList emails={emails} />
      </div>
    </div>
  );
}
