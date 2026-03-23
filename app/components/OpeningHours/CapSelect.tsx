import React from "react";

interface CapSelectProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
  /** Optional lucide-react icon shown on the left inside the select */
  icon?: React.ReactNode;
}

export default function CapSelect({
  label, value, disabled, onChange, children, icon,
}: CapSelectProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {/* Leading icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}

        <select
          value={value}
          disabled={disabled}
          onChange={e => onChange(e.target.value)}
          className={`w-full ${icon ? "pl-9" : "pl-4"} pr-8 py-2.5 border border-gray-300 rounded-xl
                     text-sm text-gray-700 bg-white appearance-none
                     focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]
                     disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed transition-all`}
        >
          {children}
        </select>

        {/* Custom chevron (replaces native arrow hidden by appearance-none) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}