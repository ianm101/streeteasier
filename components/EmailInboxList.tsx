"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Mail, ExternalLink, Sparkles, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  parseEmailWithAI,
  createApartmentFromParsedData,
  type ParsedEmail,
} from "@/lib/actions/inbox";
import { EditParsedDataDialog } from "./EditParsedDataDialog";

interface EmailInboxListProps {
  emails: ParsedEmail[];
}

export function EmailInboxList({ emails: initialEmails }: EmailInboxListProps) {
  const router = useRouter();
  const [emails, setEmails] = useState(initialEmails);
  const [parsingId, setParsingId] = useState<string | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<ParsedEmail | null>(null);

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
      const apartmentId = await createApartmentFromParsedData(
        parsedData,
        emailId
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

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  return (
    <div className="space-y-4">
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
        emails.map((email) => (
          <div
            key={email.id}
            className="bg-white rounded-lg border p-6 space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Email Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{email.subject}</h3>
                <p className="text-sm text-zinc-600 mt-1">
                  From: {email.from}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  {formatDistanceToNow(email.date, { addSuffix: true })}
                </p>
              </div>

              {email.hasStreetEasyLink && (
                <Badge className="bg-blue-100 text-blue-800">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  StreetEasy
                </Badge>
              )}
            </div>

            {/* Email Snippet */}
            <p className="text-sm text-zinc-700 line-clamp-2">{email.snippet}</p>

            {/* StreetEasy URLs */}
            {email.streetEasyUrls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {email.streetEasyUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {new URL(url).pathname}
                  </a>
                ))}
              </div>
            )}

            {/* Parsed Data */}
            {email.parsedData && (
              <div className="bg-zinc-50 rounded-lg p-4 space-y-3 border border-zinc-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    AI Extracted Data
                  </h4>
                  <Badge className={getConfidenceColor(email.parsedData.confidence)}>
                    {email.parsedData.confidence} confidence
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {email.parsedData.address && (
                    <div>
                      <span className="text-zinc-600">Address:</span>
                      <p className="font-medium">{email.parsedData.address}</p>
                    </div>
                  )}
                  {email.parsedData.neighborhood && (
                    <div>
                      <span className="text-zinc-600">Neighborhood:</span>
                      <p className="font-medium">{email.parsedData.neighborhood}</p>
                    </div>
                  )}
                  {email.parsedData.price && (
                    <div>
                      <span className="text-zinc-600">Rent:</span>
                      <p className="font-medium">
                        ${email.parsedData.price.toLocaleString()}/mo
                      </p>
                    </div>
                  )}
                  {email.parsedData.beds && (
                    <div>
                      <span className="text-zinc-600">Beds/Baths:</span>
                      <p className="font-medium">
                        {email.parsedData.beds} / {email.parsedData.baths || "?"}
                      </p>
                    </div>
                  )}
                  {email.parsedData.brokerName && (
                    <div>
                      <span className="text-zinc-600">Broker:</span>
                      <p className="font-medium">{email.parsedData.brokerName}</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-600 italic">
                  {email.parsedData.extractedText}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!email.parsedData ? (
                <Button
                  onClick={() => handleParseEmail(email.id)}
                  disabled={parsingId === email.id}
                  variant="outline"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {parsingId === email.id ? "Parsing..." : "Parse with AI"}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setEditingEmail(email)}
                    disabled={!email.parsedData?.address}
                    size="sm"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Review & Add
                  </Button>
                  <Button
                    onClick={() =>
                      handleCreateApartment(email.id, email.parsedData)
                    }
                    disabled={
                      creatingId === email.id || !email.parsedData?.address
                    }
                    variant="outline"
                    size="sm"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {creatingId === email.id
                      ? "Creating..."
                      : "Quick Add"}
                  </Button>
                  <Button
                    onClick={() => handleParseEmail(email.id)}
                    disabled={parsingId === email.id}
                    variant="outline"
                    size="sm"
                  >
                    Re-parse
                  </Button>
                </>
              )}
            </div>
          </div>
        ))
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
