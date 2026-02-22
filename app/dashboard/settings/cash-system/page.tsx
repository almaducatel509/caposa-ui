'use client';
import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Eye, Check, X, AlertTriangle, BarChart2 } from 'lucide-react';

const roles = ['Caissier', 'Superviseur', 'Directeur', 'Trésorier'] as const;
type Role = typeof roles[number];

const roleConfig: Record<Role, { color: string; bg: string; iconBg: string; dot: string }> = {
  Caissier:    { color: 'text-[#2E7D32]',  bg: 'bg-[#DDEAD5]',      iconBg: 'bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]',   dot: 'bg-[#2E7D32]' },
  Superviseur: { color: 'text-[#355C7D]',  bg: 'bg-blue-50',        iconBg: 'bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]',   dot: 'bg-[#355C7D]' },
  Directeur:   { color: 'text-purple-700', bg: 'bg-purple-50',      iconBg: 'bg-gradient-to-br from-purple-600 to-purple-800',  dot: 'bg-purple-600' },
  Trésorier:   { color: 'text-[#D4AF37]',  bg: 'bg-yellow-50',      iconBg: 'bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]',   dot: 'bg-[#D4AF37]' },
};

const roleDescriptions: Record<Role, string> = {
  Caissier:    'Opérateur de caisse — manipule physiquement les fonds',
  Superviseur: 'Contrôleur — surveille les opérations et valide les anomalies',
  Directeur:   'Gestionnaire — pilote la performance globale',
  Trésorier:   'Gestionnaire de liquidité — coffre, remises et seuils',
};

type PermValue = '✅ Full' | '✅ Override' | '✅ Justifié' | `✅ ${string}` | `👁️ ${string}` | `📊 ${string}` | `⚠️ ${string}` | '❌';

interface Permission {
  id: string;
  label: string;
  Caissier: PermValue;
  Superviseur: PermValue;
  Directeur: PermValue;
  Trésorier: PermValue;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  permissions: Permission[];
}

const categories: Category[] = [
  {
    id: 'caisse', label: 'Gestion de Caisse', icon: '🏧',
    permissions: [
      { id: 'caisse.ouvrir',   label: 'Ouvrir la caisse',              Caissier: '✅ Full',      Superviseur: '👁️ Vue',       Directeur: '👁️ Vue',     Trésorier: '❌' },
      { id: 'caisse.fermer',   label: 'Fermer la caisse',              Caissier: '✅ Full',      Superviseur: '✅ Override',   Directeur: '❌',          Trésorier: '❌' },
      { id: 'caisse.montant',  label: 'Voir le montant en caisse',     Caissier: '✅ Full',      Superviseur: '✅ Full',       Directeur: '📊 Agrégé',  Trésorier: '✅ Full' },
      { id: 'caisse.modifier', label: 'Modifier le montant de caisse', Caissier: '❌',           Superviseur: '✅ Justifié',   Directeur: '❌',          Trésorier: '✅ Full' },
      { id: 'caisse.audit',    label: "Voir l'historique d'état",      Caissier: '👁️ Vue',      Superviseur: '✅ Full',       Directeur: '✅ Full',     Trésorier: '✅ Full' },
    ],
  },
  {
    id: 'transactions', label: 'Transactions', icon: '💳',
    permissions: [
      { id: 'tx.depot',     label: 'Faire un dépôt',                Caissier: '✅ Full',      Superviseur: '✅ Full',       Directeur: '❌',          Trésorier: '❌' },
      { id: 'tx.retrait',   label: 'Faire un retrait',              Caissier: '✅ Full',      Superviseur: '✅ Full',       Directeur: '❌',          Trésorier: '❌' },
      { id: 'tx.transfert', label: 'Faire un transfert',            Caissier: '✅ Full',      Superviseur: '✅ Full',       Directeur: '❌',          Trésorier: '✅ Full' },
      { id: 'tx.annuler',   label: 'Annuler une transaction',       Caissier: '❌',           Superviseur: '✅ Justifié',   Directeur: '❌',          Trésorier: '❌' },
      { id: 'tx.voir',      label: 'Voir les transactions du jour', Caissier: '👁️ Siennes',  Superviseur: '✅ Toutes',     Directeur: '📊 Agrégé',  Trésorier: '✅ Full' },
      { id: 'tx.exporter',  label: 'Exporter les transactions',     Caissier: '❌',           Superviseur: '✅ Full',       Directeur: '✅ Full',     Trésorier: '✅ Full' },
    ],
  },
  {
    id: 'remises', label: 'Remises', icon: '📦',
    permissions: [
      { id: 'rem.creer',     label: 'Créer une remise',               Caissier: '✅ Full',      Superviseur: '✅ Full',  Directeur: '❌',         Trésorier: '✅ Full' },
      { id: 'rem.valider',   label: 'Valider une remise',             Caissier: '❌',           Superviseur: '✅ Full',  Directeur: '❌',         Trésorier: '✅ Full' },
      { id: 'rem.historique',label: "Voir l'historique des remises",  Caissier: '👁️ Siennes',  Superviseur: '✅ Full',  Directeur: '📊 Agrégé', Trésorier: '✅ Full' },
      { id: 'rem.modifier',  label: 'Modifier une remise',            Caissier: '❌',           Superviseur: '❌',       Directeur: '❌',         Trésorier: '✅ Justifié' },
    ],
  },
  {
    id: 'coffre', label: 'Coffre', icon: '🔐',
    permissions: [
      { id: 'coffre.ouvrir',  label: 'Ouvrir le coffre',          Caissier: '❌',      Superviseur: '✅ Full',      Directeur: '❌',         Trésorier: '✅ Full' },
      { id: 'coffre.depot',   label: 'Déposer dans le coffre',    Caissier: '❌',      Superviseur: '✅ Full',      Directeur: '❌',         Trésorier: '✅ Full' },
      { id: 'coffre.retrait', label: 'Retirer du coffre',         Caissier: '❌',      Superviseur: '✅ Justifié',  Directeur: '❌',         Trésorier: '✅ Full' },
      { id: 'coffre.etat',    label: "Voir l'état du coffre",     Caissier: '👁️ Vue', Superviseur: '✅ Full',      Directeur: '📊 Agrégé', Trésorier: '✅ Full' },
      { id: 'coffre.sceller', label: 'Sceller le coffre',         Caissier: '❌',      Superviseur: '✅ Full',      Directeur: '❌',         Trésorier: '✅ Full' },
    ],
  },
  {
    id: 'reconciliation', label: 'Réconciliation', icon: '🧮',
    permissions: [
      { id: 'recon.lancer',    label: 'Lancer une réconciliation', Caissier: '✅ Full',     Superviseur: '✅ Full',  Directeur: '❌',         Trésorier: '❌' },
      { id: 'recon.valider',   label: 'Valider la réconciliation', Caissier: '❌',          Superviseur: '✅ Full',  Directeur: '❌',         Trésorier: '❌' },
      { id: 'recon.ecarts',    label: 'Voir les écarts',           Caissier: '👁️ Siens',   Superviseur: '✅ Tous',  Directeur: '📊 Agrégé', Trésorier: '✅ Full' },
      { id: 'recon.justifier', label: 'Justifier un écart',        Caissier: '✅ Siens',    Superviseur: '✅ Full',  Directeur: '❌',         Trésorier: '❌' },
    ],
  },
  {
    id: 'rapports', label: 'Rapports & Analytiques', icon: '📊',
    permissions: [
      { id: 'rpt.journalier', label: 'Rapport journalier',         Caissier: '👁️ Sien', Superviseur: '✅ Full',  Directeur: '✅ Full',  Trésorier: '✅ Full' },
      { id: 'rpt.hebdo',      label: 'Rapport hebdomadaire',       Caissier: '❌',        Superviseur: '✅ Full',  Directeur: '✅ Full',  Trésorier: '✅ Full' },
      { id: 'rpt.mensuel',    label: 'Rapport mensuel',            Caissier: '❌',        Superviseur: '👁️ Vue',  Directeur: '✅ Full',  Trésorier: '✅ Full' },
      { id: 'rpt.perf',       label: 'Performance des employés',   Caissier: '❌',        Superviseur: '✅ Full',  Directeur: '✅ Full',  Trésorier: '❌' },
      { id: 'rpt.liquidite',  label: 'Rapport de liquidité',       Caissier: '❌',        Superviseur: '👁️ Vue',  Directeur: '✅ Full',  Trésorier: '✅ Full' },
    ],
  },
  {
    id: 'employes', label: 'Gestion des Employés', icon: '👤',
    permissions: [
      { id: 'emp.voir',     label: 'Voir la liste des employés',    Caissier: '❌', Superviseur: '✅ Son équipe', Directeur: '✅ Full', Trésorier: '❌' },
      { id: 'emp.creer',    label: 'Créer un employé',              Caissier: '❌', Superviseur: '❌',            Directeur: '✅ Full', Trésorier: '❌' },
      { id: 'emp.modifier', label: 'Modifier un profil employé',    Caissier: '❌', Superviseur: '⚠️ Limité',    Directeur: '✅ Full', Trésorier: '❌' },
      { id: 'emp.suspend',  label: 'Suspendre / désactiver',        Caissier: '❌', Superviseur: '❌',            Directeur: '✅ Full', Trésorier: '❌' },
      { id: 'emp.roles',    label: 'Gérer les rôles & permissions', Caissier: '❌', Superviseur: '❌',            Directeur: '✅ Full', Trésorier: '❌' },
    ],
  },
  {
    id: 'alertes', label: 'Alertes & Conformité', icon: '🔔',
    permissions: [
      { id: 'alerte.voir',     label: 'Voir ses propres alertes',       Caissier: '✅ Full',    Superviseur: '✅ Full', Directeur: '✅ Full', Trésorier: '✅ Full' },
      { id: 'alerte.equipe',   label: "Voir alertes de son équipe",     Caissier: '❌',         Superviseur: '✅ Full', Directeur: '✅ Full', Trésorier: '❌' },
      { id: 'alerte.resoudre', label: 'Résoudre / fermer une alerte',   Caissier: '✅ Siennes', Superviseur: '✅ Full', Directeur: '❌',      Trésorier: '✅ Full' },
      { id: 'alerte.config',   label: "Configurer les seuils d'alerte", Caissier: '❌',         Superviseur: '❌',      Directeur: '✅ Full', Trésorier: '✅ Liquidité' },
    ],
  },
];

function PermBadge({ value }: { value: PermValue }) {
  if (value === '❌') {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-400 border border-red-100">
          <X className="w-3 h-3" /> Aucun
        </span>
      </div>
    );
  }
  if (value.startsWith('✅')) {
    const label = value.replace('✅ ', '');
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20">
          <Check className="w-3 h-3" /> {label}
        </span>
      </div>
    );
  }
  if (value.startsWith('👁️')) {
    const label = value.replace('👁️ ', '');
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
          <Eye className="w-3 h-3" /> {label}
        </span>
      </div>
    );
  }
  if (value.startsWith('📊')) {
    const label = value.replace('📊 ', '');
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
          <BarChart2 className="w-3 h-3" /> {label}
        </span>
      </div>
    );
  }
  if (value.startsWith('⚠️')) {
    const label = value.replace('⚠️ ', '');
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
          <AlertTriangle className="w-3 h-3" /> {label}
        </span>
      </div>
    );
  }
  return <div className="flex justify-center"><span className="text-xs text-gray-400">{value}</span></div>;
}

export default function CashSystemPermissions() {
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [openCats, setOpenCats] = useState<Set<string>>(
    () => new Set(categories.map(c => c.id))
  );

  const toggleCat = (id: string) => {
    setOpenCats(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const filteredRoles = activeRole ? [activeRole] : [...roles];

  const totalPerms = (role: Role) =>
    categories.reduce((sum, cat) =>
      sum + cat.permissions.filter(p => p[role] !== '❌').length, 0);

  const total = categories.reduce((sum, cat) => sum + cat.permissions.length, 0);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#F9F9F6] via-white to-[#DDEAD5]/20 p-8">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Permission Matrix</h1>
            <p className="text-sm text-gray-500">Référence officielle des droits d'accès par rôle — v1.0</p>
          </div>
          <div className="ml-auto bg-white rounded-2xl px-5 py-3 shadow-sm border border-gray-100 text-right">
            <p className="text-2xl font-bold text-gray-900">{total}</p>
            <p className="text-xs text-gray-500">permissions définies</p>
          </div>
        </div>
      </div>

      {/* Role filter buttons */}
      <div className="mb-6 flex gap-3 flex-wrap">
        <button
          onClick={() => setActiveRole(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            !activeRole
              ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          Tous les rôles
        </button>
        {roles.map(role => {
          const c = roleConfig[role];
          const active = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(active ? null : role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                active
                  ? `${c.bg} ${c.color} border-current shadow-sm`
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
              }`}
            >
              {role}
            </button>
          );
        })}
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(activeRole ? [activeRole] : [...roles]).map(role => {
          const c = roleConfig[role];
          return (
            <div
              key={role}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${c.iconBg}`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${c.bg} ${c.color}`}>
                  {totalPerms(role)}/{total}
                </span>
              </div>
              <h3 className={`text-lg font-bold mb-1 ${c.color}`}>{role}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{roleDescriptions[role]}</p>
            </div>
          );
        })}
      </div>

      {/* Permission categories */}
      <div className="flex flex-col gap-3">
        {categories.map(cat => {
          const isOpen = openCats.has(cat.id);
          return (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Category header */}
              <button
                onClick={() => toggleCat(cat.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#F9F9F6] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-semibold text-gray-900">{cat.label}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {cat.permissions.length} permissions
                  </span>
                </div>
                {isOpen
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </button>

              {isOpen && (
                <div className="overflow-x-auto">
                  {/* Column headers */}
                  <div
                    className="grid px-6 py-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-t border-gray-100"
                    style={{ gridTemplateColumns: `2fr ${filteredRoles.map(() => '1fr').join(' ')}` }}
                  >
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Permission
                    </div>
                    {filteredRoles.map(role => (
                      <div
                        key={role}
                        className={`text-xs font-semibold uppercase tracking-wide text-center ${roleConfig[role].color}`}
                      >
                        {role}
                      </div>
                    ))}
                  </div>

                  {/* Permission rows */}
                  {cat.permissions.map((perm, i) => (
                    <div
                      key={perm.id}
                      className={`grid px-6 py-3 items-center border-t border-gray-50 hover:bg-[#DDEAD5]/20 transition-colors ${
                        i % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
                      }`}
                      style={{ gridTemplateColumns: `2fr ${filteredRoles.map(() => '1fr').join(' ')}` }}
                    >
                      <span className="text-sm text-gray-700">{perm.label}</span>
                      {filteredRoles.map(role => (
                        <PermBadge key={role} value={perm[role]} />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">Légende</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Full / Accès complet',              el: <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20"><Check className="w-3 h-3"/>Full</span> },
            { label: 'Lecture seule',                      el: <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"><Eye className="w-3 h-3"/>Vue</span> },
            { label: 'Vue synthétique',                    el: <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100"><BarChart2 className="w-3 h-3"/>Agrégé</span> },
            { label: 'Accès restreint',                    el: <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"><AlertTriangle className="w-3 h-3"/>Limité</span> },
            { label: 'Aucun accès',                        el: <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-400 border border-red-100"><X className="w-3 h-3"/>Aucun</span> },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              {item.el}
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}