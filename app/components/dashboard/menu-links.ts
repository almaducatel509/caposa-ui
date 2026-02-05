import {
  AiOutlineHome, AiOutlineBranches,
  AiOutlineSchedule
} from "react-icons/ai";
import {
  HiOutlineUserGroup, HiOutlineDocumentDuplicate, HiOutlineChartBar
} from "react-icons/hi2";
import {
  MdOutlineSupervisorAccount, MdOutlineHolidayVillage
} from "react-icons/md";
import {
  GrTransaction, 
} from "react-icons/gr";
import { TfiLayoutListPost } from "react-icons/tfi";
import { LuCalendarClock, LuFolderTree } from "react-icons/lu";
import { TbBrandUbuntu } from "react-icons/tb";
import { FaHandHoldingUsd, FaClipboardList, FaMoneyCheckAlt, FaExchangeAlt } from "react-icons/fa";
import { GiTwoCoins, GiReceiveMoney, GiPayMoney, } from "react-icons/gi";
import { RiDashboardLine, RiFileList3Line, RiBarChart2Line,  } from "react-icons/ri";
import { BsFileEarmarkCheck, BsFileEarmarkBarGraph, BsShieldCheck } from "react-icons/bs";
import { IconType } from "react-icons";
import { PiVaultFill } from "react-icons/pi";
import { FiSettings } from "react-icons/fi";
// Nouveaux imports pour les rapports
import { Droplet, AlertTriangle, Users, CheckCircle, LayoutGrid } from "lucide-react";


interface SubLink {
  name: string;
  href: string;
  icon?: IconType | string;
  description?: string;
}

interface MainLink {
  name: string;
  href: string;
  icon: IconType;
  hasSubmenu?: boolean;
  subLinks?: SubLink[];
}

export const links: MainLink[] = [
  { name: 'Accueil', href: '/dashboard', icon: AiOutlineHome },

  { name: 'Employés', href: '/dashboard/employees', icon: HiOutlineUserGroup },
  { name: 'Membres', href: '/dashboard/members', icon: TbBrandUbuntu },

  { name: 'Comptes', href: '/dashboard/accounts', icon: MdOutlineSupervisorAccount },

  {
    name: 'Transactions',
    href: '/dashboard/transactions',
    icon: GrTransaction,
    hasSubmenu: true,
    subLinks: [
      { name: 'Toutes', href: '/dashboard/transactions', icon: FaClipboardList },
      { name: 'Dépôts', href: '/dashboard/transactions/deposits', icon: GiReceiveMoney },
      { name: 'Retraits', href: '/dashboard/transactions/withdrawals', icon: GiPayMoney },
      { name: 'Transferts', href: '/dashboard/transactions/transfers', icon: FaExchangeAlt },
    ],
  },
  {
    name: 'Prêts',
    href: '/dashboard/loans',
    icon: FaHandHoldingUsd,
    hasSubmenu: true,
    subLinks: [
      { name: 'Tous', href: '/dashboard/loans', icon: FaClipboardList },
      { name: 'Demandes', href: '/dashboard/loans/create', icon: FaMoneyCheckAlt },
      { name: 'Actifs', href: '/dashboard/loans/actifs', icon: HiOutlineChartBar },
    ],
  },
  {
    name: 'Trésorerie',
    href: '/dashboard/treasury',
    icon: GiTwoCoins,
    hasSubmenu: true,
    subLinks: [
      { name: "Vue d'ensemble", href: '/dashboard/treasury', icon: RiDashboardLine },
      { name: 'Encaisse', href: '/dashboard/treasury/cash', icon: GiReceiveMoney },
      { name: 'Coffre', href: '/dashboard/treasury/vault', icon: PiVaultFill },
      { name: 'Réconciliation', href: '/dashboard/treasury/reconciliation', icon: RiFileList3Line },
    ],
  },
  {
    name: 'Analyse',
    href: '/dashboard/analysis',
    icon: HiOutlineChartBar,
    hasSubmenu: true,
    subLinks: [
      { name: 'Dashboard', href: '/dashboard/analysis', icon: RiDashboardLine },
      { name: 'KPIs', href: '/dashboard/analysis/kpis', icon: RiBarChart2Line },
      // { name: 'Performance', href: '/dashboard/analysis/performance', icon: HiOutlineChartBar },
    ],
  },
  {
    name: 'Rapports',
    href: '/dashboard/reports',
    icon: HiOutlineDocumentDuplicate,
    hasSubmenu: true,
    subLinks: [
      { 
        name: 'Vue d\'ensemble', 
        href: '/dashboard/reports', 
        icon: LayoutGrid,
        description: 'Tous les rapports réglementaires'
      },
      { 
        name: 'Liquidité', 
        href: '/dashboard/reports/liquidite', 
        icon: Droplet,
        description: 'Capacité à honorer les retraits'
      },
      { 
        name: 'Qualité portefeuille', 
        href: '/dashboard/reports/portefeuille', 
        icon: AlertTriangle,
        description: 'Prêts en souffrance'
      },
      { 
        name: 'Endettement', 
        href: '/dashboard/reports/endettement', 
        icon: Users,
        description: 'Prévention du surendettement'
      },
      { 
        name: 'Conformité', 
        href: '/dashboard/reports/conformite', 
        icon: CheckCircle,
        description: 'Statut réglementaire mensuel'
      },
    ],
  },

  { name: 'Horaires', href: '/dashboard/opening-hours', icon: LuCalendarClock  },
  { name: 'Branches', href: '/dashboard/branches', icon: AiOutlineBranches },
  { name: 'Postes', href: '/dashboard/postes', icon: TfiLayoutListPost },
  { name: 'Calendrier', href: '/dashboard/holidays', icon: AiOutlineSchedule  },

  { name: 'Archives', href: '/dashboard/archives', icon: LuFolderTree },
  { name: 'Paramètres bancaires', href: '/dashboard/settings/bank', icon: FiSettings, }

];