// app/dashboard/reports/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/app/components/header";
import { FileText, Droplet, AlertTriangle, Users, CheckCircle, ArrowRight, Calendar, Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Rapports Réglementaires | CAPOSA",
  description: "Vue d'ensemble des rapports réglementaires obligatoires",
};

// Configuration des rapports
const rapports = [
  {
    id: 'liquidite',
    title: 'Rapport de Liquidité',
    description: 'Analyse de la capacité à honorer les retraits immédiats',
    icon: Droplet,
    iconColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    href: '/dashboard/reports/liquidite',
    kpiPrincipal: 'Ratio de liquidité',
    seuilMin: '≥ 15%',
    derniereValeur: '18.4%',
    statut: 'conforme' as const,
  },
  {
    id: 'portefeuille',
    title: 'Qualité du Portefeuille',
    description: 'Surveillance des prêts en souffrance et risques',
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    href: '/dashboard/reports/portefeuille',
    kpiPrincipal: 'Prêts en souffrance',
    seuilMax: '≤ 5%',
    derniereValeur: '4.2%',
    statut: 'conforme' as const,
  },
  {
    id: 'endettement',
    title: 'Endettement des Membres',
    description: 'Prévention du surendettement et capacité de remboursement',
    icon: Users,
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    href: '/dashboard/reports/endettement',
    kpiPrincipal: 'Ratio d\'endettement moyen',
    seuilMax: '≤ 35%',
    derniereValeur: '32.1%',
    statut: 'conforme' as const,
  },
  {
    id: 'conformite',
    title: 'Conformité Globale',
    description: 'Synthèse du statut réglementaire mensuel',
    icon: CheckCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    href: '/dashboard/reports/conformite',
    kpiPrincipal: 'Indicateurs conformes',
    seuilMin: '100%',
    derniereValeur: '6/7',
    statut: 'attention' as const,
  },
];

const getStatutBadge = (statut: 'conforme' | 'attention' | 'critique') => {
  switch (statut) {
    case 'conforme':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border-2 border-green-300">
          <CheckCircle className="w-3 h-3" />
          Conforme
        </span>
      );
    case 'attention':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border-2 border-yellow-300">
          <AlertTriangle className="w-3 h-3" />
          À surveiller
        </span>
      );
    case 'critique':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border-2 border-red-300">
          <AlertTriangle className="w-3 h-3" />
          Critique
        </span>
      );
  }
};

export default function RapportsPage() {
  const periode = "Janvier 2026";
  const dateGeneration = new Date().toLocaleDateString('fr-FR');

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-200 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <PageHeader
              title="Rapports Réglementaires"
              subtitle="Rapports obligatoires pour la conformité BRH"
              icon={<FileText className="text-4xl text-indigo-600" />}
            />
            
            {/* Période et date */}
            <div className="text-right">
              <p className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                <Calendar className="w-4 h-4" />
                Période
              </p>
              <p className="text-xl font-bold text-indigo-600">{periode}</p>
              <p className="text-xs text-gray-500 mt-1">
                Généré le {dateGeneration}
              </p>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Download className="w-4 h-4" />
              Télécharger tous (PDF)
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exporter (Excel)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Note d'information */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-8">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">
                📋 Rapports Réglementaires Obligatoires
              </h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Ces rapports sont requis par la réglementation haïtienne de la microfinance. 
                Ils doivent être présentés mensuellement au comité de gestion et transmis 
                à la <strong>BRH (Banque de la République d'Haïti)</strong> selon les échéances réglementaires.
              </p>
            </div>
          </div>
        </div>

        {/* Grille des rapports */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rapports.map((rapport) => {
            const Icon = rapport.icon;
            return (
              <Link key={rapport.id} href={rapport.href}>
                <div className={`bg-white border-2 ${rapport.borderColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl ${rapport.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${rapport.iconColor}`} />
                    </div>
                    {getStatutBadge(rapport.statut)}
                  </div>

                  {/* Titre et description */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                    {rapport.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {rapport.description}
                  </p>

                  {/* KPI principal */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-gray-600 mb-1">{rapport.kpiPrincipal}</p>
                    <div className="flex items-baseline justify-between">
                      <p className="text-2xl font-bold text-gray-900">{rapport.derniereValeur}</p>
                      <p className="text-xs text-gray-500">
                        Seuil: {rapport.seuilMin || rapport.seuilMax}
                      </p>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                      Consulter le rapport
                    </span>
                    <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Statut global */}
        <div className="mt-8 bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📊 Statut global de conformité
          </h3>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600 mb-1">3</p>
              <p className="text-sm text-gray-600">Conformes</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-600 mb-1">1</p>
              <p className="text-sm text-gray-600">À surveiller</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600 mb-1">0</p>
              <p className="text-sm text-gray-600">Critiques</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900">Bonne conformité générale</p>
              <p className="text-sm text-green-800 mt-1">
                La caisse respecte la majorité des seuils réglementaires. Continuez à surveiller 
                les indicateurs marqués "À surveiller" pour maintenir une conformité totale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}