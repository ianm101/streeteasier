"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Sparkles, Check, ExternalLink, MapPin, DollarSign, Bed, Bath } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { parseEmailWithAI, createApartmentFromParsedData, type ParsedEmail } from "@/lib/actions/inbox";

interface LikelyApartmentsSectionProps {
  emails: ParsedEmail[];
}

export function LikelyApartmentsSection({ emails }: LikelyApartmentsSectionProps) {
  const router = useRouter();
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [localEmails, setLocalEmails] = useState(emails);

  const handleParse = async (emailId: string) => {
    setParsingId(emailId);
    try {
      const parsedData = await parseEmailWithAI(emailId);

      // Update local state with parsed data
      setLocalEmails((prev) =>
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

  const handleQuickAdd = async (emailId: string) => {
    const email = localEmails.find((e) => e.id === emailId);
    if (!email?.parsedData) return;

    setCreatingId(emailId);
    try {
      const apartmentId = await createApartmentFromParsedData(
        email.parsedData,
        emailId,
        email.body,
        email.subject,
        email.threadId  // Pass thread ID for tracking updates
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

  if (localEmails.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-50 border-2 border-black p-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold uppercase tracking-tight mb-2">Inbox Prospects</h2>
        <p className="text-sm uppercase tracking-wide text-gray-600">
          {localEmails.length} Potential {localEmails.length === 1 ? "Listing" : "Listings"} From Email
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
        {localEmails.map((email) => (
          <div
            key={email.id}
            className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors"
          >
            {/* Header */}
            <div className="mb-4 pb-4 border-b-2 border-black">
              <h3 className="font-bold uppercase text-sm tracking-tight line-clamp-2 mb-2">
                {email.subject}
              </h3>
              {email.hasStreetEasyLink && (
                <Badge className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                  StreetEasy
                </Badge>
              )}
            </div>

            {/* From */}
            <p className="text-xs font-medium uppercase tracking-wide text-gray-600 mb-1">
              {email.from}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {formatDistanceToNow(email.date, { addSuffix: true })}
            </p>

            {/* Parsed Data */}
            {email.parsedData ? (
              <div className="bg-gray-100 border-l-4 border-black p-4 mb-4 space-y-2">
                {email.parsedData.address && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="font-medium text-zinc-900">{email.parsedData.address}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-zinc-700">
                  {email.parsedData.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>${email.parsedData.price.toLocaleString()}/mo</span>
                    </div>
                  )}
                  {email.parsedData.beds && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4 text-zinc-500" />
                      <span>{email.parsedData.beds} bd</span>
                    </div>
                  )}
                  {email.parsedData.baths && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4 text-zinc-500" />
                      <span>{email.parsedData.baths} ba</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-600 line-clamp-2 mb-3">
                {email.snippet}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!email.parsedData ? (
                <Button
                  onClick={() => handleParse(email.id)}
                  disabled={parsingId === email.id}
                  className="flex-1 bg-black text-white hover:bg-gray-900 py-6 text-xs font-bold uppercase tracking-wide"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {parsingId === email.id ? "Parsing..." : "Parse"}
                </Button>
              ) : (
                <Button
                  onClick={() => handleQuickAdd(email.id)}
                  disabled={creatingId === email.id || !email.parsedData?.address}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 py-6 text-xs font-bold uppercase tracking-wide"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {creatingId === email.id ? "Adding..." : "Quick Add"}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button
          onClick={() => router.push("/inbox")}
          className="bg-black text-white hover:bg-gray-900 px-8 py-6 text-sm font-bold uppercase tracking-wide"
        >
          View All Emails
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
