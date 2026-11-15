'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Building2,
  Mail,
  Camera,
  Trash2,
} from 'lucide-react';
import {
  UserProfile,
  fetchMyProfile,
  updateMyProfile,
  UpdateProfilePayload,
} from '@/app/lib/api/profile';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  onProfileUpdated,
}: UserProfileModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable fields: Sexe, Photo, Mot de passe
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  // Password fields
  const [changePassword, setChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPhotoFile(null);
      setRemovePhoto(false);

      try {
        const data = await fetchMyProfile();
        setProfile(data);
        if (data.gender === 'M' || data.gender === 'F') {
          setGender(data.gender);
        } else {
          setGender('M');
        }
        setPhotoPreview(data.photo_profil || null);
      } catch (err: any) {
        console.error('Erreur chargement profil:', err);
        setError(err.message || 'Impossible de charger votre profil.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Format de photo invalide. Utilisez JPG ou PNG.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 2 Mo.');
      return;
    }

    setError(null);
    setPhotoFile(file);
    setRemovePhoto(false);
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setPhotoPreview(ev.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validation mot de passe si activé
    if (changePassword) {
      if (!newPassword) {
        setError('Veuillez renseigner un nouveau mot de passe.');
        return;
      }
      if (newPassword.length < 6) {
        setError('Le mot de passe doit comporter au moins 6 caractères.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Le mot de passe de confirmation ne correspond pas.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload: UpdateProfilePayload = {
        gender,
      };

      if (photoFile) {
        payload.photo_profil = photoFile;
      } else if (removePhoto) {
        payload.remove_photo = true;
      }

      if (changePassword && newPassword) {
        if (currentPassword) payload.current_password = currentPassword;
        payload.password = newPassword;
        payload.confirm_password = confirmPassword;
      }

      const updated = await updateMyProfile(payload);
      setProfile(updated);
      setSuccessMsg('Votre profil a été mis à jour avec succès.');
      onProfileUpdated?.(updated);

      // Réinitialiser les champs de mot de passe
      setChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPhotoFile(null);
      setRemovePhoto(false);

      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err: any) {
      console.error('Erreur mise à jour profil:', err);
      const serverErr =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err.message ||
        'Impossible de mettre à jour le profil.';
      setError(serverErr);
    } finally {
      setSubmitting(false);
    }
  };

  const fullName = profile
    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username
    : 'Utilisateur';

  const initials = fullName
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Arrière-plan flou non fermable au clic extérieur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in" />

      {/* Boîte de dialogue */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 shrink-0 bg-gradient-to-r from-white via-white to-[#DDEAD5]/15 dark:from-zinc-900 dark:to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DDEAD5] dark:bg-[#1B5E20]/40 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#2E7D32] dark:text-[#81C784]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Mon Profil
              </h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                Gestion de votre photo, genre et mot de passe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps avec scroll */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#2E7D32]" />
              <p className="text-xs font-medium">Chargement de votre profil...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="profile-form" className="space-y-6">
              {/* Message de succès */}
              {successMsg && (
                <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 font-semibold animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Message d'erreur */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Photo de Profil (Modifiable) ── */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#F9F9F6] dark:bg-zinc-850 border border-gray-100 dark:border-zinc-800 gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3 border-white dark:border-zinc-800 shadow-md bg-[#DDEAD5] dark:bg-[#1B5E20]/40 flex items-center justify-center">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-[#1B5E20] dark:text-[#81C784]">
                        {initials}
                      </span>
                    )}
                  </div>

                  {/* Bouton Changer Photo */}
                  <label
                    htmlFor="profile-photo-upload"
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#2E7D32] text-white flex items-center justify-center shadow-md cursor-pointer hover:bg-[#1B5E20] transition-colors"
                    title="Changer la photo"
                  >
                    <Camera className="w-4 h-4" />
                    <input
                      id="profile-photo-upload"
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handlePhotoChange}
                      className="sr-only"
                    />
                  </label>
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                    Photo de profil
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                    JPG ou PNG, 2 Mo maximum
                  </p>
                </div>

                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 font-medium cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer la photo</span>
                  </button>
                )}
              </div>

              {/* ── Sexe / Genre (Modifiable) ── */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-zinc-400 mb-2">
                  Sexe / Genre <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender('M')}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      gender === 'M'
                        ? 'bg-[#DDEAD5] border-[#2E7D32]/50 text-[#1B5E20] dark:bg-[#1B5E20]/50 dark:text-[#81C784] shadow-xs ring-1 ring-[#2E7D32]/30'
                        : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 transition-colors ${gender === 'M' ? 'text-[#1B5E20] dark:text-[#81C784]' : 'text-blue-600'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="10" cy="14" r="5" />
                      <path d="M13.5 10.5L20 4" />
                      <path d="M15 4h5v5" />
                    </svg>
                    <span>Masculin (M)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender('F')}
                    className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                      gender === 'F'
                        ? 'bg-[#DDEAD5] border-[#2E7D32]/50 text-[#1B5E20] dark:bg-[#1B5E20]/50 dark:text-[#81C784] shadow-xs ring-1 ring-[#2E7D32]/30'
                        : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 hover:border-gray-300'
                    }`}
                  >
                    <svg className={`w-4 h-4 shrink-0 transition-colors ${gender === 'F' ? 'text-[#1B5E20] dark:text-[#81C784]' : 'text-rose-500'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="9" r="5" />
                      <path d="M12 14v7" />
                      <path d="M9 18h6" />
                    </svg>
                    <span>Féminin (F)</span>
                  </button>
                </div>
              </div>

              {/* ── Mot de passe (Modifiable) ── */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-850 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                        Sécurité & Mot de passe
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-zinc-500">
                        {changePassword
                          ? 'Saisissez vos nouveaux identifiants'
                          : 'Cliquez pour modifier votre mot de passe'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setChangePassword((prev) => !prev)}
                    className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] dark:text-[#81C784] cursor-pointer"
                  >
                    {changePassword ? 'Annuler' : 'Modifier'}
                  </button>
                </div>

                {changePassword && (
                  <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800 animate-in fade-in">
                    {/* Mot de passe actuel */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                        Mot de passe actuel (optionnel)
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-[#F9F9F6] dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Nouveau mot de passe */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                        Nouveau mot de passe <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 caractères"
                          className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-[#F9F9F6] dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmer nouveau mot de passe */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">
                        Confirmer le nouveau mot de passe <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Répétez le nouveau mot de passe"
                          className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-gray-200 dark:border-zinc-700 bg-[#F9F9F6] dark:bg-zinc-900 text-sm outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                          {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Champs Verrouillés (Lecture Seule) ── */}
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Informations système (non modifiables)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Nom complet */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                      Nom complet
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-zinc-200 mt-0.5 truncate">
                      {fullName}
                    </p>
                  </div>

                  {/* Identifiant */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                      Identifiant utilisateur
                    </p>
                    <p className="font-mono font-semibold text-gray-800 dark:text-zinc-200 mt-0.5 truncate">
                      {profile?.username || '—'}
                    </p>
                  </div>

                  {/* Email */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                      Courriel professionnel
                    </p>
                    <p className="font-medium text-gray-800 dark:text-zinc-200 mt-0.5 truncate">
                      {profile?.email || 'Non renseigné'}
                    </p>
                  </div>

                  {/* Rôles / Poste */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500">
                      Rôle & Affectation
                    </p>
                    <p className="font-semibold text-[#2E7D32] dark:text-[#81C784] mt-0.5 truncate capitalize">
                      {profile?.role || (profile?.roles || []).join(', ') || 'Employé'}
                      {profile?.branch_name ? ` · ${profile.branch_name}` : ''}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#DDEAD5]/30 dark:bg-[#1B5E20]/15 border border-[#2E7D32]/20 text-[11px] text-[#1B5E20] dark:text-[#81C784]">
                  Pour modifier votre nom, votre courriel ou votre affectation d&apos;agence, veuillez contacter
                  l&apos;administrateur CAPOSA.
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Pied de page */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="submit"
            form="profile-form"
            disabled={submitting || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#2E7D32] to-[#1B5E20] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Enregistrer mon profil</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
