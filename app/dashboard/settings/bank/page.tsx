'use client';

import React from "react";
import { BANK_RULES } from "@/app/lib/bankRules";

export default function BankSettingsPage() {
  const accountTypes: Array<{
    key: 'epargne' | 'cheques' | 'terme';
    color: string;
    borderColor: string;
  }> = [
    { key: 'epargne', color: 'from-green-50 to-emerald-50', borderColor: 'border-green-300' },
    { key: 'cheques', color: 'from-blue-50 to-indigo-50', borderColor: 'border-blue-300' },
    { key: 'terme', color: 'from-purple-50 to-pink-50', borderColor: 'border-purple-300' },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            📋 Règles Bancaires
          </h1>
          <p className="text-gray-600">
            Consultation des paramètres métier appliqués automatiquement lors de la création de comptes
          </p>

          {/* Info Banner */}
          <div className="mt-4 p-4 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
            <p className="font-bold text-blue-800 text-lg">
              📖 MODE CONSULTATION - Lecture seule
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Ces règles sont définies dans <code className="bg-blue-200 px-2 py-0.5 rounded font-mono text-xs">lib/bankRules.ts </code> plus tard <code className="bg-blue-200 px-2 py-0.5 rounded font-mono text-xs">bank_policies (backend / DB) </code>et appliquées automatiquement.
            </p>
            <code className="text-xs">
              
                savings_account: 
                  min_deposit: 25,
                  interest_rate: 0.025,
                  monthly_fee: 0

                checking_account: 
                  min_deposit: 100,
                  interest_rate: 0,
                  monthly_fee: 15

                term_account: 
                  min_deposit: 500,
                  interest_rate: 0.045,
                  monthly_fee: 0
               
            </code>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {accountTypes.map(({ key, color, borderColor }) => {
            const rule = BANK_RULES[key];
            
            return (
              <div 
                key={key} 
                className={`bg-linear-to-br ${color} rounded-2xl border-2 ${borderColor} shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]`}
              >
                {/* Header */}
                <div className="p-6 border-b-2 border-gray-200 bg-white/50 rounded-t-2xl">
                  <div className="flex gap-3 items-center">
                    <span className="text-5xl">{rule.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{rule.title}</h3>
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                        {key}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  {/* Description */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                      📝 Description
                    </label>
                    <p className="text-sm text-gray-700 px-4 py-3 bg-white/70 rounded-lg font-medium shadow-sm">
                      {rule.description}
                    </p>
                  </div>

                  {/* Dépôt minimum */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                      💰 Dépôt Minimum
                    </label>
                    <div className="px-4 py-3 bg-linear-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-300 shadow-sm">
                      <span className="text-xl font-bold text-green-700">{rule.minDeposit} HTG</span>
                    </div>
                  </div>

                  {/* Dépôt maximum (si existe) */}
                  {rule.maxDeposit && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                        💰 Dépôt Maximum (CDIC)
                      </label>
                      <div className="px-4 py-3 bg-linear-to-r from-red-100 to-rose-100 rounded-lg border-2 border-red-300 shadow-sm">
                        <span className="text-xl font-bold text-red-700">{rule.maxDeposit} HTG</span>
                      </div>
                    </div>
                  )}

                  {/* Taux d'intérêt */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                      📈 Taux d'Intérêt
                    </label>
                    <div className="px-4 py-3 bg-linear-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-300 shadow-sm">
                      <span className="text-xl font-bold text-blue-700">
                        {rule.interestRate}%
                      </span>
                      {rule.interestCalculation !== 'none' && (
                        <p className="text-xs text-blue-600 mt-1">
                          Calcul: {
                            rule.interestCalculation === 'simple' ? 'Intérêts simples' :
                            rule.interestCalculation === 'compound-monthly' ? 'Composés mensuellement' :
                            'Composés quotidiennement'
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Frais mensuels */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                      💳 Frais Mensuels
                    </label>
                    <div className="px-4 py-3 bg-linear-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300 shadow-sm">
                      <span className="text-xl font-bold text-purple-700">
                        {rule.monthlyFees > 0 ? `${rule.monthlyFees} HTG` : 'Gratuit ✨'}
                      </span>
                    </div>
                  </div>

                  {/* Limite retrait (cheques) */}
                  {key === 'cheques' && rule.withdrawalLimit && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                        🏧 Limite Retrait/Jour
                      </label>
                      <div className="px-4 py-3 bg-linear-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300 shadow-sm">
                        <span className="text-xl font-bold text-orange-700">{rule.withdrawalLimit} HTG</span>
                      </div>
                    </div>
                  )}

                  {/* Retraits gratuits (epargne) */}
                  {key === 'epargne' && rule.freeWithdrawalsPerMonth && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                        🎁 Retraits Gratuits/Mois
                      </label>
                      <div className="px-4 py-3 bg-linear-to-r from-teal-100 to-cyan-100 rounded-lg border-2 border-teal-300 shadow-sm">
                        <span className="text-xl font-bold text-teal-700">{rule.freeWithdrawalsPerMonth}</span>
                        {rule.feePerExtraWithdrawal && (
                          <p className="text-xs text-teal-600 mt-1">
                            Frais additionnel: {rule.feePerExtraWithdrawal} HTG par retrait
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Options terme */}
                  {key === 'terme' && rule.termOptions && (
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wide">
                        📅 Durées Disponibles
                      </label>
                      <div className="px-4 py-3 bg-white/70 rounded-lg border-2 border-gray-300 shadow-sm">
                        <div className="flex gap-2 flex-wrap">
                          {rule.termOptions.map((term) => (
                            <span key={term} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-bold text-sm">
                              {term} mois
                            </span>
                          ))}
                        </div>
                        {rule.earlyWithdrawalPenalty && (
                          <p className="text-xs text-gray-600 mt-2">
                            ⚠️ Pénalité retrait anticipé: {rule.earlyWithdrawalPenalty}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Caractéristiques */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-3 uppercase tracking-wide">
                      ✨ Caractéristiques
                    </label>
                    <div className="space-y-2">
                      {rule.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-white/60 p-3 rounded-lg shadow-sm border border-gray-200">
                          <span className="text-blue-500 font-bold mt-0.5 text-lg">✓</span>
                          <p className="text-xs text-gray-700 font-medium flex-1 leading-relaxed">{feature}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Note éducative */}
                  {rule.educationalNote && (
                    <div className="p-4 bg-linear-to-r from-amber-50 to-yellow-50 rounded-lg border-2 border-amber-300">
                      <p className="text-sm text-amber-900 font-medium leading-relaxed">
                        {rule.educationalNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div className="p-6 bg-linear-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-2xl shadow-xl">
          <h3 className="font-bold text-yellow-900 mb-3 text-xl flex items-center gap-2">
            <span className="text-3xl">ℹ️</span> Informations Importantes
          </h3>
          <div className="space-y-3 text-sm text-yellow-800">
            <p className="flex items-start gap-2">
              <span className="font-bold mt-0.5">🇭🇹</span>
              <span><strong>Contexte local :</strong> Ces règles sont adaptées pour une caisse populaire rurale en Haïti, avec des montants accessibles et un accompagnement éducatif</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold mt-0.5">📌</span>
              <span><strong>Source des données :</strong> Ces règles sont définies dans le fichier <code className="bg-yellow-200 px-2 py-0.5 rounded font-mono text-xs">lib/bankRules.ts</code></span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold mt-0.5">✅</span>
              <span><strong>Application automatique :</strong> Les paramètres sont appliqués automatiquement lors de la création d'un compte selon le type choisi</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold mt-0.5">🔒</span>
              <span><strong>Protection :</strong> Les caissiers ne peuvent pas modifier manuellement ces valeurs, garantissant la conformité aux politiques de la caisse</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold mt-0.5">💡</span>
              <span><strong>Éducation financière :</strong> Chaque type de compte inclut des conseils pour aider les membres à mieux gérer leurs finances</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="font-bold mt-0.5">🔄</span>
              <span><strong>Migration future :</strong> Quand l'API sera prête, ces valeurs seront gérées dynamiquement via <code className="bg-yellow-200 px-2 py-0.5 rounded font-mono text-xs">GET/PUT /api/bank-rules</code></span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}