import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  WalletCards,
  Clock,
  Calculator,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  Repeat,
  HandCoins,
  Vault,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  CalendarClock,
  Building2,
  Briefcase,
  CalendarDays,
} from "lucide-react";

export type IconComponent = LucideIcon | ComponentType<{ className?: string }>;

export interface SubLink {
  name: string;
  href: string;
  icon?: IconComponent;
  description?: string;
  /** Rôles autorisés à afficher ce sous-lien. Si non défini, hérite des droits du lien parent. */
  roles?: string[];
}

export interface MainLink {
  name: string;
  href: string;
  icon: IconComponent;
  /** Rôles autorisés à afficher ce lien. Si non défini, accessible à tous les utilisateurs connectés. */
  roles?: string[];
  hasSubmenu?: boolean;
  subLinks?: SubLink[];
}

export const links: MainLink[] = [
  { 
    name: 'Accueil', 
    href: '/dashboard', 
    icon: LayoutDashboard,
  },

  { 
    name: 'Employés', 
    href: '/dashboard/employees', 
    icon: Users,
    roles: ['administrateur', 'admin', 'directeur']
  },
  { 
    name: 'Membres', 
    href: '/dashboard/members', 
    icon: UserCheck,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'conseiller', 'caissier']
  },

  { 
    name: 'Comptes', 
    href: '/dashboard/accounts', 
    icon: WalletCards,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'conseiller', 'caissier']
  },
  { 
    name: 'Session', 
    href: '/dashboard/sessions', 
    icon: Clock,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier', 'caissier']
  },
  { 
    name: 'Terminal', 
    href: '/dashboard/terminal', 
    icon: Calculator,
    roles: ['administrateur', 'admin', 'caissier']
  },

  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: ArrowLeftRight,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'caissier'],
    hasSubmenu: true,
    subLinks: [
      { name: 'Dépôts', href: '/dashboard/transactions/deposits', icon: ArrowDownLeft },
      { name: 'Retraits', href: '/dashboard/transactions/withdrawals', icon: ArrowUpRight },
      { name: 'Transferts', href: '/dashboard/transactions/transfers', icon: Repeat },
    ],
  },
  {
    name: 'Prêts',
    href: '/dashboard/loans',
    icon: HandCoins,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'conseiller', 'caissier'],
  },
  {
    name: 'Trésorerie',
    href: '/dashboard/treasury',
    icon: Vault,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier', 'caissier'],
    hasSubmenu: true,
    subLinks: [
      { 
        name: "Remise", 
        href: '/dashboard/treasury', 
        icon: ShieldCheck,
        roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier', 'caissier']
      },
      { 
        name: 'Réconciliation', 
        href: '/dashboard/treasury/reconciliation', 
        icon: Scale,
        roles: ['administrateur', 'admin', 'directeur', 'tresorier']
      },
    ],
  },
  
  {
    name: 'Rapports',
    href: '/dashboard/rapports',
    icon: FileSpreadsheet,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier'],
  },
  { 
    name: 'Horaires', 
    href: '/dashboard/opening-hours', 
    icon: CalendarClock,
    roles: ['administrateur', 'admin', 'directeur']
  },
  { 
    name: 'Succursales', 
    href: '/dashboard/branches', 
    icon: Building2,
    roles: ['administrateur', 'admin', 'directeur']
  },
  { 
    name: 'Postes', 
    href: '/dashboard/postes', 
    icon: Briefcase,
    roles: ['administrateur', 'admin']
  },
  { 
    name: 'Calendrier', 
    href: '/dashboard/holidays', 
    icon: CalendarDays,
    roles: ['administrateur', 'admin', 'directeur']
  },
];
