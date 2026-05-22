import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getBrokerThreadById } from "@/lib/actions/broker-threads";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, Building2, MessageSquare, MapPin, DollarSign, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default async function BrokerThreadPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const thread = await getBrokerThreadById(params.id);

  if (!thread) {
    notFound();
  }

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
    <div className="min-h-screen bg-white">
      <div className="max-w-[1400px] mx-auto px-8 py-12">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-8 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="border-b-2 border-black pb-8 mb-12">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-6xl font-bold uppercase tracking-tight mb-2">
                {thread.brokerName}
              </h1>
              {thread.brokerCompany && (
                <div className="flex items-center gap-2 text-lg font-medium uppercase tracking-wide text-gray-600">
                  <Building2 className="h-5 w-5" />
                  <span>{thread.brokerCompany}</span>
                </div>
              )}
            </div>
            <div className={`${statusColors[thread.status as keyof typeof statusColors]} text-white px-6 py-3 text-sm font-bold uppercase`}>
              {statusLabels[thread.status as keyof typeof statusLabels]}
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex gap-8 items-center text-base border-t-2 border-gray-300 pt-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-600" />
              <a href={`mailto:${thread.brokerEmail}`} className="hover:underline font-medium">
                {thread.brokerEmail}
              </a>
            </div>
            {thread.brokerPhone && (
              <>
                <span className="text-gray-400">•</span>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <a href={`tel:${thread.brokerPhone}`} className="hover:underline font-medium">
                    {thread.brokerPhone}
                  </a>
                </div>
              </>
            )}
            <span className="text-gray-400">•</span>
            <div className="flex items-center gap-2 text-gray-600">
              <MessageSquare className="h-5 w-5" />
              <span>{thread.messageCount} {thread.messageCount === 1 ? 'message' : 'messages'}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              Last email: {formatDistanceToNow(thread.lastEmailAt, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Summary */}
        {thread.summary && (
          <div className="mb-12 bg-blue-50 border-l-4 border-blue-600 p-6">
            <div className="text-xs font-bold uppercase tracking-wide text-blue-900 mb-3">
              Conversation Summary
            </div>
            <p className="text-base text-zinc-800 leading-relaxed">
              {thread.summary}
            </p>
          </div>
        )}

        {/* Mentioned Properties */}
        {thread.mentionedAddresses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6 border-b-2 border-black pb-3">
              Properties Discussed ({thread.mentionedAddresses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {thread.mentionedAddresses.map((address, idx) => (
                <div key={idx} className="bg-white border-2 border-black p-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-gray-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="font-bold text-lg mb-1">{address}</div>
                      {thread.mentionedPrices[idx] && (
                        <div className="flex items-center gap-1 text-gray-700">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-xl font-bold">${thread.mentionedPrices[idx].toLocaleString()}</span>
                          <span className="text-sm">/mo</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Asks & Broker Asks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* User Asks */}
          {thread.userAsks.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 border-b-2 border-green-600 pb-2 text-green-700">
                Your Requests
              </h3>
              <ul className="space-y-3">
                {thread.userAsks.map((ask, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-green-50 border-l-4 border-green-600 p-4">
                    <div className="text-sm font-medium text-gray-800">{ask}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Broker Asks */}
          {thread.brokerAsks.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold uppercase tracking-tight mb-4 border-b-2 border-orange-600 pb-2 text-orange-700">
                Broker Requests
              </h3>
              <ul className="space-y-3">
                {thread.brokerAsks.map((ask, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-orange-50 border-l-4 border-orange-600 p-4">
                    <div className="text-sm font-medium text-gray-800">{ask}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Created Apartments */}
        {thread.apartments && thread.apartments.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-6 border-b-2 border-black pb-3">
              Created Apartments ({thread.apartments.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {thread.apartments.map((apt) => (
                <Link key={apt.id} href={`/apartments/${apt.id}`}>
                  <div className="bg-white border-2 border-black p-6 hover:bg-gray-50 transition-colors">
                    <div className="font-bold text-lg mb-2">
                      {apt.address} {apt.unit && `#${apt.unit}`}
                    </div>
                    {apt.price && (
                      <div className="text-xl font-bold mb-2">
                        ${apt.price.toLocaleString()}/mo
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ExternalLink className="h-4 w-4" />
                      <span className="uppercase tracking-wide">View Details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
