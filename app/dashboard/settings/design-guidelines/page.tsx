'use client';
import { useState } from 'react';
import {
  Palette, Box, Type, Navigation, Puzzle, Shield, Sparkles,
  ChevronRight, Check, Eye, AlertTriangle, X, BarChart2,
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Package,
  DollarSign, Users, FileText, TrendingUp, Loader2
} from 'lucide-react';

// ─── Nav sections ──────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'colors',       label: 'Palette de couleurs',        icon: Palette },
  { id: 'components',   label: 'Composants visuels',         icon: Box },
  { id: 'typography',   label: 'Typographie',                icon: Type },
  { id: 'navigation',   label: 'Navigation',                 icon: Navigation },
  { id: 'reusable',     label: 'Composants réutilisables',   icon: Puzzle },
  { id: 'accessibility','label': 'Cohérence & Accessibilité',icon: Shield },
  { id: 'philosophy',   label: 'Philosophie CAPOSA',         icon: Sparkles },
];

// ─── Color swatches ────────────────────────────────────────────────────────────
const COLORS = [
  { name: 'Primary Dark',    hex: '#1B5E20', tw: 'from-[#1B5E20]',  label: 'Boutons, textes actifs',         bg: 'bg-[#1B5E20]' },
  { name: 'Primary',         hex: '#2E7D32', tw: 'from-[#2E7D32]',  label: 'Accents, icônes, liens',         bg: 'bg-[#2E7D32]' },
  { name: 'Primary Light',   hex: '#81C784', tw: 'from-[#81C784]',  label: 'Icônes secondaires, succès',     bg: 'bg-[#81C784]' },
  { name: 'Surface Green',   hex: '#DDEAD5', tw: 'from-[#DDEAD5]',  label: 'Backgrounds sélectionnés',       bg: 'bg-[#DDEAD5]', dark: true },
  { name: 'Page BG',         hex: '#F9F9F6', tw: 'from-[#F9F9F6]',  label: 'Fond de toutes les pages',       bg: 'bg-[#F9F9F6]', dark: true },
  { name: 'Blue',            hex: '#355C7D', tw: 'from-[#355C7D]',  label: 'Superviseur, info, liens',       bg: 'bg-[#355C7D]' },
  { name: 'Gold',            hex: '#D4AF37', tw: 'from-[#D4AF37]',  label: 'Trésorier, warnings, dates',     bg: 'bg-[#D4AF37]' },
  { name: 'White',           hex: '#FFFFFF', tw: 'from-white',       label: 'Cards, surfaces, modals',        bg: 'bg-white',    dark: true },
  { name: 'Gray 900',        hex: '#111827', tw: 'from-gray-900',    label: 'Titres principaux',              bg: 'bg-gray-900' },
  { name: 'Gray 600',        hex: '#4B5563', tw: 'from-gray-600',    label: 'Labels, descriptions',           bg: 'bg-gray-600' },
  { name: 'Gray 400',        hex: '#9CA3AF', tw: 'from-gray-400',    label: 'Sous-textes, placeholders',      bg: 'bg-gray-400' },
  { name: 'Gray 100',        hex: '#F3F4F6', tw: 'from-gray-100',    label: 'Borders, séparateurs',           bg: 'bg-gray-100', dark: true },
];

const SEMANTIC_COLORS = [
  { name: 'Succès',   bg: 'bg-[#DDEAD5]', text: 'text-[#1B5E20]', border: 'border-[#2E7D32]/20', label: 'Accès Full, confirmations' },
  { name: 'Erreur',   bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-100',       label: 'Refus, alertes critiques' },
  { name: 'Warning',  bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200',    label: 'Anomalies, attentions' },
  { name: 'Info',     bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-100',      label: 'Lecture seule, informations' },
  { name: 'Agrégé',   bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100',    label: 'Vue synthétique Directeur' },
];

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({ id, icon: Icon, title, children }: {
  id: string; icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-14">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span className="w-4 h-px bg-gray-300" />{title}
      </h3>
      {children}
    </div>
  );
}

function CodeChip({ code }: { code: string }) {
  return (
    <code className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-xs font-mono">{code}</code>
  );
}

function DemoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#F9F9F6] rounded-2xl border border-gray-100 p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function DesignGuidelines() {
  const [activeSection, setActiveSection] = useState('colors');

  const scrollTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full min-h-screen bg-[#F9F9F6] flex">

      {/* ── Sidebar nav ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen bg-white border-r border-gray-100 p-5 overflow-y-auto">
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#2E7D32] uppercase tracking-widest mb-1">CAPOSA UI</p>
          <p className="text-base font-bold text-gray-900">Design Guidelines</p>
          <p className="text-xs text-gray-400 mt-0.5">v1.0</p>
        </div>
        <nav className="flex flex-col gap-1">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left transition-all ${
                  active
                    ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 max-w-4xl mx-auto px-6 md:px-10 py-10 overflow-y-auto">

        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DDEAD5] text-[#1B5E20] rounded-full text-xs font-semibold mb-4">
            <Sparkles className="w-3 h-3" /> Design System Officiel
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Design Guidelines — CAPOSA UI</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            Bienvenue dans le guide officiel du Design System CAPOSA. Ce document décrit les règles visuelles,
            les composants, et les bonnes pratiques utilisées dans toute l'application.
          </p>
        </div>

        {/* ── 1. Palette ── */}
        <Section id="colors" icon={Palette} title="Palette de couleurs">

          <SubSection title="Couleurs principales">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {COLORS.map(c => (
                <div key={c.hex} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                  <div className={`h-14 ${c.bg}`} />
                  <div className="p-3">
                    <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                    <CodeChip code={c.hex} />
                    <p className="text-xs text-gray-400 mt-1 leading-tight">{c.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Couleurs sémantiques">
            <div className="flex flex-col gap-2">
              {SEMANTIC_COLORS.map(c => (
                <div key={c.name} className="flex items-center gap-4 bg-white rounded-xl border border-gray-100 p-3">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border ${c.bg} ${c.text} ${c.border} w-28 justify-center`}>
                    {c.name}
                  </span>
                  <p className="text-sm text-gray-600">{c.label}</p>
                  <div className="ml-auto flex gap-1">
                    <CodeChip code={c.bg.replace('bg-', '')} />
                    <CodeChip code={c.text.replace('text-', '')} />
                  </div>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Gradient primaire">
            <DemoCard title="Usage">
              <div className="h-16 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] flex items-center justify-center">
                <p className="text-white text-sm font-semibold">bg-gradient-to-r from-[#2E7D32] to-[#1B5E20]</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Utilisé sur : boutons primaires, icônes KPI, bannières actives</p>
            </DemoCard>
          </SubSection>
        </Section>

        {/* ── 2. Composants visuels ── */}
        <Section id="components" icon={Box} title="Composants visuels">

          <SubSection title="Cards">
            <DemoCard title="Card standard">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow max-w-xs">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">48 750 HTG</p>
                <p className="text-sm text-gray-600 mt-0.5">Montant en caisse</p>
                <p className="text-xs text-gray-400 mt-1">Solde actuel</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <CodeChip code="bg-white" /><CodeChip code="rounded-2xl" /><CodeChip code="shadow-sm" /><CodeChip code="border border-gray-100" /><CodeChip code="hover:shadow-md" />
              </div>
            </DemoCard>
          </SubSection>

          <SubSection title="Boutons">
            <DemoCard title="Variantes">
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg hover:shadow-xl transition-all">
                  Primaire
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                  Secondaire
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 transition-all">
                  Danger
                </button>
                <button className="px-4 py-2 rounded-xl text-sm font-medium bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20 hover:bg-[#c8e0bc] transition-all">
                  Doux
                </button>
                <button disabled className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                  Désactivé
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Tous les boutons utilisent <CodeChip code="rounded-xl" /> — jamais <CodeChip code="rounded-full" /> pour les boutons d'action.
              </div>
            </DemoCard>
          </SubSection>

          <SubSection title="Icônes">
            <DemoCard title="Containers d'icônes">
              <div className="flex flex-wrap gap-4 items-end">
                {[
                  { color: 'bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]', size: 'w-10 h-10', label: 'KPI (40px)' },
                  { color: 'bg-gradient-to-br from-[#355C7D] to-[#2A4A5E]', size: 'w-10 h-10', label: 'KPI blue' },
                  { color: 'bg-gradient-to-br from-[#D4AF37] to-[#C9B27C]', size: 'w-10 h-10', label: 'KPI gold' },
                  { color: 'bg-gradient-to-br from-[#2E7D32] to-[#1B5E20]', size: 'w-8 h-8',  label: 'Header (32px)' },
                  { color: 'bg-[#DDEAD5]',                                    size: 'w-9 h-9',  label: 'Tx row' },
                ].map((ic, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className={`${ic.size} ${ic.color} rounded-xl flex items-center justify-center`}>
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs text-gray-400">{ic.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">Container toujours <CodeChip code="rounded-xl" />. Icône <CodeChip code="lucide-react" /> uniquement.</p>
            </DemoCard>
          </SubSection>

          <SubSection title="Tableaux">
            <DemoCard title="Structure standard">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-4 px-5 py-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200">
                  {['Date', 'Employé', 'Montant', 'Statut'].map(h => (
                    <p key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</p>
                  ))}
                </div>
                {[
                  ['12 fév.', 'Jean Dupont', '12 500 HTG', 'Confirmé'],
                  ['12 fév.', 'Marie T.',    '3 200 HTG',  'En attente'],
                ].map((row, i) => (
                  <div key={i} className={`grid grid-cols-4 px-5 py-3 hover:bg-[#DDEAD5]/20 transition-colors ${i % 2 === 1 ? 'bg-gray-50/30' : ''}`}>
                    {row.map((cell, j) => (
                      <p key={j} className="text-sm text-gray-700">{cell}</p>
                    ))}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
                Header: <CodeChip code="bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6]" /> · Hover: <CodeChip code="hover:bg-[#DDEAD5]/20" />
              </div>
            </DemoCard>
          </SubSection>

          <SubSection title="Badges">
            <DemoCard title="Tous les états">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20"><Check className="w-3 h-3"/>Full</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"><Eye className="w-3 h-3"/>Vue</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100"><BarChart2 className="w-3 h-3"/>Agrégé</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"><AlertTriangle className="w-3 h-3"/>Limité</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-400 border border-red-100"><X className="w-3 h-3"/>Aucun</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20]">● OUVERT</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">● FERMÉ</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">Badges statut circulaire : <CodeChip code="rounded-full" />. Badges info : <CodeChip code="rounded-lg" />.</p>
            </DemoCard>
          </SubSection>

          <SubSection title="Filtres de période">
            <DemoCard title="Comportement actif / inactif">
              <div className="flex gap-2 flex-wrap">
                {["Aujourd'hui", '7 jours', '30 jours', 'Année'].map((f, i) => (
                  <button key={f} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    i === 1
                      ? 'bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}>
                    {f}
                  </button>
                ))}
              </div>
            </DemoCard>
          </SubSection>
        </Section>

        {/* ── 3. Typographie ── */}
        <Section id="typography" icon={Type} title="Typographie">
          <SubSection title="Hiérarchie">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-5">
              {[
                { label: 'Page Title',    cls: 'text-3xl font-bold text-gray-900',   tw: 'text-3xl font-bold text-gray-900',   ex: 'Dashboard Caissier' },
                { label: 'Section Title', cls: 'text-xl font-bold text-gray-900',    tw: 'text-xl font-bold text-gray-900',    ex: 'Historique des Remises' },
                { label: 'Card Title',    cls: 'text-lg font-semibold text-gray-900',tw: 'text-lg font-semibold text-gray-900',ex: 'Montant en caisse' },
                { label: 'Body',          cls: 'text-sm text-gray-700',              tw: 'text-sm text-gray-700',              ex: 'Jean Dupont · Caissier principal' },
                { label: 'Label',         cls: 'text-sm text-gray-600',              tw: 'text-sm text-gray-600',              ex: 'Dernière remise effectuée' },
                { label: 'Sub-text',      cls: 'text-xs text-gray-400',              tw: 'text-xs text-gray-400',              ex: '12 février 2026 · 10h32' },
                { label: 'Caption',       cls: 'text-xs font-semibold uppercase tracking-widest text-gray-500', tw: 'text-xs font-semibold uppercase tracking-widest text-gray-500', ex: 'SECTION HEADER' },
              ].map(t => (
                <div key={t.label} className="flex items-baseline gap-4 border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-28 shrink-0">
                    <CodeChip code={t.label} />
                  </div>
                  <p className={`flex-1 ${t.cls}`}>{t.ex}</p>
                  <CodeChip code={t.tw} />
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Règles de lisibilité">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              {[
                '✅ Titres : toujours text-gray-900 — jamais de couleur sur les titres principaux',
                '✅ Corps : text-gray-700 pour le contenu, text-gray-600 pour les labels',
                '✅ Sous-textes : text-gray-400 ou text-gray-500 uniquement',
                '✅ Couleur sur texte = statut seulement (ex: text-[#2E7D32] pour montants positifs)',
                '❌ Jamais de text-white sur fond clair',
                '❌ Jamais de fontSize < 10px (text-xs minimum)',
              ].map(rule => (
                <p key={rule} className="text-sm text-gray-700">{rule}</p>
              ))}
            </div>
          </SubSection>
        </Section>

        {/* ── 4. Navigation ── */}
        <Section id="navigation" icon={Navigation} title="Navigation">
          <SubSection title="Structure du menu">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex flex-col gap-1 text-sm">
                {[
                  { label: 'MAIN MENU', type: 'group' },
                  { label: 'Accueil', active: true, type: 'item' },
                  { label: 'Employés', type: 'item' },
                  { label: 'Membres', type: 'item' },
                  { label: 'FEATURES', type: 'group' },
                  { label: 'Transactions', hasChildren: true, type: 'item' },
                  { label: 'Trésorerie', hasChildren: true, open: true, type: 'item' },
                  { label: '↳ Vue d\'ensemble', indent: true, type: 'item' },
                  { label: '↳ Encaisse',        indent: true, active: true, type: 'item' },
                  { label: 'GENERAL', type: 'group' },
                  { label: 'Horaires', type: 'item' },
                ].map((item, i) => (
                  <div key={i} className={`
                    ${item.type === 'group' ? 'text-xs font-semibold text-gray-400 uppercase tracking-widest mt-3 mb-1 px-3' : ''}
                    ${item.type === 'item' && !item.indent ? 'px-3 py-2 rounded-xl' : ''}
                    ${item.type === 'item' && item.indent ? 'px-6 py-1.5 rounded-lg' : ''}
                    ${item.active ? 'bg-[#DDEAD5] text-[#1B5E20] font-semibold' : item.type === 'item' ? 'text-gray-600' : ''}
                  `}>
                    {item.label}
                    {item.hasChildren && <span className="ml-2 text-gray-400">›</span>}
                  </div>
                ))}
              </div>
            </div>
          </SubSection>

          <SubSection title="Règles de navigation">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-2">
              {[
                '✅ Item actif : bg-[#DDEAD5] + text-[#1B5E20] + font-semibold',
                '✅ Groupes : text-xs uppercase tracking-widest text-gray-400',
                '✅ Sous-menus : indentation px-6, taille légèrement réduite',
                '✅ Hover sur items inactifs : hover:bg-gray-50',
                '❌ Jamais de soulignement sur les liens de navigation',
                '❌ Jamais plus de 2 niveaux de profondeur',
              ].map(r => <p key={r} className="text-sm text-gray-700">{r}</p>)}
            </div>
          </SubSection>
        </Section>

        {/* ── 5. Composants réutilisables ── */}
        <Section id="reusable" icon={Puzzle} title="Composants réutilisables">

          {[
            {
              name: 'KPIBlock',
              desc: 'Carte de KPI avec icône, valeur principale et sous-label.',
              props: ['icon: LucideIcon', 'label: string', 'value: string', 'sub?: string', 'color: string', 'border: string'],
              demo: (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#DDEAD5] max-w-xs">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E7D32] to-[#1B5E20] flex items-center justify-center mb-3">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">48 750 HTG</p>
                  <p className="text-sm text-gray-600">Montant en caisse</p>
                  <p className="text-xs text-gray-400 mt-1">Solde actuel</p>
                </div>
              ),
            },
            {
              name: 'BadgeStatus',
              desc: 'Badge de statut sémantique avec icône et couleur selon le niveau.',
              props: ['value: PermValue', 'severity: success | info | warning | error | aggregated'],
              demo: (
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#DDEAD5] text-[#1B5E20] border border-[#2E7D32]/20"><Check className="w-3 h-3"/>Confirmé</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200"><AlertTriangle className="w-3 h-3"/>En attente</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-100"><X className="w-3 h-3"/>Refusé</span>
                </div>
              ),
            },
            {
              name: 'ActionButton',
              desc: 'Bouton d\'action rapide avec icône centrée et label sous l\'icône.',
              props: ['icon: LucideIcon', 'label: string', 'color: string', 'onClick: () => void'],
              demo: (
                <div className="flex gap-3">
                  {[
                    { icon: ArrowDownCircle, label: 'Dépôt',     color: 'from-[#2E7D32] to-[#1B5E20]' },
                    { icon: ArrowUpCircle,   label: 'Retrait',   color: 'from-red-500 to-red-700' },
                    { icon: Package,         label: 'Remise',    color: 'from-[#D4AF37] to-[#C9B27C]' },
                  ].map(a => (
                    <button key={a.label} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <a.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{a.label}</span>
                    </button>
                  ))}
                </div>
              ),
            },
            {
              name: 'SectionHeader',
              desc: 'En-tête de section avec icône et titre. Utilisé dans toutes les cards.',
              props: ['icon: LucideIcon', 'title: string', 'action?: ReactNode'],
              demo: (
                <div className="bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <h2 className="font-semibold text-gray-900">Historique des Remises</h2>
                    </div>
                    <button className="flex items-center gap-1 text-xs text-[#2E7D32] font-medium hover:underline">
                      Voir tout <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="px-5 py-4 text-xs text-gray-400">contenu de la section…</div>
                </div>
              ),
            },
            {
              name: 'TableHeader',
              desc: 'Header de tableau avec gradient vert CAPOSA.',
              props: ['columns: string[]'],
              demo: (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-3 px-5 py-3 bg-gradient-to-r from-[#DDEAD5] to-[#F9F9F6] border-b border-gray-200">
                    {['Date & Heure', 'Employé', 'Montant'].map(h => (
                      <p key={h} className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</p>
                    ))}
                  </div>
                  <div className="px-5 py-3 text-xs text-gray-400">lignes du tableau…</div>
                </div>
              ),
            },
          ].map(comp => (
            <SubSection key={comp.name} title={comp.name}>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <p className="text-sm text-gray-600 mb-3">{comp.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {comp.props.map(p => <CodeChip key={p} code={p} />)}
                  </div>
                </div>
                <div className="p-5 bg-[#F9F9F6]">
                  {comp.demo}
                </div>
              </div>
            </SubSection>
          ))}
        </Section>

        {/* ── 6. Accessibilité ── */}
        <Section id="accessibility" icon={Shield} title="Cohérence & Accessibilité">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Contraste minimal', items: ['Texte sur blanc : gray-600 minimum', 'Texte actif : gray-900', 'WCAG AA : ratio ≥ 4.5:1 sur tous les textes'] },
              { title: 'Taille minimale des clics', items: ['Boutons : min 36px de hauteur (py-2)', 'Icônes cliquables : container 32×32px minimum', 'Liens : zone de clic élargie avec padding'] },
              { title: 'Feedback visuel obligatoire', items: ['Hover : changement visible sur tous les éléments interactifs', 'Focus : ring-2 ring-[#2E7D32] sur tous les inputs', 'Loading : spinner Loader2 de lucide-react'] },
              { title: 'États requis', items: ['hover: défini sur tout bouton/lien', 'focus: ring visible sur inputs', 'disabled: opacity-50 + cursor-not-allowed', 'loading: spinner + texte désactivé'] },
            ].map(block => (
              <div key={block.title} className="bg-white rounded-2xl border border-gray-100 p-5">
                <p className="text-sm font-semibold text-gray-900 mb-3">{block.title}</p>
                <ul className="flex flex-col gap-1.5">
                  {block.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-3.5 h-3.5 text-[#2E7D32] mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <SubSection title="États visuels des inputs">
            <DemoCard title="Démonstration">
              <div className="flex flex-col gap-3 max-w-sm">
                <input type="text" placeholder="État normal" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none" />
                <input type="text" placeholder="État focus" className="w-full px-4 py-2.5 border border-[#2E7D32] rounded-xl outline-none ring-2 ring-[#2E7D32]/30" />
                <input type="text" placeholder="État erreur" className="w-full px-4 py-2.5 border border-red-400 rounded-xl outline-none ring-2 ring-red-200" />
                <input type="text" placeholder="État désactivé" disabled className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-400 cursor-not-allowed" />
              </div>
            </DemoCard>
          </SubSection>

          <SubSection title="État loading">
            <DemoCard title="Spinner standard">
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold opacity-80 cursor-not-allowed">
                  <Loader2 className="w-4 h-4 animate-spin" /> Chargement…
                </button>
                <CodeChip code="Loader2 className='animate-spin'" />
              </div>
            </DemoCard>
          </SubSection>
        </Section>

        {/* ── 7. Philosophie ── */}
        <Section id="philosophy" icon={Sparkles} title="Philosophie CAPOSA">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { emoji: '🎯', title: 'Simplicité',              desc: 'Chaque écran répond à une seule question principale. Pas de surcharge visuelle. L\'information essentielle est toujours visible sans scroll.' },
              { emoji: '📖', title: 'Lisibilité',              desc: 'Hiérarchie typographique stricte. Contraste élevé. Les données financières sont toujours lisibles en un coup d\'œil.' },
              { emoji: '🏛️', title: 'Institutionnel',          desc: 'CAPOSA est un système bancaire. Le design inspire confiance, sérieux et stabilité. Pas de couleurs vives gratuites, pas d\'animations excessives.' },
              { emoji: '💳', title: 'Fintech moderne',         desc: 'Cards épurées, gradients subtils, icônes Lucide, spacing généreux. Inspiré des meilleures apps fintech (Stripe, Wise, Mercury).' },
              { emoji: '🔒', title: 'Confiance & Transparence', desc: 'Chaque action est confirmée visuellement. Les statuts sont toujours visibles. Les données sensibles ont des indicateurs de protection clairs.' },
              { emoji: '🌱', title: 'Haïtien & Local',         desc: 'Monnaie HTG, formats de date francophones, noms haïtiens dans les exemples. CAPOSA est conçu pour le contexte bancaire haïtien.' },
            ].map(p => (
              <div key={p.title} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="text-2xl mb-3">{p.emoji}</div>
                <p className="text-base font-bold text-gray-900 mb-2">{p.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] rounded-2xl p-6 text-white">
            <p className="text-xs font-semibold text-[#DDEAD5] uppercase tracking-widest mb-2">Règle d'or</p>
            <p className="text-lg font-bold mb-2">"Un caissier doit pouvoir utiliser CAPOSA sans formation."</p>
            <p className="text-sm text-green-200 leading-relaxed">
              Si une action nécessite plus de 2 clics ou si un statut n'est pas immédiatement compréhensible,
              le design doit être revu. La clarté prime toujours sur l'esthétique.
            </p>
          </div>
        </Section>

      </main>
    </div>
  );
}