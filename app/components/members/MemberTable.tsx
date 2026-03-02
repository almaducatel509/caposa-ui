'use client';

import React, { useState, useMemo } from 'react';
import {
  Eye, Edit, Trash2, Banknote,
  Mail, Phone, MapPin,
  ChevronUp, ChevronDown, ChevronsUpDown,
  Check, CheckCircle2, X, CreditCard
} from 'lucide-react';

import { MemberData, getMemberInitials } from './validations';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface MemberTableProps {
  members: MemberData[];
  isLoading: boolean;
  onView: (m: MemberData) => void;
  onEdit: (m: MemberData) => void;
  onDelete: (m: MemberData) => void;
  onViewTransactions?: (m: MemberData) => void;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: string;
  sortField: string;
  sortDir: string;
}) {
  if (sortField !== field)
    return <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300" />;

  return sortDir === 'asc'
    ? <ChevronUp className="w-3.5 h-3.5 text-[#2E7D32]" />
    : <ChevronDown className="w-3.5 h-3.5 text-[#2E7D32]" />;
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

const MemberTable: React.FC<MemberTableProps> = ({
  members,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onViewTransactions,
}) => {
  const [sortField, setSortField] = useState('last_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  // ── Tri ─────────────────────────────────

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      let va: any = (a as any)[sortField] ?? '';
      let vb: any = (b as any)[sortField] ?? '';

      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();

      return sortDir === 'asc'
        ? va < vb ? -1 : va > vb ? 1 : 0
        : va > vb ? -1 : va < vb ? 1 : 0;
    });
  }, [members, sortField, sortDir]);

  // ── Sélection ──────────────────────────

  const allSelected = selected.size === sorted.length && sorted.length > 0;
  const toggleAll = () =>
    allSelected
      ? setSelected(new Set())
      : setSelected(new Set(sorted.map((m) => m.id)));

  const toggleRow = (id: string | number) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  // ───────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div
        className="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200 px-5 py-3"
        style={{
          display: 'grid',
          gridTemplateColumns: '40px 2.5fr 2fr 1.5fr 1fr 130px',
        }}
      >
        <div className="flex items-center justify-center">
          <button
            onClick={toggleAll}
            className={`w-4 h-4 rounded-md border-2 flex items-center justify-center ${
              allSelected
                ? 'bg-[#2E7D32] border-[#2E7D32]'
                : 'bg-white border-gray-300'
            }`}
          >
            {allSelected && (
              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
            )}
          </button>
        </div>

        {[
          { label: 'Membre', field: 'last_name' },
          { label: 'Contact', field: null },
          { label: 'Localisation', field: 'city' },
          { label: 'Solde', field: 'total_amount' },
        ].map((col) => (
          <button
            key={col.label}
            onClick={() => col.field && toggleSort(col.field)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-left text-gray-600"
          >
            {col.label}
            {col.field && (
              <SortIcon
                field={col.field}
                sortField={sortField}
                sortDir={sortDir}
              />
            )}
          </button>
        ))}

        <span className="text-xs font-semibold uppercase tracking-wide text-center text-gray-600">
          Actions
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {sorted.map((member) => {
          const initials = getMemberInitials(member);
          const isSelected = selected.has(member.id);

          return (
            <div
              key={member.id}
              className={`grid items-center px-5 py-3.5 transition-all ${
                isSelected
                  ? 'bg-[#DDEAD5]/50 border-l-2 border-[#2E7D32]'
                  : 'hover:bg-[#DDEAD5]/10'
              }`}
              style={{
                gridTemplateColumns:
                  '40px 2.5fr 2fr 1.5fr 1fr 130px',
              }}
            >
              {/* Checkbox */}
              <div className="flex justify-center">
                <button
                  onClick={() => toggleRow(member.id)}
                  className="w-4 h-4 border-2 rounded-md border-gray-300"
                />
              </div>

              {/* Membre */}
              <div className="flex items-center gap-3">
                {member.photo_profil ? (
                  <img
                    src={member.photo_profil}
                    className="w-9 h-9 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center text-white text-xs font-bold">
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold">
                    {member.first_name} {member.last_name}
                  </p>
                  {member.id_member && (
                    <p className="text-xs text-gray-400">
                      #{member.id_member}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="text-xs text-gray-500 flex flex-col gap-1">
                {member.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {member.email}
                  </div>
                )}
                {member.phone_number && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {member.phone_number}
                  </div>
                )}
              </div>

              {/* Localisation */}
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-300" />
                {member.city}
              </div>

              {/* Solde */}
              <div className="text-sm font-semibold text-[#1B5E20]">
                {member.total_amount?.toLocaleString('fr-FR')} HTG
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-1">
                <button onClick={() => onView(member)}>
                  <Eye className="w-4 h-4 text-blue-500" />
                </button>

                <button onClick={() => onEdit(member)}>
                  <Edit className="w-4 h-4 text-[#2E7D32]" />
                </button>

                {onViewTransactions && (
                  <button onClick={() => onViewTransactions(member)}>
                    <Banknote className="w-4 h-4 text-purple-500" />
                  </button>
                )}

                <button onClick={() => onDelete(member)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
        <div className="mb-2 p-2.5 bg-yellow-200 text-sm text-gray-800 rounded">
        Voir les recommandations finales dans le fichier <span className="font-semibold">Recommandation.md</span>
        </div>
    </div>
  );
};

export default MemberTable;