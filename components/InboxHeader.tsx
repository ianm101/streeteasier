"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";

interface InboxHeaderProps {
  emailCount: number;
}

export function InboxHeader({ emailCount }: InboxHeaderProps) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Force a hard refresh of the page to re-fetch emails
    router.refresh();
    // Reset after a delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Mail className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Email Inbox</h1>
            <p className="text-sm text-zinc-500">
              {emailCount} {emailCount === 1 ? "email" : "emails"} found
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>
      <p className="text-zinc-600">
        Your Gmail emails about apartments. Click "Parse with AI" to extract
        listing details using Claude.
      </p>
    </div>
  );
}
