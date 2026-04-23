'use client';
import { CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';

export type ConformityStatus = 'conforme' | 'ecart' | 'non_conforme';

interface AuditConformityBadgeProps {
  status: ConformityStatus;
}

const CONFIG: Record<ConformityStatus, {
  label: string;
  Icon:  React.ElementType;
  bg:    string;
  text:  string;
  ring:  string;
}> = {
  conforme: {
    label: 'Conforme',
    Icon:  CheckCircle2,
    bg:    'bg-green-50',
    text:  'text-green-700',
    ring:  'ring-green-200',
  },
  ecart: {
    label: 'Écart détecté',
    Icon:  AlertTriangle,
    bg:    'bg-amber-50',
    text:  'text-amber-700',
    ring:  'ring-amber-200',
  },
  non_conforme: {
    label: 'Non conforme',
    Icon:  ShieldAlert,
    bg:    'bg-red-50',
    text:  'text-red-700',
    ring:  'ring-red-200',
  },
};

export default function AuditConformityBadge({ status }: AuditConformityBadgeProps) {
  const cfg = CONFIG[status];
  const Icon = cfg.Icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}