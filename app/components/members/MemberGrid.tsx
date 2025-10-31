'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardBody, Button } from '@nextui-org/react';
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { FaUsers } from 'react-icons/fa6';

// API fetchers (adjust paths if different)
import { createMember, fetchMembers } from '@/app/lib/api/members';
import { fetchBranches } from '@/app/lib/api/branche';

// UI
import MemberFilterBar from './MemberFilterBar';

// Types (adjust path to your member validations/types)
import { BranchData } from '@/app/components/employees/validations'; // reuse BranchData type if you already have it
import { MemberData } from '@/app/components/members/validations';
import CreateMemberForm from './CreateMemberForm';
// replace local helpers with imports (if you have them already)
import {
  accountTypeLabel,
  formatMoney,         // HTG version from your validations
} from "@/app/components/members/validations";


// ---------------------------------------------
// Helpers (NO exports here to avoid import confusion)
// ---------------------------------------------
type MemberApiAccount = {
  id: string;
  balance: string;
  account_number: string;
  account_type: string;
};

type MemberApiItem = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  department: string;
  city: string;
  address: string;
  gender: 'M' | 'F' | string;
  date_of_birthday: string;
  email: string | null;
  id_number: string | null;
  created_at: string;
  updated_at: string;
  status?: 'active' | 'inactive' | 'suspended' | boolean;
  branch?: string | null;
  accounts: MemberApiAccount[];
  photo_url: string | null;
};

function toDigits(s?: string | null) {
  return (s ?? '').replace(/\D/g, '');
}

function displayPhone(raw?: string | null) {
  if (!raw) return '—';
  const digits = toDigits(raw);
  if (digits.length === 8) return `+509${digits}`;
  if (raw.startsWith('+')) return raw;
  return raw;
}

function normalizeMemberFromApi(api: MemberApiItem): MemberData & {
  _status?: string;
  _branch?: string | null;
} 
{
  // Map to your MemberData; adapt field names if your MemberData differs
  const accounts =
    (api.accounts ?? []).map((a) => ({
      id: a.id,
      account_number: a.account_number,
      account_type: a.account_type,
      balance: isNaN(Number(a.balance)) ? undefined : Number(a.balance),
    })) ?? [];

  const base: any = {
    id: api.id,
    first_name: api.first_name,
    last_name: api.last_name,
    gender: api.gender === 'M' || api.gender === 'F' ? api.gender : 'F',
    date_of_birthday: api.date_of_birthday,
    phone_number: api.phone_number,
    address: api.address,
    city: api.city,
    department: api.department,
    email: api.email ?? undefined,
    id_number: api.id_number ?? undefined,
    created_at: api.created_at,
    updated_at: api.updated_at,
    accounts,
    photo_profil: api.photo_url,
  };

  // Keep optional filters compatible
  base._status =
    typeof api.status === 'string'
      ? api.status
      : api.status === true
      ? 'active'
      : api.status === false
      ? 'inactive'
      : undefined;

  base._branch = api.branch ?? null;

  return base as MemberData & { _status?: string; _branch?: string | null };
}

type MemberGridRow = {
  id: string | number;
  name: string;
  phone: string;
  department: string;
  city: string;
  gender: string;
  date_of_birthday: string;
  account_number: string;
  account_type: string;
  balance: string;
  status: string;
  created_at: string;
  updated_at: string;
  _member: MemberData & { _status?: string; _branch?: string | null };
};

function memberToGridRow(m: MemberData & { _status?: string; _branch?: string | null }): MemberGridRow {
  const primary = m.accounts?.[0];
  const bal = typeof primary?.balance === 'number' ? primary!.balance : undefined;

  return {
    id: m.id,
    name: `${m.first_name ?? ''} ${m.last_name ?? ''}`.trim(),
    phone: displayPhone(m.phone_number),
    department: m.department || '—',
    city: m.city || '—',
    gender: (m.gender as string) || '—',
    date_of_birthday: m.date_of_birthday || '—',
    account_number: primary?.account_number || '—',
    account_type: accountTypeLabel(primary?.account_type),
    balance: formatMoney(bal),
    status: m._status ?? '—',
    created_at: m.created_at || '—',
    updated_at: m.updated_at || '—',
    _member: m,
  };
}

// ---------------------------------------------
// Component (DEFAULT export only, like EmployeeGrid)
// ---------------------------------------------
interface MemberGridProps {
  members?: MemberData[]; // optional if you want to inject data
}

const MemberGrid: React.FC<MemberGridProps> = ({ members: initialMembers }) => {
  // data
  const [members, setMembers] = useState<(MemberData & { _status?: string; _branch?: string | null })[]>([]);
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement|null>(null);
  const [isImporting, setIsImporting] = useState(false);
// state in the parent
  const [selected, setSelected] = useState<MemberData|null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // handlers in the parent
  const onView = (m: MemberData) => { setSelected(m); setShowDetail(true); };
  const onEdit = (m: MemberData) => { setSelected(m); setShowEdit(true); };
  const onDelete = (m: MemberData) => { setSelected(m); setShowDelete(true); };
  const onViewTransactions = (m: MemberData) => { /* open tx modal if you have one */ };

  // filters (same pattern as EmployeeGrid)
  const [filterValue, setFilterValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState(filterValue);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(filterValue), 300);
    return () => clearTimeout(t);
  }, [filterValue]);

  // load
  const loadMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [branchesData, apiMembers] = await Promise.all([
        fetchBranches().catch(() => [] as BranchData[]),
        initialMembers
          ? Promise.resolve(initialMembers)
          : fetchMembers().then((arr: MemberApiItem[]) => arr.map(normalizeMemberFromApi)),
      ]);

      setBranches(branchesData || []);
      setMembers(apiMembers as any);
    } catch (e) {
      console.error('Erreur lors du chargement des données :', e);
      setError("Impossible de charger les données des membres.");
    } finally {
      setIsLoading(false);
    }
  }, [initialMembers]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // filtering
  const filteredMembers = useMemo(() => {
    let list = members;

    // search
    if (debouncedValue) {
      const q = debouncedValue.toLowerCase();
      list = list.filter((m) =>
        [
          m.first_name,
          m.last_name,
          m.phone_number,
          m.city,
          m.department,
          m.accounts?.[0]?.account_number,
          m.accounts?.[0]?.account_type,
          (m._status ?? '').toString(),
        ]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }

    // branch (only if your members carry _branch)
    if (selectedBranch !== 'all') {
      list = list.filter((m) => (m as any)._branch === selectedBranch);
    }

    // status
    if (selectedStatus !== 'all') {
      list = list.filter((m) => (m as any)._status === selectedStatus);
    }

    // period filter on created_at
    const today = new Date();
    const y = today.getFullYear();
    const mth = today.getMonth();

    switch (selectedFilter) {
      case 'recent':
        list = list.filter((m) => {
          if (!m.created_at) return false;
          const d = new Date(m.created_at);
          const days = (today.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return days <= 30;
        });
        break;
      case 'thisMonth':
        list = list.filter((m) => {
          if (!m.created_at) return false;
          const d = new Date(m.created_at);
          return d.getMonth() === mth && d.getFullYear() === y;
        });
        break;
      case 'thisYear':
        list = list.filter((m) => {
          if (!m.created_at) return false;
          return new Date(m.created_at).getFullYear() === y;
        });
        break;
    }

    // newest first
    return list.sort((a, b) => {
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
    });
  }, [members, debouncedValue, selectedFilter, selectedBranch, selectedStatus]);

  // export (same idea as EmployeeGrid)
  const handleExport = useCallback(() => {
    try {
      const rows = filteredMembers.map(memberToGridRow);
      const header =
        'Nom,Prénom,Email,Téléphone,Genre,Date de naissance,Adresse,Branche,Statut,Créé le';
      const lines = rows.map((r) =>
        [
          `"${r.name.split(' ').slice(-1)[0] || ''}"`, // last name (best effort)
          `"${r.name.split(' ').slice(0, -1).join(' ') || ''}"`, // first name (best effort)
          `"${r._member?.email || ''}"`,
          `"${r.phone}"`,
          `"${r.gender}"`,
          `"${r.date_of_birthday}"`,
          `"${r._member?.address || ''}"`,
          `"${(r._member as any)._branch || ''}"`,
          `"${r.status || ''}"`,
          `"${r.created_at || ''}"`,
        ].join(','),
      );

      const csv = [header, ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `members_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Export failed:', e);
    }
  }, [filteredMembers]);

  // handler d’import
const handleImport = () => {
  fileInputRef.current?.click();
};

 const handleAdd = () => {
  setShowCreate(true);
};

const parseCsv = async (file: File) => {
  const text = await file.text();
  const [headerLine, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",").map(h => h.trim().replace(/^"|"$/g, ""));

  // colonnes attendues (adaptables) :
  // first_name,last_name,id_number,phone_number,department,city,address,gender,date_of_birthday
  const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const rows = lines.map(l => {
    // split très simple ; si tu as des virgules dans les champs, mets une lib (PapaParse)
    const cols = l.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    return {
      first_name: cols[idx("first_name")] || "",
      last_name: cols[idx("last_name")] || "",
      id_number: cols[idx("id_number")] || "",
      phone_number: (cols[idx("phone_number")] || "").replace(/\D/g, ""),
      // ⚠️ côté API, on envoie le NOM du département (ex: "Nord")
      department: cols[idx("department")] || "",
      city: cols[idx("city")] || "",
      address: cols[idx("address")] || "",
      gender: (cols[idx("gender")] || "M") as "M"|"F",
      date_of_birthday: cols[idx("date_of_birthday")] || "",
    };
  });

  return rows;
};

const onFilePicked: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  setIsImporting(true);
  try {
    const rows = await parseCsv(file);

    // on boucle ; pour de gros volumes -> backend “bulk”
    for (const r of rows) {
      // on construit un faux MemberUiForm minimal pour réutiliser toMemberApiFormData
      const fd = new FormData();
      fd.append("first_name", r.first_name);
      fd.append("last_name", r.last_name);
      fd.append("id_number", r.id_number);
      fd.append("phone_number", r.phone_number);
      fd.append("department", r.department);         // <- NOM du département
      fd.append("city", r.city);
      fd.append("address", r.address);
      fd.append("gender", r.gender);
      fd.append("date_of_birthday", r.date_of_birthday);

      await createMember(fd);
    }

    await loadMembers();
    alert(`Import terminé: ${rows.length} membre(s) créé(s).`);
  } catch (err) {
    console.error(err);
    alert("Échec de l'import. Vérifie le format du CSV.");
  } finally {
    setIsImporting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};
  // loading skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardBody className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // rows for view
  const rows = filteredMembers.map(memberToGridRow);

  return (
    <div className="flex flex-col gap-4 px-6 py-4 w-full bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <p className="text-red-700">{error}</p>
          <Button size="sm" onClick={loadMembers} className="mt-2 bg-red-600 text-white">
            Réessayer
          </Button>
        </div>
      )}

      {/* ✅ use the same FilterBar pattern */}
      <MemberFilterBar
        filterValue={filterValue}
        selectedFilter={selectedFilter}
        selectedBranch={selectedBranch}
        selectedStatus={selectedStatus}
        branches={branches}
        onSearchChange={(v) => setFilterValue(v ?? '')}
        onClear={() => setFilterValue('')}
        onFilterChange={setSelectedFilter}
        onBranchChange={setSelectedBranch}
        onStatusChange={setSelectedStatus}
        onAdd={handleAdd}
        onImport={handleImport}
        onExport={handleExport}
        totalCount={rows.length}
        importLoading={isImporting}   // 👈 here

      />

      <div className="text-sm text-[#2c2e2f]/70">{rows.length} membre(s) trouvé(s)</div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {rows.length > 0 ? (
          rows.map((row) => (
            <Card key={row.id} className="shadow-md">
              <CardBody className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-[#2c2e2f]">{row.name}</div>
                    <div className="text-xs text-[#2c2e2f]/60">Né(e) le {row.date_of_birthday}</div>
                  </div>
                  <div className="text-xs px-2 py-1 rounded bg-gray-100">{row.gender}</div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div>
                    <span className="text-[#2c2e2f]/60">Téléphone:</span>{' '}
                    <span className="font-medium">{row.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#2c2e2f]/60">Ville / Dept:</span>{' '}
                    <span className="font-medium">
                      {row.city} / {row.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#2c2e2f]/60">Compte #:</span>{' '}
                    <span className="font-medium">{row.account_number}</span>
                  </div>
                  <div>
                    <span className="text-[#2c2e2f]/60">Type:</span>{' '}
                    <span className="font-medium">{row.account_type}</span>
                  </div>
                  <div>
                    <span className="text-[#2c2e2f]/60">Solde:</span>{' '}
                    <span className="font-semibold">{row.balance}</span>
                  </div>
                  <div>
                    <span className="text-[#2c2e2f]/60">Statut:</span>{' '}
                    <span className="font-medium">{row.status}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="flat" onClick={() => console.log('Voir', row.id)}>
                    Voir
                  </Button>
                  <Button size="sm" variant="flat" onClick={() => console.log('Éditer', row.id)}>
                    Éditer
                  </Button>
                  <Button size="sm" variant="flat" onClick={() => console.log('Transactions', row.id)}>
                    Transactions
                  </Button>
                  <Button size="sm" color="danger" variant="flat" onClick={() => console.log('Supprimer', row.id)}>
                    Supprimer
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-8xl mb-4 text-gray-300">
              <FaUsers />
            </div>
            <h3 className="text-xl font-semibold text-[#2c2e2f] mb-2">
              {filterValue ? 'Aucun membre trouvé' : 'Aucun membre'}
            </h3>
            <p className="text-[#2c2e2f]/70 mb-4">
              {filterValue ? 'Essayez de modifier vos critères de recherche' : 'Commencez par ajouter votre premier membre'}
            </p>
            {filterValue ? (
              <Button onClick={() => setFilterValue('')} variant="light" className="text-[#34963d]">
                Effacer les filtres
              </Button>
            ) : (
              <Button onClick={handleAdd} className="bg-[#34963d] text-white">
                Ajouter un membre
              </Button>
            )}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={onFilePicked}
        className="hidden"
      />

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} size="3xl" backdrop="blur">
      <ModalContent>
        <ModalHeader>Créer un membre</ModalHeader>
        <ModalBody>
          <CreateMemberForm
            onSuccess={() => {
              setShowCreate(false);
              loadMembers();           // ✅ rafraîchir la liste
            }}
            onCancel={() => setShowCreate(false)}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
    </div>
  );
};
export default MemberGrid;


