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
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
              Email Inbox
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {highRelevanceCount > 0 && (
                <span className="font-semibold text-blue-600">{highRelevanceCount} likely apartments</span>
              )}
              {highRelevanceCount > 0 && emailCount > highRelevanceCount && <span> • </span>}
              {emailCount} total {emailCount === 1 ? "email" : "emails"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-200">
            <Settings className="h-4 w-4 text-zinc-500" />
            <Select value={autoRefresh} onValueChange={(value) => setAutoRefresh(value || "off")}>
              <SelectTrigger className="border-none bg-transparent w-32 h-auto p-0">
                <SelectValue placeholder="Auto-refresh" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">No auto-refresh</SelectItem>
                <SelectItem value="1min">Every 1 min</SelectItem>
                <SelectItem value="5min">Every 5 min</SelectItem>
                <SelectItem value="15min">Every 15 min</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <span>Gmail emails about apartments • AI-powered extraction</span>
        {autoRefresh !== "off" && (
          <>
            <span>•</span>
            <span className="text-blue-600">
              Auto-refresh: {autoRefresh === "1min" ? "1 min" : autoRefresh === "5min" ? "5 min" : "15 min"}
            </span>
          </>
        )}
        <span>•</span>
        <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
