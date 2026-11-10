import {
  AiOutlineHome, AiOutlineBranches,
  AiOutlineSchedule
} from "react-icons/ai";
import {
  HiOutlineUserGroup, HiOutlineDocumentDuplicate, HiOutlineChartBar
} from "react-icons/hi2";
import {
  MdOutlineSupervisorAccount, MdOutlineHolidayVillage,
  MdOutlineDesignServices,
  MdOutlineWorkHistory
} from "react-icons/md";
import {
  GrTransaction, 
} from "react-icons/gr";
import { TfiLayoutListPost } from "react-icons/tfi";
import { LuCalendarClock, LuFolderTree } from "react-icons/lu";
import { TbBrandUbuntu, TbFileSettings } from "react-icons/tb";
import { FaHandHoldingUsd, FaClipboardList, FaMoneyCheckAlt, FaExchangeAlt } from "react-icons/fa";
import { GiTwoCoins, GiReceiveMoney, GiPayMoney, } from "react-icons/gi";
import { RiDashboardLine, RiFileList3Line, RiBarChart2Line,  } from "react-icons/ri";
import { BsFileEarmarkCheck, BsFileEarmarkBarGraph, BsShieldCheck } from "react-icons/bs";
import { IconType } from "react-icons";
import { PiCashRegisterFill, PiVaultFill } from "react-icons/pi";
import { FiSettings } from "react-icons/fi";
import { Droplet, AlertTriangle, Users, CheckCircle, LayoutGrid } from "lucide-react";

export interface SubLink {
  name: string;
  href: string;
  icon?: IconType | string;
  description?: string;
  /** Rôles autorisés à afficher ce sous-lien. Si non défini, hérite des droits du lien parent. */
  roles?: string[];
}

export interface MainLink {
  name: string;
  href: string;
  icon: IconType;
  /** Rôles autorisés à afficher ce lien. Si non défini, accessible à tous les utilisateurs connectés. */
  roles?: string[];
  hasSubmenu?: boolean;
  subLinks?: SubLink[];
}

export const links: MainLink[] = [
  { 
    name: 'Accueil', 
    href: '/dashboard', 
    icon: AiOutlineHome 
  },

  { 
    name: 'Employés', 
    href: '/dashboard/employees', 
    icon: HiOutlineUserGroup,
    roles: ['administrateur', 'admin', 'directeur']
  },
  { 
    name: 'Membres', 
    href: '/dashboard/members', 
    icon: TbBrandUbuntu,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'conseiller', 'caissier']
  },

  { 
    name: 'Comptes', 
    href: '/dashboard/accounts', 
    icon: MdOutlineSupervisorAccount,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'conseiller', 'caissier']
  },
  { 
    name: 'Session', 
    href: '/dashboard/sessions', 
    icon: MdOutlineWorkHistory,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier', 'caissier']
  },
  { 
    name: 'Terminal', 
    href: '/dashboard/terminal', 
    icon: PiCashRegisterFill,
    roles: ['administrateur', 'admin', 'caissier']
  },

  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: GrTransaction,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'caissier'],
    hasSubmenu: true,
    subLinks: [
      { name: 'Dépôts', href: '/dashboard/transactions/deposits', icon: GiReceiveMoney },
      { name: 'Retraits', href: '/dashboard/transactions/withdrawals', icon: GiPayMoney },
      { name: 'Transferts', href: '/dashboard/transactions/transfers', icon: FaExchangeAlt },
    ],
  },
  {
    name: 'Prêts',
    href: '/dashboard/loans',
    icon: FaHandHoldingUsd,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'conseiller', 'caissier'],
  },
  {
    name: 'Trésorerie',
    href: '/dashboard/treasury',
    icon: GiTwoCoins,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier', 'caissier'],
    hasSubmenu: true,
    subLinks: [
      { 
        name: "Remise", 
        href: '/dashboard/treasury', 
        icon: PiVaultFill,
        roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier', 'caissier']
      },
      { 
        name: 'Réconciliation', 
        href: '/dashboard/treasury/reconciliation', 
        icon: RiFileList3Line,
        roles: ['administrateur', 'admin', 'directeur', 'tresorier']
      },
    ],
  },
  
  {
    name: 'Rapports',
    href: '/dashboard/rapports',
    icon: HiOutlineDocumentDuplicate,
    roles: ['administrateur', 'admin', 'directeur', 'superviseur', 'tresorier'],
  },
  { 
    name: 'Horaires', 
    href: '/dashboard/opening-hours', 
    icon: LuCalendarClock,
    roles: ['administrateur', 'admin', 'directeur']
  },
  { 
    name: 'Succursales', 
    href: '/dashboard/branches', 
    icon: AiOutlineBranches,
    roles: ['administrateur', 'admin', 'directeur']
  },
  { 
    name: 'Postes', 
    href: '/dashboard/postes', 
    icon: TfiLayoutListPost,
    roles: ['administrateur', 'admin']
  },
  { 
    name: 'Calendrier', 
    href: '/dashboard/holidays', 
    icon: AiOutlineSchedule,
    roles: ['administrateur', 'admin', 'directeur']
  },
];
