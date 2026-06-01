"use client"
import { Lock, Eye, EyeOff, Loader2, CircleAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';

const LoginForm = () => {
  const [show, setShow] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche — image de fond ── */}
     <div
      className="hidden lg:flex flex-col justify-between p-12.5 flex-[1.1] relative"
      style={{
        backgroundImage: "url('/BGlogin.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
        <div className="absolute inset-0 bg-black/25" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-white/20 border border-white/30 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">C</span>
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">CAPOSA</h1>
            <p className="text-white/70 text-xs">Caisse Populaire</p>
          </div>
        </div>

        {/* Tagline */}
       <div className="relative z-10">
          <h2 className="text-white text-2xl font-semibold leading-snug mb-2">
            Votre espace coopératif,<br />Simple et sûr
          </h2>
          <p className="text-white/80 text-sm max-w-xs leading-relaxed">
            Un lieu de confiance pour vos opérations et votre communauté.
          </p>
       </div>

        {/* Badge sécurité */}
        <div className="relative z-10 flex items-center gap-2 text-white/60 text-xs">
          <ShieldCheck className="w-4 h-4" />
          Connexion sécurisée
        </div>
      </div>

     {/* ── Panneau droit — formulaire ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-12 min-w-[320px]"
        style={{ backgroundColor: '#F9F9F6' }}
      >
        <div className="w-full max-w-sm">

          {/* En-tête */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#1B5E20' }}>Bon retour</h2>
            <p className="text-sm" style={{ color: '#6b7c6e' }}>Connectez-vous à votre compte</p>
          </div>

          <form action={formAction} className="space-y-5">

            {/* Identifiant */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: '#4a6352' }}>
                Identifiant
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                minLength={3}
                autoComplete="username"
                placeholder="Nom d'utilisateur ou courriel"
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#eee8d8',
                  borderColor: focusedField === 'username' ? '#1a3d2b' : '#c8bfa8',
                  color: '#1a3d2b',
                  boxShadow: focusedField === 'username' ? '0 0 0 3px rgba(26,61,43,0.12)' : 'none',
                }}
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: '#4a6352' }}>
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border text-sm outline-none transition-all w-full"
                  style={{
                    backgroundColor: '#eee8d8',
                    borderColor: focusedField === 'password' ? '#1a3d2b' : '#c8bfa8',
                    color: '#1a3d2b',
                    boxShadow: focusedField === 'password' ? '0 0 0 3px rgba(26,61,43,0.12)' : 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#6b7c6e' }}
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mot de passe oublié */}
            <div className="flex justify-center">
              <a href="#" className="text-xs font-medium transition-colors"
                style={{ color: '#b8972a' }}>
                Mot de passe oublié ? Contactez l’administrateur.
              </a>
            </div>

            {/* Erreur */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl border"
                style={{ backgroundColor: '#fdf0f0', borderColor: '#f5c6c6' }}>
                <CircleAlert className="w-4 h-4 flex-shrink-0" style={{ color: '#c0392b' }} />
                <p className="text-xs font-medium" style={{ color: '#c0392b' }}>{errorMessage}</p>
              </div>
            )}

            <input type="hidden" name="redirectTo" value={callbackUrl} />

            {/* Bouton submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: '#1B5E20', color: '#fff' }}
            >
              <span>{isPending ? 'Connexion en cours...' : 'Se connecter'}</span>
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            </button>
          </form>

          {/* Aide */}
          <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid #c8bfa8' }}>
            <p className="text-xs" style={{ color: '#6b7c6e' }}>
              Besoin d'aide ?{' '}
              <a href="#" className="font-semibold" style={{ color: '#1B5E20' }}>
                Contacter le support
              </a>
            </p>
            <p className="text-xs mt-3" style={{ color: '#9aab9e' }}>
              Données protégées par chiffrement de niveau bancaire
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginForm;