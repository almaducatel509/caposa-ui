"use client";
import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, Users, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import AxiosInstance from './lib/axiosInstance';
import { button } from '@nextui-org/react';

function verifyData() {
  AxiosInstance.get('/branches')
    .then(res => console.log("✅ Branches:", res.data))
    .catch(err => console.error("❌ Branches error:", err));

  AxiosInstance.get('/posts')
    .then(res => console.log("✅ Posts:", res.data))
    .catch(err => console.error("❌ Posts error:", err));

  AxiosInstance.get('/employees')
    .then(res => console.log("✅ Employés:", res.data))
    .catch(err => console.error("❌ Employés error:", err));
}

export default function Page() {
  const [mounted, setMounted] = useState(false);



  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex flex-col">
      {/* Header Bar */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CAPOSA</h1>
              <p className="text-xs text-gray-500">Caisse Populaire</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              href="/login"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  Portail Employé{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                    CAPOSA
                  </span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Système de gestion interne. Accédez aux outils d'administration et gérez les données de la caisse populaire en toute sécurité.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Accès Sécurisé</h3>
                    <p className="text-sm text-gray-600">Authentification employé avec permissions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Gestion Complète</h3>
                    <p className="text-sm text-gray-600">CRUD pour comptes, membres et transactions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Interface Intuitive</h3>
                    <p className="text-sm text-gray-600">Outils d'administration simplifiés</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <span>Connexion Employé</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button 
                  onClick={verifyData}
                  className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3.5 px-6 rounded-xl border-2 border-gray-200 transition-all duration-200"
                >
                  <span>Guide d'utilisation</span>
                </button>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12">
              <div className="aspect-square bg-gradient-to-br from-emerald-100 to-green-100 rounded-2xl flex items-center justify-center">
                <PiggyBank className="w-32 h-32 text-emerald-600" />
              </div>
              
            </div>
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
}