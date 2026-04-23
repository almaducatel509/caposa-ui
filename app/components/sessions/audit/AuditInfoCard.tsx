'use client';
import { ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────────────────────

export interface InfoRow {
  label:  string;
  value:  ReactNode;
  Icon?:  React.ElementType;
  mono?:  boolean;
  highlight?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

interface AuditInfoCardProps {
  title:    string;
  Icon:     React.ElementType;
  rows:     InfoRow[];
  footer?:  ReactNode;
  banner?:  {
    kind:    'success' | 'warning' | 'danger' | 'info';
    title:   string;
    message: string;
    Icon?:   React.ElementType;
  };
}

// ─── Couleurs selon highlight ──────────────────────────────────────

const HIGHLIGHT_CLASS: Record<NonNullable<InfoRow['highlight']>, string> = {
  default: 'text-gray-900',
  success: 'text-[#1B5E20]',
  warning: 'text-amber-700',
  danger:  'text-red-600',
  info:    'text-blue-700',
};

// ─── Bannière ──────────────────────────────────────────────────────

const BANNER_CLASS: Record<NonNullable<AuditInfoCardProps['banner']>['kind'], {
  bg: string; text: string; ring: string;
}> = {
  success: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  warning: { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
  danger:  { bg: 'bg-red-50',   text: 'text-red-700',   ring: 'ring-red-200'   },
  info:    { bg: 'bg-blue-50',  text: 'text-blue-700',  ring: 'ring-blue-200'  },
};

// ─── Component ─────────────────────────────────────────────────────

export default function AuditInfoCard({
  title, Icon, rows, footer, banner,
}: AuditInfoCardProps) {

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300">

      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50">
        <Icon className="w-4 h-4 text-[#2E7D32]" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>

      {/* ── Rows ── */}
      <div className="divide-y divide-gray-50">
        {rows.map((row, i) => {
          const RowIcon = row.Icon;
          const valueColor = HIGHLIGHT_CLASS[row.highlight ?? 'default'];
          return (
            <div key={i} className="flex items-center justify-between px-5 py-2.5 gap-4">
              <span className="text-xs text-gray-500 flex items-center gap-1.5 shrink-0">
                {RowIcon && <RowIcon className="w-3.5 h-3.5 text-gray-400" />}
                {row.label}
              </span>
              <span className={`text-sm font-semibold text-right truncate ${row.mono ? 'font-mono' : ''} ${valueColor}`}>
                {row.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Footer optionnel ── */}
      {footer && (
        <div className="px-5 py-3 border-t border-gray-50">
          {footer}
        </div>
      )}

      {/* ── Bannière conformité ── */}
      {banner && (() => {
        const bCfg = BANNER_CLASS[banner.kind];
        const BIcon = banner.Icon;
        return (
          <div className={`mx-4 mb-4 mt-2 flex items-start gap-2.5 p-3 rounded-xl ring-1 ${bCfg.bg} ${bCfg.ring}`}>
            {BIcon && <BIcon className={`w-4 h-4 shrink-0 mt-0.5 ${bCfg.text}`} />}
            <div className="min-w-0">
              <p className={`text-xs font-semibold ${bCfg.text}`}>{banner.title}</p>
              <p className={`text-xs mt-0.5 ${bCfg.text} opacity-80`}>{banner.message}</p>
            </div>
          </div>
        );
      })()}

    </div>
  );
}