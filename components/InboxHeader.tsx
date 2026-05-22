"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InboxHeaderProps {
  emailCount: number;
  highRelevanceCount: number;
}

export function InboxHeader({ emailCount, highRelevanceCount }: InboxHeaderProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState<string>("off");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    setLastRefresh(new Date());
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh === "off") return;

    const intervalMs = autoRefresh === "1min" ? 60000 : autoRefresh === "5min" ? 300000 : 900000;

    const interval = setInterval(() => {
      console.log("Auto-refreshing inbox...");
      router.refresh();
      setLastRefresh(new Date());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [autoRefresh, router]);

  return (
    <div className="border-b-2 border-black pb-8 mb-12">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-6xl font-bold uppercase tracking-tight mb-2">
            Inbox
          </h1>
          <p className="text-base uppercase tracking-wide text-gray-600">
            {highRelevanceCount > 0 && (
              <span className="font-bold text-black">{highRelevanceCount} Likely Apartments</span>
            )}
            {highRelevanceCount > 0 && emailCount > highRelevanceCount && <span> / </span>}
            {emailCount} Total Messages
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 border-2 border-black px-4 py-2">
            <Settings className="h-4 w-4" />
            <Select value={autoRefresh} onValueChange={(value) => setAutoRefresh(value || "off")}>
              <SelectTrigger className="border-none bg-transparent w-32 h-auto p-0 font-medium text-sm">
                <SelectValue placeholder="Auto-refresh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">No Auto-Refresh</SelectItem>
                <SelectItem value="1min">Every 1 Min</SelectItem>
                <SelectItem value="5min">Every 5 Min</SelectItem>
                <SelectItem value="15min">Every 15 Min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-black text-white hover:bg-gray-900 px-6 py-6 font-bold uppercase text-sm tracking-wide"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing" : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-medium uppercase tracking-wide text-gray-600">
        <span>Gmail • AI Extraction</span>
        {autoRefresh !== "off" && (
          <>
            <span>•</span>
            <span className="text-black">
              Auto: {autoRefresh === "1min" ? "1 Min" : autoRefresh === "5min" ? "5 Min" : "15 Min"}
            </span>
          </>
        )}
        <span>•</span>
        <span>Updated: {lastRefresh.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
