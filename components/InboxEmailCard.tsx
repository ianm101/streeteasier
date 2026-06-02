"use client";

import { formatDistanceToNow } from "date-fns";
import { Mail, ExternalLink, Sparkles, Check, Edit, ChevronDown, ChevronUp, Home, Bed, Bath, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParsedEmail } from "@/lib/actions/inbox";
import { useState } from "react";
import Image from "next/image";

interface InboxEmailCardProps {
  email: ParsedEmail;
  isHighRelevance: boolean;
  onParse: (emailId: string) => void;
  onQuickAdd: (emailId: string, parsedData: any) => void;
  onReviewAdd: (email: ParsedEmail) => void;
  parsingId: string | null;
  creatingId: string | null;
}

export function InboxEmailCard({
  email,
  isHighRelevance,
  onParse,
  onQuickAdd,
  onReviewAdd,
  parsingId,
  creatingId,
}: InboxEmailCardProps) {
  const [isExpanded, setIsExpanded] = useState(isHighRelevance);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "high":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getRelevanceBadge = () => {
    const score = email.relevanceScore || 0;
    if (score >= 60) {
      return (
        <Badge className="bg-green-100 text-green-800 border border-green-200">
          High Match
        </Badge>
      );
    } else if (score >= 30) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-200">
          Possible Match
        </Badge>
      );
    }
    return null;
  };

  // Compact view for low relevance emails
  if (!isHighRelevance && !isExpanded) {
    return (
      <div
        onClick={() => setIsExpanded(true)}
        className="bg-white rounded-lg border border-zinc-200 p-3 hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <h4 className="font-medium text-sm truncate">{email.subject}</h4>
            </div>
            <p className="text-xs text-zinc-500 truncate">{email.from}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 whitespace-nowrap">
              {formatDistanceToNow(email.date, { addSuffix: true })}
            </span>
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          </div>
        </div>
      </div>
    );
  }

  // Full view for high relevance or expanded emails
  return (
    <div className={`bg-white rounded-xl border ${
      isHighRelevance ? 'border-blue-200 shadow-md' : 'border-zinc-200'
    } overflow-hidden transition-all`}>
      {/* Header */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-semibold text-lg">{email.subject}</h3>
              {getRelevanceBadge()}
              {email.hasStreetEasyLink && (
                <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  StreetEasy
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-600">
              <span>From: {email.from}</span>
              <span>•</span>
              <span>{formatDistanceToNow(email.date, { addSuffix: true })}</span>
            </div>
          </div>

          {!isHighRelevance && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-zinc-100 rounded"
            >
              <ChevronUp className="h-5 w-5 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Email Snippet */}
        <p className="text-sm text-zinc-700 line-clamp-2">{email.snippet}</p>

        {/* Extracted Listings from HTML */}
        {email.extractedListings && email.extractedListings.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-black uppercase tracking-wide">
              {email.extractedListings.length} {email.extractedListings.length === 1 ? 'Listing' : 'Listings'} in Email:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {email.extractedListings.map((listing, idx) => (
                <a
                  key={idx}
                  href={listing.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-3 p-3 border-2 border-black bg-white hover:bg-zinc-50 transition-colors group"
                >
                  {/* Listing Image */}
                  {listing.imageUrl && (
                    <div className="relative w-24 h-24 flex-shrink-0 bg-zinc-100 border-2 border-black">
                      <Image
                        src={listing.imageUrl}
                        alt={listing.address}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>
                  )}

                  {/* Listing Details */}
                  <div className="flex-1 min-w-0">
                    {/* Address */}
                    <h4 className="font-bold text-sm uppercase tracking-tight mb-1">
                      {listing.address} {listing.unit && `#${listing.unit}`}
                    </h4>

                    {/* Neighborhood */}
                    {listing.neighborhood && (
                      <p className="text-xs text-zinc-600 uppercase tracking-wide mb-2">
                        {listing.neighborhood}
                      </p>
                    )}

                    {/* Price, Beds, Baths */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {listing.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span className="font-bold text-sm">
                            ${listing.price.toLocaleString()}/mo
                          </span>
                        </div>
                      )}
                      {listing.beds !== null && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-3 w-3" />
                          <span className="text-sm">{listing.beds} Beds</span>
                        </div>
                      )}
                      {listing.baths !== null && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          <span className="text-sm">{listing.baths} Baths</span>
                        </div>
                      )}
                    </div>

                    {/* External link icon */}
                    <div className="mt-2">
                      <div className="inline-flex items-center gap-1 text-xs text-blue-700 group-hover:text-blue-800">
                        <ExternalLink className="h-3 w-3" />
                        <span>View on StreetEasy</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Fallback: Show URLs if no extracted listings */}
        {(!email.extractedListings || email.extractedListings.length === 0) && email.streetEasyUrls.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">
              Listings in Email:
            </p>
            <div className="space-y-1">
              {email.streetEasyUrls.map((url, idx) => {
                // Extract readable address from URL
                const pathParts = new URL(url).pathname.split('/').filter(Boolean);
                let displayText = "View Listing";

                if (pathParts[0] === 'building' && pathParts[1]) {
                  const buildingSlug = pathParts[1];
                  const unit = pathParts[2] ? `#${pathParts[2].toUpperCase()}` : '';
                  const addressParts = buildingSlug.split('-');
                  const streetNumber = addressParts[0];
                  const streetName = addressParts.slice(1)
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  displayText = `${streetNumber} ${streetName} ${unit}`.trim();
                } else if (pathParts[0] === 'rental') {
                  displayText = `Rental ID: ${pathParts[1]}`;
                }

                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg border border-blue-200 bg-white transition-colors group"
                  >
                    <ExternalLink className="h-4 w-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span className="font-medium">{displayText}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Parsed Data */}
      {email.parsedData && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-y border-purple-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Extracted Data
            </h4>
            <Badge className={`${getConfidenceColor(email.parsedData.confidence)} border`}>
              {email.parsedData.confidence} confidence
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {email.parsedData.address && (
              <div className="bg-white/60 rounded-lg p-2">
                <span className="text-zinc-600 text-xs">Address</span>
                <p className="font-medium">{email.parsedData.address}</p>
              </div>
            )}
            {email.parsedData.neighborhood && (
              <div className="bg-white/60 rounded-lg p-2">
                <span className="text-zinc-600 text-xs">Neighborhood</span>
                <p className="font-medium">{email.parsedData.neighborhood}</p>
              </div>
            )}
            {email.parsedData.price && (
              <div className="bg-white/60 rounded-lg p-2">
                <span className="text-zinc-600 text-xs">Rent</span>
                <p className="font-medium text-green-700">
                  ${email.parsedData.price.toLocaleString()}/mo
                </p>
              </div>
            )}
            {email.parsedData.beds && (
              <div className="bg-white/60 rounded-lg p-2">
                <span className="text-zinc-600 text-xs">Beds/Baths</span>
                <p className="font-medium">
                  {email.parsedData.beds} / {email.parsedData.baths || "?"}
                </p>
              </div>
            )}
            {email.parsedData.brokerName && (
              <div className="bg-white/60 rounded-lg p-2">
                <span className="text-zinc-600 text-xs">Broker</span>
                <p className="font-medium">{email.parsedData.brokerName}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-600 italic bg-white/40 rounded p-2">
            {email.parsedData.extractedText}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 bg-zinc-50 flex gap-2 flex-wrap">
        {!email.parsedData ? (
          <Button
            onClick={() => onParse(email.id)}
            disabled={parsingId === email.id}
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {parsingId === email.id ? "Parsing..." : "Parse with AI"}
          </Button>
        ) : (
          <>
            <Button
              onClick={() => onReviewAdd(email)}
              disabled={!email.parsedData?.address}
              size="sm"
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              Review & Add
            </Button>
            <Button
              onClick={() => onQuickAdd(email.id, email.parsedData)}
              disabled={
                creatingId === email.id || !email.parsedData?.address
              }
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {creatingId === email.id ? "Creating..." : "Quick Add"}
            </Button>
            <Button
              onClick={() => onParse(email.id)}
              disabled={parsingId === email.id}
              variant="ghost"
              size="sm"
            >
              Re-parse
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
