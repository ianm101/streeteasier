"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Building2, MessageSquare, MapPin, DollarSign, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface BrokerThreadCardProps {
  thread: {
    id: string;
    brokerName: string;
    brokerEmail: string;
    brokerPhone: string | null;
    brokerCompany: string | null;
    subject: string;
    lastEmailAt: Date;
    messageCount: number;
    summary: string | null;
    status: string;
    mentionedAddresses: string[];
    mentionedPrices: number[];
    userAsks: string[];
    brokerAsks: string[];
    apartments?: Array<{
      id: string;
      address: string;
      unit: string | null;
      price: number | null;
      status: string;
    }>;
  };
}

export function BrokerThreadCard({ thread }: BrokerThreadCardProps) {
  const [showFullSummary, setShowFullSummary] = useState(false);

  const statusColors = {
    active: "bg-green-600",
    cold: "bg-gray-400",
    completed: "bg-blue-600",
  };

  const statusLabels = {
    active: "Active",
    cold: "Cold",
    completed: "Completed",
  };

  return (
    <div className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors">
      {/* Header */}
      <div className="mb-4 pb-4 border-b-2 border-black">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold uppercase tracking-tight mb-1">
              {thread.brokerName}
            </h3>
            {thread.brokerCompany && (
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-600">
                <Building2 className="h-3 w-3" />
                <span>{thread.brokerCompany}</span>
              </div>
            )}
          </div>
          <div className={`${statusColors[thread.status as keyof typeof statusColors]} text-white px-3 py-1 text-xs font-bold uppercase`}>
            {statusLabels[thread.status as keyof typeof statusLabels]}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-600" />
            <a href={`mailto:${thread.brokerEmail}`} className="hover:underline">
              {thread.brokerEmail}
            </a>
          </div>
          {thread.brokerPhone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-600" />
              <a href={`tel:${thread.brokerPhone}`} className="hover:underline">
                {thread.brokerPhone}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {thread.summary && (
        <div className="mb-4 bg-blue-50 border-l-4 border-blue-600 p-3">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-900 mb-2">
            Conversation Summary
          </div>
          <p className={`text-sm text-zinc-800 ${!showFullSummary && 'line-clamp-3'}`}>
            {thread.summary}
          </p>
          {thread.summary.length > 150 && (
            <button
              onClick={() => setShowFullSummary(!showFullSummary)}
              className="text-xs font-bold uppercase tracking-wide text-blue-700 hover:underline mt-2"
            >
              {showFullSummary ? "Show Less" : "Show More"}
            </button>
          )}
        </div>
      )}

      {/* Mentioned Properties */}
      {thread.mentionedAddresses.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wider mb-2">
            Properties Mentioned ({thread.mentionedAddresses.length})
          </div>
          <div className="space-y-2">
            {thread.mentionedAddresses.slice(0, 3).map((address, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm border-l-2 border-gray-300 pl-3">
                <MapPin className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{address}</div>
                  {thread.mentionedPrices[idx] && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <DollarSign className="h-3 w-3" />
                      <span>${thread.mentionedPrices[idx].toLocaleString()}/mo</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {thread.mentionedAddresses.length > 3 && (
              <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
                +{thread.mentionedAddresses.length - 3} More
              </p>
            )}
          </div>
        </div>
      )}

      {/* User Asks & Broker Asks */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* User Asks */}
        {thread.userAsks.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-green-700">
              Your Requests
            </div>
            <div className="space-y-1">
              {thread.userAsks.slice(0, 3).map((ask, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{ask}</span>
                </div>
              ))}
              {thread.userAsks.length > 3 && (
                <p className="text-xs font-bold text-gray-500">+{thread.userAsks.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Broker Asks */}
        {thread.brokerAsks.length > 0 && (
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-2 text-orange-700">
              Broker Requests
            </div>
            <div className="space-y-1">
              {thread.brokerAsks.slice(0, 3).map((ask, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <Clock className="h-3 w-3 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{ask}</span>
                </div>
              ))}
              {thread.brokerAsks.length > 3 && (
                <p className="text-xs font-bold text-gray-500">+{thread.brokerAsks.length - 3} more</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Linked Apartments */}
      {thread.apartments && thread.apartments.length > 0 && (
        <div className="mb-4 bg-gray-50 border-l-2 border-black p-3">
          <div className="text-xs font-bold uppercase tracking-wider mb-2">
            Created Apartments ({thread.apartments.length})
          </div>
          <div className="space-y-2">
            {thread.apartments.map((apt) => (
              <Link key={apt.id} href={`/apartments/${apt.id}`}>
                <div className="flex items-center justify-between hover:bg-gray-100 p-2 -mx-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {apt.address} {apt.unit && `#${apt.unit}`}
                    </div>
                    {apt.price && (
                      <div className="text-xs text-gray-600">
                        ${apt.price.toLocaleString()}/mo
                      </div>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{thread.messageCount} {thread.messageCount === 1 ? 'message' : 'messages'}</span>
          </div>
          <span>•</span>
          <span>{formatDistanceToNow(thread.lastEmailAt, { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  );
}
