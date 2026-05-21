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
import { createApartmentFromParsedData, type ParsedEmail } from "@/lib/actions/inbox";
import { AMENITY_KEYS, AMENITY_LABELS } from "@/lib/constants/amenities";
import { X } from "lucide-react";

interface EditParsedDataDialogProps {
  emailId: string;
  parsedData: ParsedEmail["parsedData"];
  onClose: () => void;
}

export function EditParsedDataDialog({
  emailId,
  parsedData: initialData,
  onClose,
}: EditParsedDataDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(initialData);

  if (!data) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const apartmentId = await createApartmentFromParsedData(data, emailId);
      router.push(`/apartments/${apartmentId}`);
    } catch (error) {
      console.error("Error creating apartment:", error);
      alert(
        `Failed to create apartment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setLoading(false);
    }
  };

  const toggleAmenity = (key: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const amenities = prev.amenities || [];
      return {
        ...prev,
        amenities: amenities.includes(key)
          ? amenities.filter((a) => a !== key)
          : [...amenities, key],
      };
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Review & Edit Apartment Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Address */}
          <div>
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={data.address || ""}
              onChange={(e) => setData({ ...data, address: e.target.value })}
              required
            />
          </div>

          {/* Unit & Neighborhood */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={data.unit || ""}
                onChange={(e) => setData({ ...data, unit: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                value={data.neighborhood || ""}
                onChange={(e) =>
                  setData({ ...data, neighborhood: e.target.value })
                }
              />
            </div>
          </div>

          {/* Borough */}
          <div>
            <Label htmlFor="borough">Borough</Label>
            <Select
              value={data.borough || ""}
              onValueChange={(value) => setData({ ...data, borough: value })}
            >
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

          {/* Price, Beds, Baths */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Monthly Rent ($)</Label>
              <Input
                id="price"
                type="number"
                value={data.price || ""}
                onChange={(e) =>
                  setData({ ...data, price: Number(e.target.value) || null })
                }
              />
            </div>
            <div>
              <Label htmlFor="beds">Bedrooms</Label>
              <Input
                id="beds"
                type="number"
                step="0.5"
                value={data.beds || ""}
                onChange={(e) =>
                  setData({ ...data, beds: Number(e.target.value) || null })
                }
              />
            </div>
            <div>
              <Label htmlFor="baths">Bathrooms</Label>
              <Input
                id="baths"
                type="number"
                step="0.5"
                value={data.baths || ""}
                onChange={(e) =>
                  setData({ ...data, baths: Number(e.target.value) || null })
                }
              />
            </div>
          </div>

          {/* Sqft & Floor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sqft">Square Feet</Label>
              <Input
                id="sqft"
                type="number"
                value={data.sqft || ""}
                onChange={(e) =>
                  setData({ ...data, sqft: Number(e.target.value) || null })
                }
              />
            </div>
            <div>
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={data.floor || ""}
                onChange={(e) =>
                  setData({ ...data, floor: Number(e.target.value) || null })
                }
              />
            </div>
          </div>

          {/* Listing URL */}
          <div>
            <Label htmlFor="listingUrl">Listing URL</Label>
            <Input
              id="listingUrl"
              type="url"
              value={data.listingUrl || ""}
              onChange={(e) => setData({ ...data, listingUrl: e.target.value })}
            />
          </div>

          {/* Broker Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Broker Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="brokerName">Broker Name</Label>
                <Input
                  id="brokerName"
                  value={data.brokerName || ""}
                  onChange={(e) =>
                    setData({ ...data, brokerName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="brokerEmail">Broker Email</Label>
                  <Input
                    id="brokerEmail"
                    type="email"
                    value={data.brokerEmail || ""}
                    onChange={(e) =>
                      setData({ ...data, brokerEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="brokerPhone">Broker Phone</Label>
                  <Input
                    id="brokerPhone"
                    type="tel"
                    value={data.brokerPhone || ""}
                    onChange={(e) =>
                      setData({ ...data, brokerPhone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-semibold">Amenities</h3>
            <div className="grid grid-cols-2 gap-3">
              {AMENITY_KEYS.map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`amenity-${key}`}
                    checked={data.amenities?.includes(key) || false}
                    onCheckedChange={() => toggleAmenity(key)}
                  />
                  <label
                    htmlFor={`amenity-${key}`}
                    className="text-sm font-medium leading-none"
                  >
                    {AMENITY_LABELS[key]}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Extracted Text */}
          <div>
            <Label htmlFor="extractedText">AI Summary</Label>
            <Textarea
              id="extractedText"
              value={data.extractedText}
              onChange={(e) =>
                setData({ ...data, extractedText: e.target.value })
              }
              rows={3}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading || !data.address}>
              {loading ? "Creating..." : "Create Apartment"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
