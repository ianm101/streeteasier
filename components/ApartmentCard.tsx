"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize, DollarSign, ExternalLink, AlertCircle, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APARTMENT_STATUS_LABELS } from "@/lib/constants/statuses";

interface ApartmentCardProps {
  apartment: {
    id: string;
    address: string;
    unit?: string | null;
    neighborhood?: string | null;
    borough?: string | null;
    price?: number | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
    photoUrls: string[];
    listingUrl?: string | null;
    status: string;
    descriptionSummary?: string | null;
    brokerName?: string | null;
    apartmentNotes: Array<{
      id: string;
      body: string;
      createdAt: Date;
      user: {
        id: string;
        name: string | null;
      };
    }>;
    rankings: Array<{
      id: string;
      rank: number;
      user: {
        id: string;
        name: string | null;
      };
    }>;
    actionItems?: Array<{
      id: string;
      type: string;
      description: string;
      status: string;
      dueDate: Date | null;
      link: string | null;
      createdAt: Date;
    }>;
    fileAttachments?: Array<{
      id: string;
      name: string;
      type: string;
      url: string;
    }>;
  };
  currentUserId: string;
}

export function ApartmentCard({ apartment, currentUserId }: ApartmentCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = apartment.photoUrls.length > 0
    ? apartment.photoUrls
    : ["/placeholder-apartment.jpg"];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Get latest note
  const latestNote = apartment.apartmentNotes[0];

  // Get pending action items
  const pendingActionItems = apartment.actionItems?.filter(item => item.status === "pending") || [];
  const hasActionItem = pendingActionItems.length > 0;

  // Get user's ranking
  const myRanking = apartment.rankings.find(r => r.user.id === currentUserId);
  const avgRanking = apartment.rankings.length > 0
    ? (apartment.rankings.reduce((sum, r) => sum + r.rank, 0) / apartment.rankings.length).toFixed(1)
    : null;

  return (
    <Link href={`/apartments/${apartment.id}`}>
      <div className="group bg-white hover:bg-gray-50 transition-colors border-2 border-black h-full flex flex-col">
        {/* Image Carousel */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          <Image
            src={images[currentImageIndex]}
            alt={apartment.address}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder-apartment.jpg";
            }}
          />

          {/* Image navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-900 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black hover:bg-gray-900 p-3 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 transition-all ${
                      idx === currentImageIndex
                        ? "w-8 bg-white"
                        : "w-2 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Status badge */}
          <div className="absolute top-0 left-0">
            <span className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
              {APARTMENT_STATUS_LABELS[apartment.status as keyof typeof APARTMENT_STATUS_LABELS]}
            </span>
          </div>

          {/* Ranking badge */}
          {avgRanking && (
            <div className="absolute top-0 right-0">
              <span className="bg-red-600 text-white px-4 py-2 text-xs font-bold">
                ★ {avgRanking}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex-1 flex flex-col">
          {/* Address */}
          <div className="mb-4 pb-4 border-b-2 border-black">
            <h3 className="text-lg font-bold uppercase tracking-tight mb-2 line-clamp-2">
              {apartment.address}
              {apartment.unit && <span className="text-gray-600"> #{apartment.unit}</span>}
            </h3>
            {apartment.neighborhood && (
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-600">
                <MapPin className="h-3 w-3" />
                <span>{apartment.neighborhood}{apartment.borough && `, ${apartment.borough}`}</span>
              </div>
            )}
          </div>

          {/* Key specs */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-300">
            {apartment.price && (
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold">
                  ${apartment.price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-600">/mo</span>
              </div>
            )}
            {apartment.beds !== null && apartment.beds !== undefined && (
              <div className="text-sm font-medium">
                {apartment.beds} BD
              </div>
            )}
            {apartment.baths !== null && apartment.baths !== undefined && (
              <div className="text-sm font-medium">
                {apartment.baths} BA
              </div>
            )}
            {apartment.sqft && (
              <div className="text-sm font-medium text-gray-600">
                {apartment.sqft} SF
              </div>
            )}
          </div>

          {/* Action Items */}
          {pendingActionItems.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wider mb-2 text-red-600">
                ⚠ Action Required
              </div>
              {pendingActionItems.slice(0, 2).map((actionItem) => (
                <div
                  key={actionItem.id}
                  className="bg-red-50 border-l-4 border-red-600 p-3 mb-2 last:mb-0"
                  onClick={(e) => {
                    if (actionItem.link) {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(actionItem.link, "_blank");
                    }
                  }}
                >
                  <p className="text-sm font-medium mb-1">
                    {actionItem.description}
                  </p>
                  {actionItem.link && (
                    <button
                      className="text-xs font-bold uppercase tracking-wide hover:underline flex items-center gap-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (actionItem.link) {
                          window.open(actionItem.link, "_blank");
                        }
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Link
                    </button>
                  )}
                </div>
              ))}
              {pendingActionItems.length > 2 && (
                <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mt-2">
                  +{pendingActionItems.length - 2} More
                </p>
              )}
            </div>
          )}

          {/* AI Summary - Prominently displayed */}
          {apartment.descriptionSummary && (
            <div className="mb-4 bg-blue-50 border-l-4 border-blue-600 p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wide text-blue-900">
                  AI Summary
                </span>
              </div>
              <p className="text-sm text-zinc-800 line-clamp-3">
                {apartment.descriptionSummary}
              </p>
            </div>
          )}

          {/* Latest update */}
          <div className="mb-4 flex-1">
            {latestNote ? (
              <div className="bg-zinc-50 p-3 border-l-2 border-zinc-300">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide block mb-2">
                  Latest Update
                </span>
                <p className="text-sm text-zinc-700 line-clamp-2">
                  {latestNote.body}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  by {latestNote.user.name} • {new Date(latestNote.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : apartment.brokerName ? (
              <div className="bg-zinc-50 p-3 border-l-2 border-zinc-300">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide block mb-1">
                  Broker
                </span>
                <p className="text-sm text-zinc-700">{apartment.brokerName}</p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="space-y-2">
            {/* File count badge */}
            {apartment.fileAttachments && apartment.fileAttachments.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 pb-2 border-b border-zinc-100">
                <Paperclip className="h-3 w-3" />
                <span>{apartment.fileAttachments.length} {apartment.fileAttachments.length === 1 ? 'file' : 'files'} attached</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="text-sm text-zinc-600">
                {myRanking ? (
                  <span>Your rating: <span className="font-semibold text-zinc-900">{myRanking.rank}/10</span></span>
                ) : (
                  <span className="text-zinc-400">Not rated yet</span>
                )}
              </div>
              {apartment.listingUrl && (
                <a
                  href={apartment.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Listing
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
