'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  LogIn, AlertCircle, Loader2, CheckCircle2,
  Eye, EyeOff, Banknote, User, Hash,
  Building2,
} from 'lucide-react';

import { OpenSessionPayload } from '@/types/caisse';
import { BranchData } from '../../branches/validations';
import { Holiday } from '../../holidays/validations';
import { OpeningHour } from '@/types/branche';
import { Caisse } from '@/types/caisse';
import { getEffectiveStatus } from '@/app/utils/branchStatus';

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

// Forme d'un poste, telle que renvoyée par GET /posts/ (cf. postSchema).
interface PostData {
  id:   string;
  name: string; // ex. 'Caissier', 'Superviseur', 'Trésorier', 'Administrateur', 'Manager'
}

// Employé tel que RÉELLEMENT renvoyé par GET /employees/ (confirmé via
// console.log) :
// - `username` est nichée sous `user.username`, jamais à plat
// - `posts` est un tableau d'IDs de poste (string[]), pas d'objets —
//   il faut croiser avec la liste des postes (`posts` prop) pour savoir
//   à quel(s) rôle(s) un employé correspond
// - pas de champ `is_active` : le endpoint ne renvoie que les employés
//   actifs (l'archivage est géré par un filtre côté backend, pas ici)
interface EmployeeOption {
  id:         string;
  user:       { username: string; email?: string };
  first_name: string;
  last_name:  string;
  posts:      string[]; // IDs de poste
}

interface Props {
  onClose:           () => void;
  onConfirm:         (payload: OpenSessionPayload) => Promise<void>;
  branches:          BranchData[];
  openingHours:      OpeningHour[];
  holidays:          Holiday[];
  caisses:           Caisse[];
  employees:         EmployeeOption[];
  posts:             PostData[]; // ← nécessaire pour retrouver l'ID des postes "Superviseur"/"Trésorier"
  onRequireOverride: (reason: string, details: string) => void;
}

// ─────────────────────────────────────────────────────────────────
// Field helper
// ─────────────────────────────────────────────────────────────────

function Field({ label, hint, error, children }: {
  label:    string;
  hint?:    string;
  error?:   string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-1">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full h-10 px-4 rounded-xl border-2 text-sm bg-[#F9F9F6] outline-none transition-colors ${
    err
      ? 'border-red-400 ring-2 ring-red-100'
      : 'border-gray-200 focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20'
  }`;

const getUsername = (e: EmployeeOption) => e.user?.username ?? '';

// `employee.posts` ne contient que des IDs — pour filtrer par nom de poste
// il faut d'abord retrouver l'ID correspondant dans la liste des postes.
const findPostId = (posts: PostData[], name: string) =>
  posts.find(p => p.name.toLowerCase() === name.toLowerCase())?.id;

// ─────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────

export default function OpenSessionModal({
  onClose,
  onConfirm,
  branches,
  openingHours,
  holidays,
  employees = [],
  posts = [],
  caisses,
  onRequireOverride,
}: Props) {

  const { data: session } = useSession();
  const caissierUsername = session?.user?.username ?? '';

  // ID des postes qu'on veut proposer dans chaque select — retrouvé une
  // seule fois par nom, plutôt que refaire une recherche pour chaque employé.
  const superviseurPostId = useMemo(() => findPostId(posts, 'Superviseur'), [posts]);
  const tresorierPostId   = useMemo(() => findPostId(posts, 'Trésorier'),   [posts]);
// Un caissier ne peut pas être son propre superviseur ni son propre responsable cash
  const estCaissierConnecte = (e: EmployeeOption) =>
  e.user?.username === caissierUsername;
  // const superviseurs = useMemo(
  //   () => superviseurPostId ? employees.filter(e => e.posts?.includes(superviseurPostId)) : [],
  //   [employees, superviseurPostId]
  // );

  // const responsablesCash = useMemo(
  //   () => tresorierPostId ? employees.filter(e => e.posts?.includes(tresorierPostId)) : [],
  //   [employees, tresorierPostId]
  // );
  const superviseurs = useMemo(
  () => superviseurPostId
    ? employees.filter(e => e.posts?.includes(superviseurPostId) && !estCaissierConnecte(e))
    : [],
  [employees, superviseurPostId, caissierUsername]
);

const responsablesCash = useMemo(
  () => tresorierPostId
    ? employees.filter(e => e.posts?.includes(tresorierPostId) && !estCaissierConnecte(e))
    : [],
  [employees, tresorierPostId, caissierUsername]
);

  const [form, setForm] = useState({
    numero_caisse:      '',
    branch:             '',
    devise:             'HTG',
    superviseur:        '',
    responsable_cash:   '', // ← renommé depuis id_responsable_cash
    montant_ouverture:  '',
  });

  const [showPin, setShowPin] = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const set = (k: keyof typeof form, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  // Caisses filtrées selon la succursale sélectionnée (pattern département → ville)
  const availableCaisses = useMemo(() => {
    const actives = caisses.filter(c => c.actif);
    if (!form.branch) return actives; // aucune succursale choisie → tout afficher
    return actives.filter(c =>
      String(c.branch) === form.branch || c.branch_name === branches.find(b => String(b.id) === form.branch)?.branch_name
    );
  }, [caisses, form.branch, branches]);

  // Changement de succursale : reset la caisse si elle n'appartient plus à la nouvelle succursale
  const handleBranchChange = (branchId: string) => {
    set('branch', branchId);
    const stillValid = caisses.some(c =>
      c.numero_caisse === form.numero_caisse && String(c.branch) === branchId
    );
    if (!stillValid) set('numero_caisse', '');
  };

  // ── Validation ────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!caissierUsername)
      e.username = "Session invalide — reconnectez-vous";

    if (!form.numero_caisse.trim())
      e.numero_caisse = 'Le numéro de caisse est requis';

    if (!form.superviseur.trim())
      e.superviseur = 'Le superviseur est requis';

    if (!form.responsable_cash.trim())
      e.responsable_cash = "Le responsable cash est requis";

    if (!form.branch.trim()) {
      e.branch = "La succursale est requise";
    } else {
      const selected = branches.find(b => String(b.id) === form.branch);
      if (!selected || getEffectiveStatus(selected) !== 'active') {
        e.branch = "Cette succursale est inactive — ouverture interdite";
      }
    }

    const m = parseFloat(form.montant_ouverture);
    if (isNaN(m) || m <= 0)
      e.montant_ouverture = 'Montant invalide — doit être supérieur à 0';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Soumission ────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      username:            caissierUsername,
      caissier_nom:        caissierUsername,
      numero_caisse:       form.numero_caisse.trim(),
      branch:              form.branch.trim(),
      devise:              'HTG',
      superviseur:         form.superviseur.trim(),
      id_responsable_cash: form.responsable_cash.trim(),
      montant_ouverture:   parseFloat(form.montant_ouverture),
    };

    await doOpenSession(payload);
  };

  const doOpenSession = async (payload: OpenSessionPayload) => {
    setLoading(true);
    try {
      await onConfirm(payload);
      setDone(true);
    } catch (err: any) {
      // `SessionManager.open()` lance parfois un Error "nu" (pas un objet
      // Axios) — err.response n'existe alors jamais. On lit donc d'abord
      // err.message (le cas courant), puis on retombe sur err.response.data
      // pour les erreurs Axios non re-wrappées, puis un message générique.
      const message =
        err?.message ??
        err?.response?.data?.message ??
        err?.response?.data?.detail ??
        "Erreur lors de l'ouverture. Réessayez.";

      console.error('❌ Erreur ouverture session:', message);
      setErrors({ montant_ouverture: message });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#DDEAD5] flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-[#2E7D32]" />
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900">Session ouverte</p>
          <p className="text-sm text-gray-500 mt-1">
            Caisse <span className="font-semibold text-[#2E7D32]">{form.numero_caisse}</span> — session démarrée avec succès.
          </p>
        </div>
      </div>
    );
  }

  // ── Formulaire ────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      <div className="flex items-start gap-3 px-4 py-3 bg-[#DDEAD5]/40 border border-[#2E7D32]/20 rounded-xl text-sm text-[#1B5E20]">
        <LogIn size={15} className="shrink-0 mt-0.5" />
        <span>
          Renseignez les informations de la session. Le montant d'ouverture correspond au fond de caisse remis par le responsable cash.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Caissier — lecture seule, dérivé de la session NextAuth */}
        <Field label="Caissier" error={errors.username}
          hint="Identifiant de la session en cours">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={caissierUsername || '— non connecté —'}
              disabled
              readOnly
              className={inputCls(errors.username) + ' pl-8 bg-gray-100 text-gray-500 cursor-not-allowed'}
            />
          </div>
        </Field>

        {/* Succursale — en premier, filtre le numéro de caisse ci-dessous */}
        <Field label="Succursale *" error={errors.branch}>
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.branch}
              onChange={e => handleBranchChange(e.target.value)}
              className={inputCls(errors.branch) + ' pl-8 pr-4 appearance-none cursor-pointer'}
            >
              <option value="">-- Sélectionnez une succursale --</option>
              {branches
                .filter(b => getEffectiveStatus(b) === 'active')
                .map(b => (
                  <option key={b.id} value={b.id}>
                    {b.branch_name} ({b.branch_code})
                  </option>
                ))
              }
            </select>
          </div>
        </Field>

        {/* Numéro de caisse — dépend de la succursale */}
        <Field label="Numéro de caisse *" error={errors.numero_caisse}
          hint={!form.branch ? "Sélectionnez d'abord une succursale" : undefined}>
          <div className="relative">
            <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.numero_caisse}
              onChange={e => set('numero_caisse', e.target.value)}
              disabled={!form.branch}
              className={inputCls(errors.numero_caisse) + ' pl-8 pr-4 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              <option value="">
                {form.branch ? '-- Sélectionnez une caisse --' : '-- Choisissez une succursale d\'abord --'}
              </option>
              {availableCaisses.map(c => (
                <option key={c.id} value={c.numero_caisse}>
                  {c.numero_caisse} — {c.nom_caisse}
                </option>
              ))}
            </select>
          </div>
        </Field>

        {/* Superviseur — employés ayant le poste "Superviseur" */}
        <Field label="Superviseur *" error={errors.superviseur}
          hint="Employé qui autorise l'ouverture">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.superviseur}
              onChange={e => set('superviseur', e.target.value)}
              className={inputCls(errors.superviseur) + ' pl-8 pr-4 appearance-none cursor-pointer'}
            >
              <option value="">
                {superviseurs.length === 0 ? '-- Aucun superviseur disponible --' : '-- Sélectionnez un superviseur --'}
              </option>
              {superviseurs.map(s => (
                <option key={s.id} value={getUsername(s)}>
                  {s.first_name} {s.last_name} ({getUsername(s)})
                </option>
              ))}
            </select>
          </div>
        </Field>

        {/* Responsable cash — employés ayant le poste "Trésorier" */}
        <Field label="Responsable cash *" error={errors.responsable_cash}
          hint="Trésorier qui remet le fond de caisse">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={form.responsable_cash}
              onChange={e => set('responsable_cash', e.target.value)}
              className={inputCls(errors.responsable_cash) + ' pl-8 pr-4 appearance-none cursor-pointer'}
            >
              <option value="">
                {responsablesCash.length === 0 ? '-- Aucun trésorier disponible --' : '-- Sélectionnez un responsable cash --'}
              </option>
              {responsablesCash.map(r => (
                <option key={r.id} value={getUsername(r)}>
                  {r.first_name} {r.last_name} ({getUsername(r)})
                </option>
              ))}
            </select>
          </div>
        </Field>

        {/* Montant d'ouverture — pleine largeur */}
        <div className="sm:col-span-2">
          <Field label="Montant d'ouverture *" error={errors.montant_ouverture}
            hint="Fond de caisse remis physiquement par le responsable cash">
            <div className="relative">
              <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="number"
                min={0}
                value={form.montant_ouverture}
                onChange={e => set('montant_ouverture', e.target.value)}
                placeholder="0.00"
                className={inputCls(errors.montant_ouverture) + ' pl-8'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                {form.devise}
              </span>
            </div>
          </Field>
        </div>

      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={onClose}
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {loading
            ? <div><Loader2 size={14} className="animate-spin" />Ouverture…</div>
            : <div><LogIn size={14} />Démarrer la session</div>
          }
        </button>
      </div>

    </div>
  );
}