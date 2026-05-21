"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APARTMENT_STATUSES, APARTMENT_STATUS_LABELS } from "@/lib/constants/statuses";

type Apartment = {
  id: string;
  address: string;
  unit: string | null;
  neighborhood: string | null;
  borough: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  status: string;
  addedBy: {
    id: string;
    name: string | null;
  };
  pointPerson: {
    id: string;
    name: string | null;
  } | null;
  rankings: Array<{
    rank: number;
    user: {
      id: string;
      name: string | null;
    };
  }>;
  apartmentNotes: Array<any>;
};

interface ApartmentsTableProps {
  apartments: Apartment[];
  currentUserId: string;
}

export function ApartmentsTable({
  apartments,
  currentUserId,
}: ApartmentsTableProps) {
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
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "beds":
        return (b.beds || 0) - (a.beds || 0);
      case "date":
      default:
        return 0; // Already sorted by createdAt desc from server
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "interested":
        return "bg-blue-100 text-blue-800";
      case "reached_out":
        return "bg-cyan-100 text-cyan-800";
      case "tour_scheduled":
        return "bg-purple-100 text-purple-800";
      case "toured":
        return "bg-indigo-100 text-indigo-800";
      case "applied":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "passed":
        return "bg-red-100 text-red-800";
      case "lost":
        return "bg-zinc-100 text-zinc-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAverageRank = (rankings: Apartment["rankings"]) => {
    if (rankings.length === 0) return "—";
    const sum = rankings.reduce((acc, r) => acc + r.rank, 0);
    const avg = sum / rankings.length;
    return avg.toFixed(1);
  };

  const getUserRank = (rankings: Apartment["rankings"]) => {
    const userRanking = rankings.find((r) => r.user.id === currentUserId);
    return userRanking ? userRanking.rank : "—";
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || "all")}>
            <SelectTrigger>
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

        <div className="w-48">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value || "date")}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Newest First</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="beds">Most Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Address</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Beds/Baths</TableHead>
              <TableHead>Sq Ft</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>My Rank</TableHead>
              <TableHead>Avg Rank</TableHead>
              <TableHead>Point Person</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedApartments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-zinc-500">
                  No apartments found. Add your first apartment to get started!
                </TableCell>
              </TableRow>
            ) : (
              sortedApartments.map((apartment) => (
                <TableRow key={apartment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{apartment.address}</div>
                      {apartment.unit && (
                        <div className="text-sm text-zinc-500">
                          Unit {apartment.unit}
                        </div>
                      )}
                      {apartment.neighborhood && (
                        <div className="text-sm text-zinc-500">
                          {apartment.neighborhood}
                          {apartment.borough && `, ${apartment.borough}`}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(apartment.price)}
                  </TableCell>
                  <TableCell>
                    {apartment.beds || "—"} / {apartment.baths || "—"}
                  </TableCell>
                  <TableCell>
                    {apartment.sqft
                      ? apartment.sqft.toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(apartment.status)}>
                      {APARTMENT_STATUS_LABELS[apartment.status as keyof typeof APARTMENT_STATUS_LABELS] || apartment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {getUserRank(apartment.rankings)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {getAverageRank(apartment.rankings)}
                  </TableCell>
                  <TableCell>
                    {apartment.pointPerson?.name || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {apartment.apartmentNotes.length > 0 && (
                      <span className="text-sm text-zinc-600">
                        {apartment.apartmentNotes.length}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Link href={`/apartments/${apartment.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
