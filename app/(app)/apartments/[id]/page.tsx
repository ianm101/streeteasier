import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getApartmentById } from "@/lib/actions/apartments";
import { getUserRanking } from "@/lib/actions/rankings";
import { RankingWidget } from "@/components/RankingWidget";
import { NotesSection } from "@/components/NotesSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APARTMENT_STATUS_LABELS } from "@/lib/constants/statuses";
import { AMENITY_LABELS } from "@/lib/constants/amenities";
import { ExternalLink, MapPin, DollarSign, Home, Ruler, Layers } from "lucide-react";

interface ApartmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApartmentDetailPage({
  params,
}: ApartmentDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  const apartment = await getApartmentById(id);

  if (!apartment) {
    notFound();
  }

  const userRanking = await getUserRanking(id);

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
    if (!price) return "Not specified";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getAverageRank = () => {
    if (apartment.rankings.length === 0) return null;
    const sum = apartment.rankings.reduce((acc, r) => acc + r.rank, 0);
    return (sum / apartment.rankings.length).toFixed(1);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Apartments
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{apartment.address}</h1>
            {apartment.unit && (
              <p className="text-xl text-zinc-600 mt-1">Unit {apartment.unit}</p>
            )}
            {apartment.neighborhood && (
              <p className="text-zinc-600 flex items-center gap-1 mt-2">
                <MapPin className="h-4 w-4" />
                {apartment.neighborhood}
                {apartment.borough && `, ${apartment.borough}`}
              </p>
            )}
          </div>

          <Badge className={`text-sm px-3 py-1 ${getStatusColor(apartment.status)}`}>
            {APARTMENT_STATUS_LABELS[apartment.status as keyof typeof APARTMENT_STATUS_LABELS] || apartment.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Details */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Key Details</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-600">Rent</p>
                  <p className="font-semibold">{formatPrice(apartment.price)}/mo</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-600">Beds/Baths</p>
                  <p className="font-semibold">
                    {apartment.beds || "?"} / {apartment.baths || "?"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-600">Square Feet</p>
                  <p className="font-semibold">
                    {apartment.sqft ? apartment.sqft.toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-600">Floor</p>
                  <p className="font-semibold">{apartment.floor || "—"}</p>
                </div>
              </div>
            </div>

            {apartment.listingUrl && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={apartment.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Original Listing
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Amenities */}
          {apartment.amenities.length > 0 && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {apartment.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    {AMENITY_LABELS[amenity.key as keyof typeof AMENITY_LABELS] ||
                      amenity.key}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Broker Information */}
          {(apartment.brokerName ||
            apartment.brokerEmail ||
            apartment.brokerPhone) && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Broker Information</h2>
              <div className="space-y-2 text-sm">
                {apartment.brokerName && (
                  <p>
                    <span className="text-zinc-600">Name:</span>{" "}
                    <span className="font-medium">{apartment.brokerName}</span>
                  </p>
                )}
                {apartment.brokerEmail && (
                  <p>
                    <span className="text-zinc-600">Email:</span>{" "}
                    <a
                      href={`mailto:${apartment.brokerEmail}`}
                      className="text-blue-600 hover:underline"
                    >
                      {apartment.brokerEmail}
                    </a>
                  </p>
                )}
                {apartment.brokerPhone && (
                  <p>
                    <span className="text-zinc-600">Phone:</span>{" "}
                    <a
                      href={`tel:${apartment.brokerPhone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {apartment.brokerPhone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Initial Notes */}
          {apartment.notes && (
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
              <p className="text-sm text-zinc-700 whitespace-pre-wrap">
                {apartment.notes}
              </p>
            </div>
          )}

          {/* Notes Section */}
          <div className="bg-white rounded-lg border p-6">
            <NotesSection
              apartmentId={apartment.id}
              notes={apartment.apartmentNotes}
              currentUserId={session.user.id}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rankings */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Rankings</h2>

            <div className="space-y-4">
              <RankingWidget apartmentId={apartment.id} currentRank={userRanking} />

              {apartment.rankings.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Average:</span>
                    <span className="text-lg font-bold text-zinc-900">
                      {getAverageRank()} / 5
                    </span>
                  </div>

                  <div className="space-y-2">
                    {apartment.rankings.map((ranking) => (
                      <div
                        key={ranking.user.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          {ranking.user.image && (
                            <Image
                              src={ranking.user.image}
                              alt={ranking.user.name || "User"}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          )}
                          <span className="text-zinc-700">
                            {ranking.user.name}
                          </span>
                        </div>
                        <span className="font-medium">{ranking.rank} / 5</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-zinc-600">Added by:</span>
                <p className="font-medium">{apartment.addedBy.name}</p>
              </div>

              {apartment.pointPerson && (
                <div>
                  <span className="text-zinc-600">Point Person:</span>
                  <p className="font-medium">{apartment.pointPerson.name}</p>
                </div>
              )}

              <div>
                <span className="text-zinc-600">Source:</span>
                <p className="font-medium capitalize">
                  {apartment.source.replace("_", " ")}
                </p>
              </div>

              <div>
                <span className="text-zinc-600">Added:</span>
                <p className="font-medium">
                  {new Date(apartment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
