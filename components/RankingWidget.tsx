"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { setRanking } from "@/lib/actions/rankings";
import { Button } from "@/components/ui/button";

interface RankingWidgetProps {
  apartmentId: string;
  currentRank: number | null;
}

export function RankingWidget({ apartmentId, currentRank }: RankingWidgetProps) {
  const [rank, setRank] = useState(currentRank);
  const [hoveredRank, setHoveredRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRank = async (newRank: number) => {
    setLoading(true);
    try {
      await setRanking(apartmentId, newRank);
      setRank(newRank);
    } catch (error) {
      console.error("Failed to set ranking:", error);
      alert("Failed to save ranking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const displayRank = hoveredRank !== null ? hoveredRank : rank;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Your Ranking:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => handleRank(i)}
              onMouseEnter={() => setHoveredRank(i)}
              onMouseLeave={() => setHoveredRank(null)}
              disabled={loading}
              className="focus:outline-none disabled:opacity-50"
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  displayRank && i <= displayRank
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-zinc-300"
                }`}
              />
            </button>
          ))}
        </div>
        {rank && (
          <span className="text-sm text-zinc-600">
            {rank} out of 5
          </span>
        )}
      </div>
      {!rank && (
        <p className="text-xs text-zinc-500">
          Click to rate this apartment
        </p>
      )}
    </div>
  );
}
