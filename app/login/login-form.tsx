"use client"
import { Mail, Lock, Eye, EyeOff, Loader2, CircleAlert, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const LoginForm = () => {
  const [show, setShow] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const handleClick = () => setShow(!show);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col">
      {/* Header Bar */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CAPOSA</h1>
              <p className="text-xs text-gray-500">Caisse Populaire</p>
            </div>
          </Link>
          <div className="flex items-center space-x-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Connexion Sécurisée</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bon retour
            </h2>
            <p className="text-gray-600">
              Connectez-vous à votre espace employé
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <form action={formAction} className="p-8">
              <div className="space-y-6">
                {/* Username/Email Field */}
                <div>
                  <label 
                    htmlFor="username" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nom d'utilisateur ou courriel
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'username' ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Entrez votre identifiant"
                      id="username"
                      name="username"
                      required
                      minLength={3}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 text-gray-900 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Mot de passe
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                      focusedField === 'password' ? 'text-emerald-600' : 'text-gray-400'
                    }`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={show ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      required
                      name="password"
                      id="password"
                      minLength={6}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 text-gray-900 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleClick}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
               
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input 
                      id="remember" 
                      type="checkbox" 
                      name="remember"
                      className="w-4 h-4 border-2 border-gray-300 rounded text-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                      Se souvenir de moi
                    </span>
                  </label>
                  <a 
                    href="#" 
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <CircleAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                  </div>
                )}

                {/* Hidden callback URL field */}
                <input type="hidden" name="redirectTo" value={callbackUrl} />

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  <span>{isPending ? 'Connexion en cours...' : 'Se connecter'}</span>
                  {isPending && <Loader2 className="w-5 h-5 animate-spin" />}
                </button>
              </div>
            </form>

            {/* Footer Section */}
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                Besoin d'aide ?{' '}
                <a 
                  href="#" 
                  className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  Contacter le support
                </a>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Vos données sont protégées par un chiffrement de niveau bancaire
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-6 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <p className="text-sm text-gray-500">
            © 2025 CAPOSA. Tous droits réservés.
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Confidentialité</a>
            <span>•</span>
            <a href="#" className="hover:text-emerald-600 transition-colors">Conditions</a>
            <span>•</span>
            <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginForm;


 {/* In your HTML, you already have: */}

  {/* <input id="remember" type="checkbox" name="remember" /> */}

  {/* 1) Forgot password link

  Your anchor is a stub. Point it to the page that sends a reset email (or to your DRF endpoint if you’ve built one), e.g. /forgot-password.

  2) Small UI polish (optional)

  Add autoComplete="username" on the username field and autoComplete="current-password" on the password field for better browser behavior.

  Add aria-invalid={!!errorMessage} to inputs when there’s an error. */}