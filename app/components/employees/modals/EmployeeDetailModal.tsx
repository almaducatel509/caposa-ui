"use client";

import React from 'react';
import { Modal } from "@/app/components/ui/Modal";
import {
  X, User, Phone, Mail, MapPin, CreditCard,
  Calendar, Briefcase, Building2, Clock, Pencil,
} from "lucide-react";
import UserAvatar from '@/app/components/core/UserAvatar';
import { EmployeeData, formatGender, getEmployeeStatus } from '../validations';

interface EmployeeDetailModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  employee:  EmployeeData | null;
  onEdit:    () => void;
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[#2E7D32]" />
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm font-medium text-gray-900 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
    </div>
  );
}

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  active:    { bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', dot: 'bg-[#2E7D32]', label: 'Actif'    },
  inactive:  { bg: 'bg-gray-100',  text: 'text-gray-600',  dot: 'bg-gray-400',   label: 'Inactif'  },
  suspended: { bg: 'bg-orange-50', text: 'text-orange-700',dot: 'bg-orange-500', label: 'Suspendu' },
};

const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen, onClose, employee, onEdit,
}) => {
  if (!employee) return null;

  const statusKey = getEmployeeStatus(employee);
  const status    = STATUS_CFG[statusKey] ?? STATUS_CFG.active;

  const age = employee.date_of_birth
    ? new Date().getFullYear() - new Date(employee.date_of_birth).getFullYear()
    : null;

  const formatDate = (d?: string) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';

  const formatDateTime = (d?: string) => d
    ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-3">
          <UserAvatar user={employee} size="xxl" type="employee" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900 capitalize">
                {employee.first_name} {employee.last_name}
              </h3>
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {employee.user?.username} · Réf: {employee.payment_ref}
            </p>
          </div>
        </div>
        <button onClick={onClose}
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5 max-h-[70vh]">

        {/* Informations personnelles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader title="Informations personnelles" icon={User} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Nom complet" value={`${employee.first_name} ${employee.last_name}`} />
            <InfoRow label="Genre" value={formatGender(employee.gender)} />
            <InfoRow label="Date de naissance"
              value={age
                ? <>{formatDate(employee.date_of_birth)} <span className="text-gray-400">({age} ans)</span></>
                : formatDate(employee.date_of_birth)} />
            <InfoRow label="Référence de paiement" value={employee.payment_ref} mono />
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader title="Informations de contact" icon={Phone} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Email</p>
              <a href={`mailto:${employee.user?.email}`}
                className="text-sm font-medium text-[#2E7D32] hover:underline truncate">
                {employee.user?.email || '—'}
              </a>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Téléphone</p>
              <a href={`tel:${employee.phone_number}`}
                className="text-sm font-medium text-[#2E7D32] hover:underline">
                {employee.phone_number || '—'}
              </a>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Adresse</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{employee.address || '—'}</p>
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionHeader title="Informations professionnelles" icon={Briefcase} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Nom d'utilisateur" value={employee.user?.username} />
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">Branche</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {employee.branch_details?.branch_name || '—'}
                </p>
                {employee.branch_details?.branch_code && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#DDEAD5] text-[#1B5E20] font-semibold">
                    {employee.branch_details.branch_code}
                  </span>
                )}
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1.5">
              <p className="text-xs text-gray-400">Postes</p>
              {employee.posts_details && employee.posts_details.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {employee.posts_details.map(post => (
                    <span key={post.id}
                      className="text-xs px-3 py-1 rounded-full bg-blue-50 text-[#355C7D] font-semibold capitalize">
                      {post.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">Aucun poste assigné</p>
              )}
            </div>
          </div>
        </div>

        {/* Informations système */}
        <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
          <SectionHeader title="Informations système" icon={Clock} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow label="Date de création"   value={formatDateTime(employee.created_at)} />
            <InfoRow label="Dernière modification" value={formatDateTime(employee.updated_at)} />
            <div className="sm:col-span-2 flex flex-col gap-0.5">
              <p className="text-xs text-gray-400">ID Employé</p>
              <p className="text-xs font-mono text-gray-500">{employee.id}</p>
            </div>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
        <button onClick={onClose}
          className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
          Fermer
        </button>
        <button onClick={onEdit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-md hover:shadow-lg transition-all">
          <Pencil className="w-4 h-4" /> Modifier
        </button>
      </div>

    </Modal>
  );
};

export default EmployeeDetailModal;