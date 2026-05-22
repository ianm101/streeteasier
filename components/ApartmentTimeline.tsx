"use client";

import { formatDistanceToNow } from "date-fns";
import { Calendar, CheckCircle, Clock, FileText, Home, Key, UserCheck } from "lucide-react";

interface TimelineEvent {
  id: string;
  event: string;
  description: string;
  occurredAt: Date;
  createdAt: Date;
}

interface ApartmentTimelineProps {
  timeline: TimelineEvent[];
}

const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  inquiry_sent: FileText,
  tour_scheduled: Calendar,
  tour_completed: CheckCircle,
  application_submitted: FileText,
  application_approved: UserCheck,
  lease_signed: Key,
};

const EVENT_LABELS: Record<string, string> = {
  inquiry_sent: "Inquiry Sent",
  tour_scheduled: "Tour Scheduled",
  tour_completed: "Tour Completed",
  application_submitted: "Application Submitted",
  application_approved: "Application Approved",
  lease_signed: "Lease Signed",
};

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  inquiry_sent: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  tour_scheduled: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  tour_completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  application_submitted: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  application_approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  lease_signed: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
};

export function ApartmentTimeline({ timeline }: ApartmentTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-8 text-center">
        <Clock className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="font-semibold text-zinc-700 mb-1">No Timeline Yet</h3>
        <p className="text-sm text-zinc-500">
          Events will appear here as you progress with this apartment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-zinc-600" />
        <h3 className="font-semibold text-lg text-zinc-900">Timeline</h3>
        <span className="text-sm text-zinc-500">({timeline.length} events)</span>
      </div>

      <div className="relative space-y-6">
        {/* Timeline line */}
        <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-zinc-200" />

        {timeline.map((event, index) => {
          const Icon = EVENT_ICONS[event.event] || Home;
          const colors = EVENT_COLORS[event.event] || { bg: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-200" };
          const label = EVENT_LABELS[event.event] || event.event;

          return (
            <div key={event.id} className="relative flex gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${colors.bg} ${colors.text} border-2 ${colors.border} flex items-center justify-center z-10 bg-white`}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className={`font-semibold ${colors.text}`}>{label}</h4>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-700">{event.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
