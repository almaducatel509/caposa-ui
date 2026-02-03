// components/reports/ReportDocument.tsx
"use client";

import React from "react";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

type ReportStatus = "Conforme" | "À surveiller" | "Critique";

interface ReportDocumentProps {
  title: string;
  icon?: React.ReactNode;
  period?: string;
  status: ReportStatus;
  children: React.ReactNode;
}

const statusConfig = {
  Conforme: {
    color: "bg-emerald-100 text-emerald-800",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  "À surveiller": {
    color: "bg-yellow-100 text-yellow-800",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  Critique: {
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function ReportDocument({
  title,
  icon,
  period = "Janvier 2026",
  status,
  children,
}: ReportDocumentProps) {
  const cfg = statusConfig[status];

  return (
    <section className="rounded-xl border bg-white shadow-sm">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-gray-500">Mois : {period}</p>
          </div>
        </div>

        <span
          className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${cfg.color}`}
        >
          {cfg.icon}
          {status}
        </span>
      </header>

      {/* Body */}
      <div className="px-6 py-5 space-y-3">{children}</div>

      {/* Footer */}
      <footer className="border-t px-6 py-3 text-xs text-gray-400">
        Document généré automatiquement — usage réglementaire
      </footer>
    </section>
  );
}
