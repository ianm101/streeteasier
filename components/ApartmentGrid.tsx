"use client";

import { useState } from "react";
import { ApartmentCard } from "./ApartmentCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APARTMENT_STATUSES, APARTMENT_STATUS_LABELS } from "@/lib/constants/statuses";

interface ApartmentGridProps {
  apartments: Array<{
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
    createdAt: Date;
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
  }>;
  currentUserId: string;
}

export function ApartmentGrid({ apartments, currentUserId }: ApartmentGridProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");

  // Filter apartments
  let filteredApartments = apartments;
  if (statusFilter !== "all") {
    filteredApartments = apartments.filter((apt) => apt.status === statusFilter);
  }

  // Sort apartments
  const sortedApartments = [...filteredApartments].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "beds":
        return (b.beds || 0) - (a.beds || 0);
      case "rating":
        const avgA = a.rankings.length > 0
          ? a.rankings.reduce((sum, r) => sum + r.rank, 0) / a.rankings.length
          : 0;
        const avgB = b.rankings.length > 0
          ? b.rankings.reduce((sum, r) => sum + r.rank, 0) / b.rankings.length
          : 0;
        return avgB - avgA;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Swiss Grid Filters */}
      <div className="flex flex-wrap gap-6 items-center border-b border-gray-300 pb-6">
        <div className="w-full sm:w-56">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block">Status</label>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
            <SelectTrigger className="bg-white border-2 border-black h-12 text-sm font-medium">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {APARTMENT_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {APARTMENT_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-56">
          <label className="text-xs font-bold uppercase tracking-wider mb-2 block">Sort</label>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value || "date")}>
            <SelectTrigger className="bg-white border-2 border-black h-12 text-sm font-medium">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="beds">Most Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto text-xs font-bold uppercase tracking-wider">
          {sortedApartments.length} Results
        </div>
      </div>

      {/* Grid */}
      {sortedApartments.length === 0 ? (
        <div className="text-center py-24 border-2 border-black">
          <p className="text-xl font-bold uppercase">No Apartments Found</p>
          <p className="text-sm uppercase tracking-wide mt-2 text-gray-600">Adjust Filters or Add New</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
          {sortedApartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
