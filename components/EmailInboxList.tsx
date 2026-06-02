"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Mail, Filter, ArrowUpDown } from "lucide-react";
import {
  parseEmailWithAI,
  createApartmentFromParsedData,
  type ParsedEmail,
} from "@/lib/actions/inbox";
import { EditParsedDataDialog } from "./EditParsedDataDialog";
import { InboxEmailCard } from "./InboxEmailCard";

interface EmailInboxListProps {
  emails: ParsedEmail[];
}

type SortOption = "newest" | "oldest";

export function EmailInboxList({ emails: initialEmails }: EmailInboxListProps) {
  const router = useRouter();
  const [emails, setEmails] = useState(initialEmails);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<ParsedEmail | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const handleParseEmail = async (emailId: string) => {
    setParsingId(emailId);
    try {
      const parsedData = await parseEmailWithAI(emailId);

      // Update the email in state with parsed data
      setEmails((prev) =>
        prev.map((email) =>
          email.id === emailId ? { ...email, parsedData } : email
        )
      );
    } catch (error) {
      console.error("Error parsing email:", error);
      alert(
        `Failed to parse email: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setParsingId(null);
    }
  };

  const handleCreateApartment = async (
    emailId: string,
    parsedData: ParsedEmail["parsedData"]
  ) => {
    if (!parsedData) return;

    setCreatingId(emailId);
    try {
      // Find the email to get body and subject
      const email = emails.find((e) => e.id === emailId);
      const apartmentId = await createApartmentFromParsedData(
        parsedData,
        emailId,
        email?.body,
        email?.subject
      );
      router.push(`/apartments/${apartmentId}`);
    } catch (error) {
      console.error("Error creating apartment:", error);
      alert(
        `Failed to create apartment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setCreatingId(null);
    }
  };

  // Sort emails based on selected option
  const sortedEmails = useMemo(() => {
    const sorted = [...emails].sort((a, b) => {
      if (sortBy === "newest") {
        return b.date.getTime() - a.date.getTime();
      } else {
        return a.date.getTime() - b.date.getTime();
      }
    });
    return sorted;
  }, [emails, sortBy]);

  // Separate emails by relevance score
  const highRelevanceEmails = sortedEmails.filter((email) => (email.relevanceScore || 0) >= 40);
  const lowRelevanceEmails = sortedEmails.filter((email) => (email.relevanceScore || 0) < 40);

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      {emails.length > 0 && (
        <div className="flex items-center justify-between bg-white border-2 border-black p-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            <span className="font-bold uppercase tracking-tight text-sm">Sort By:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("newest")}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-tight transition-colors ${
                sortBy === "newest"
                  ? "bg-black text-white"
                  : "bg-white text-black border-2 border-black hover:bg-zinc-100"
              }`}
            >
              Newest First
            </button>
            <button
              onClick={() => setSortBy("oldest")}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-tight transition-colors ${
                sortBy === "oldest"
                  ? "bg-black text-white"
                  : "bg-white text-black border-2 border-black hover:bg-zinc-100"
              }`}
            >
              Oldest First
            </button>
          </div>
        </div>
      )}

      {emails.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Mail className="h-12 w-12 mx-auto text-zinc-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Apartment Emails Found</h3>
          <p className="text-zinc-600 max-w-md mx-auto">
            We couldn't find any emails about apartments. Try sending yourself an
            email with apartment details or StreetEasy links to test this feature.
          </p>
        </div>
      ) : (
        <>
          {/* High Relevance Section */}
          {highRelevanceEmails.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-md">
                  <Filter className="h-5 w-5" />
                  <h2 className="font-semibold">
                    Likely Apartment Listings ({highRelevanceEmails.length})
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                {highRelevanceEmails.map((email) => (
                  <InboxEmailCard
                    key={email.id}
                    email={email}
                    isHighRelevance={true}
                    onParse={handleParseEmail}
                    onQuickAdd={handleCreateApartment}
                    onReviewAdd={setEditingEmail}
                    parsingId={parsingId}
                    creatingId={creatingId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Low Relevance Section */}
          {lowRelevanceEmails.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-zinc-100 text-zinc-600 px-4 py-2 rounded-lg">
                  <Mail className="h-4 w-4" />
                  <h2 className="font-medium text-sm">
                    Other Emails ({lowRelevanceEmails.length})
                  </h2>
                </div>
                <p className="text-xs text-zinc-500">
                  Click to expand
                </p>
              </div>

              <div className="space-y-2">
                {lowRelevanceEmails.map((email) => (
                  <InboxEmailCard
                    key={email.id}
                    email={email}
                    isHighRelevance={false}
                    onParse={handleParseEmail}
                    onQuickAdd={handleCreateApartment}
                    onReviewAdd={setEditingEmail}
                    parsingId={parsingId}
                    creatingId={creatingId}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingEmail && editingEmail.parsedData && (
        <EditParsedDataDialog
          emailId={editingEmail.id}
          parsedData={editingEmail.parsedData}
          onClose={() => setEditingEmail(null)}
        />
      )}
    </div>
  );
}
