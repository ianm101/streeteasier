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
    <div className="p-8 max-w-4xl mx-auto">
      <InboxHeader emailCount={emails.length} highRelevanceCount={highRelevanceCount} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-900 mb-2">Error Loading Emails</h3>
          <p className="text-sm text-red-700">{error}</p>
          <p className="text-xs text-red-600 mt-2">
            Make sure you've authorized Gmail access by signing in with Google and
            that the Gmail API is enabled in your Google Cloud Console.
          </p>
        </div>
      )}

      <EmailInboxList emails={emails} />
    </div>
  );
}
