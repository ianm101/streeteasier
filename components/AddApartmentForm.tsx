"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApartment } from "@/lib/actions/apartments";
import { APARTMENT_STATUSES, APARTMENT_STATUS_LABELS } from "@/lib/constants/statuses";
import { AMENITY_KEYS, AMENITY_LABELS } from "@/lib/constants/amenities";

interface AddApartmentFormProps {
  users: Array<{
    id: string;
    name: string | null;
    email: string | null;
  }>;
  currentUserId: string;
}

export function AddApartmentForm({ users, currentUserId }: AddApartmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const apartmentId = await createApartment({
        address: formData.get("address") as string,
        unit: formData.get("unit") as string || undefined,
        neighborhood: formData.get("neighborhood") as string || undefined,
        borough: formData.get("borough") as string || undefined,
        price: formData.get("price") ? Number(formData.get("price")) : undefined,
        beds: formData.get("beds") ? Number(formData.get("beds")) : undefined,
        baths: formData.get("baths") ? Number(formData.get("baths")) : undefined,
        sqft: formData.get("sqft") ? Number(formData.get("sqft")) : undefined,
        floor: formData.get("floor") ? Number(formData.get("floor")) : undefined,
        listingUrl: formData.get("listingUrl") as string || undefined,
        source: formData.get("source") as string,
        status: formData.get("status") as string || "interested",
        brokerName: formData.get("brokerName") as string || undefined,
        brokerEmail: formData.get("brokerEmail") as string || undefined,
        brokerPhone: formData.get("brokerPhone") as string || undefined,
        pointPersonId: formData.get("pointPersonId") as string || undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        notes: formData.get("notes") as string || undefined,
      });

      router.push(`/apartments/${apartmentId}`);
    } catch (error) {
      console.error("Failed to create apartment:", error);
      alert("Failed to create apartment. Please try again.");
      setLoading(false);
    }
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key)
        ? prev.filter((a) => a !== key)
        : [...prev, key]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        <div>
          <Label htmlFor="address">Address *</Label>
          <Input
            id="address"
            name="address"
            required
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input id="unit" name="unit" placeholder="4B" />
          </div>
          <div>
            <Label htmlFor="floor">Floor</Label>
            <Input id="floor" name="floor" type="number" placeholder="4" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="neighborhood">Neighborhood</Label>
            <Input
              id="neighborhood"
              name="neighborhood"
              placeholder="Upper West Side"
            />
          </div>
          <div>
            <Label htmlFor="borough">Borough</Label>
            <Select name="borough">
              <SelectTrigger>
                <SelectValue placeholder="Select borough" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manhattan">Manhattan</SelectItem>
                <SelectItem value="Brooklyn">Brooklyn</SelectItem>
                <SelectItem value="Queens">Queens</SelectItem>
                <SelectItem value="Bronx">Bronx</SelectItem>
                <SelectItem value="Staten Island">Staten Island</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Property Details</h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Monthly Rent ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              placeholder="3500"
            />
          </div>
          <div>
            <Label htmlFor="beds">Bedrooms</Label>
            <Input
              id="beds"
              name="beds"
              type="number"
              step="0.5"
              placeholder="2"
            />
          </div>
          <div>
            <Label htmlFor="baths">Bathrooms</Label>
            <Input
              id="baths"
              name="baths"
              type="number"
              step="0.5"
              placeholder="1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sqft">Square Feet</Label>
          <Input id="sqft" name="sqft" type="number" placeholder="850" />
        </div>

        <div>
          <Label htmlFor="listingUrl">Listing URL</Label>
          <Input
            id="listingUrl"
            name="listingUrl"
            type="url"
            placeholder="https://streeteasy.com/..."
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Amenities</h2>
        <div className="grid grid-cols-2 gap-3">
          {AMENITY_KEYS.map((key) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`amenity-${key}`}
                checked={selectedAmenities.includes(key)}
                onCheckedChange={() => toggleAmenity(key)}
              />
              <label
                htmlFor={`amenity-${key}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {AMENITY_LABELS[key]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Broker Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Broker Information</h2>

        <div>
          <Label htmlFor="brokerName">Broker Name</Label>
          <Input id="brokerName" name="brokerName" placeholder="John Doe" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brokerEmail">Broker Email</Label>
            <Input
              id="brokerEmail"
              name="brokerEmail"
              type="email"
              placeholder="broker@example.com"
            />
          </div>
          <div>
            <Label htmlFor="brokerPhone">Broker Phone</Label>
            <Input
              id="brokerPhone"
              name="brokerPhone"
              type="tel"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Management */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Management</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="source">Source *</Label>
            <Select name="source" required defaultValue="manual">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual Entry</SelectItem>
                <SelectItem value="streeteasy">StreetEasy</SelectItem>
                <SelectItem value="zillow">Zillow</SelectItem>
                <SelectItem value="broker_email">Broker Email</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="interested">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APARTMENT_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {APARTMENT_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="pointPersonId">Point Person</Label>
          <Select name="pointPersonId" defaultValue={currentUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select point person" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any additional notes about this apartment..."
            rows={4}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Apartment"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
