"use client";

import { FileText, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";

interface Document {
  id: string;
  name: string;
  required: boolean;
  status: string;
  fileUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DocumentChecklistProps {
  documents: Document[];
}

const STATUS_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "text-amber-600" },
  uploaded: { icon: CheckCircle2, label: "Uploaded", color: "text-blue-600" },
  approved: { icon: CheckCircle2, label: "Approved", color: "text-green-600" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-red-600" },
};

export function DocumentChecklist({ documents }: DocumentChecklistProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-zinc-50 rounded-lg border border-zinc-200 p-8 text-center">
        <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
        <h3 className="font-semibold text-zinc-700 mb-1">No Documents Required</h3>
        <p className="text-sm text-zinc-500">
          Document requirements will appear here when extracted from emails
        </p>
      </div>
    );
  }

  const requiredDocs = documents.filter(doc => doc.required);
  const optionalDocs = documents.filter(doc => !doc.required);
  const completedCount = documents.filter(doc => doc.status === "approved" || doc.status === "uploaded").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-zinc-600" />
          <h3 className="font-semibold text-lg text-zinc-900">Documents</h3>
        </div>
        <div className="text-sm">
          <span className="font-semibold text-green-600">{completedCount}</span>
          <span className="text-zinc-500"> / {documents.length} complete</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-zinc-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all duration-500"
          style={{ width: `${(completedCount / documents.length) * 100}%` }}
        />
      </div>

      {/* Required documents */}
      {requiredDocs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-700 uppercase tracking-wide">Required</h4>
          {requiredDocs.map((doc) => {
            const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <StatusIcon className={`h-5 w-5 ${statusConfig.color} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="font-medium text-zinc-900">{doc.name}</h5>
                      <span className={`text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    {doc.notes && (
                      <p className="text-sm text-zinc-600 mb-2">{doc.notes}</p>
                    )}
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View file
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Optional documents */}
      {optionalDocs.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Optional</h4>
          {optionalDocs.map((doc) => {
            const statusConfig = STATUS_CONFIG[doc.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={doc.id}
                className="bg-zinc-50 rounded-lg border border-zinc-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon className={`h-4 w-4 ${statusConfig.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-medium text-zinc-700">{doc.name}</h5>
                      <span className={`text-xs ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
