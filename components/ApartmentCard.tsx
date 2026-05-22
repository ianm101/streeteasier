"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Maximize, DollarSign, ExternalLink, AlertCircle } from "lucide-react";
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

  // Check for action items in notes
  const hasActionItem = latestNote?.body.toLowerCase().includes("todo") ||
                        latestNote?.body.toLowerCase().includes("follow up") ||
                        latestNote?.body.toLowerCase().includes("schedule") ||
                        latestNote?.body.toLowerCase().includes("call back");

  // Get user's ranking
  const myRanking = apartment.rankings.find(r => r.user.id === currentUserId);
  const avgRanking = apartment.rankings.length > 0
    ? (apartment.rankings.reduce((sum, r) => sum + r.rank, 0) / apartment.rankings.length).toFixed(1)
    : null;

  return (
    <Link href={`/apartments/${apartment.id}`}>
      <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-zinc-200 hover:border-zinc-300 h-full flex flex-col">
        {/* Image Carousel */}
        <div className="relative h-64 bg-zinc-100 overflow-hidden">
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
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5 text-zinc-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5 text-zinc-800" />
              </button>

              {/* Image indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-zinc-800 shadow-sm">
              {APARTMENT_STATUS_LABELS[apartment.status as keyof typeof APARTMENT_STATUS_LABELS]}
            </span>
          </div>

          {/* Ranking badge */}
          {avgRanking && (
            <div className="absolute top-3 right-3">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                ⭐ {avgRanking}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Address */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-zinc-900 mb-1 line-clamp-1">
              {apartment.address}
              {apartment.unit && <span className="text-zinc-500"> #{apartment.unit}</span>}
            </h3>
            {apartment.neighborhood && (
              <div className="flex items-center gap-1 text-sm text-zinc-600">
                <MapPin className="h-4 w-4" />
                <span>{apartment.neighborhood}{apartment.borough && `, ${apartment.borough}`}</span>
              </div>
            )}
          </div>

          {/* Key specs */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-zinc-100">
            {apartment.price && (
              <div className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-zinc-500" />
                <span className="font-semibold text-zinc-900">
                  ${apartment.price.toLocaleString()}
                </span>
              </div>
            )}
            {apartment.beds !== null && apartment.beds !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-700">{apartment.beds} bed</span>
              </div>
            )}
            {apartment.baths !== null && apartment.baths !== undefined && (
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-700">{apartment.baths} bath</span>
              </div>
            )}
            {apartment.sqft && (
              <div className="flex items-center gap-1.5">
                <Maximize className="h-4 w-4 text-zinc-500" />
                <span className="text-zinc-700">{apartment.sqft} sqft</span>
              </div>
            )}
          </div>

          {/* Latest update / Summary */}
          <div className="mb-4 flex-1">
            {latestNote ? (
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Latest Update
                  </span>
                  {hasActionItem && (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      Action Needed
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-700 line-clamp-2">
                  {latestNote.body}
                </p>
                <p className="text-xs text-zinc-500 mt-1">
                  by {latestNote.user.name} • {new Date(latestNote.createdAt).toLocaleDateString()}
                </p>
              </div>
            ) : apartment.descriptionSummary ? (
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide block mb-2">
                  Summary
                </span>
                <p className="text-sm text-zinc-700 line-clamp-2">
                  {apartment.descriptionSummary}
                </p>
              </div>
            ) : apartment.brokerName ? (
              <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-100">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide block mb-1">
                  Broker
                </span>
                <p className="text-sm text-zinc-700">{apartment.brokerName}</p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
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
    </Link>
  );
}
