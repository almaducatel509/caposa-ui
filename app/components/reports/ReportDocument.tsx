// components/rapports/ReportDocument.tsx
'use client';

import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';

interface ReportDocumentProps {
  periode: string;
  status?: 'Conforme' | 'À surveiller' | 'Critique' | 'Non conforme' | 'Stable' | 'À risque';
  children: React.ReactNode;
  onExportPDF?: () => void;
  onExportExcel?: () => void;
}

export default function ReportDocument({
  periode,
  status,
  children,
  onExportPDF,
  onExportExcel
}: ReportDocumentProps) {
  // Couleurs selon statut
  const statusConfig = {
    'Conforme': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: 'bg-green-500' },
    'À surveiller': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-500' },
    'Critique': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
    'Non conforme': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-500' },
    'Stable': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-500' },
    'À risque': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500' },
  };

  const colors = status ? statusConfig[status] : { bg: 'bg-white', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-500' };

  return (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
      {/* Header - Style document officiel */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-8 py-6 border-b-4 border-indigo-500">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
           
            <div>
              <p className="text-slate-300 text-sm">
                Période : <span className="font-semibold">{periode}</span>
              </p>
            </div>
          </div>
          
          {/* Actions export */}
          <div className="flex items-center gap-2">
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
            )}
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
              >
                <Download className="w-4 h-4" />
                Excel
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-semibold"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Corps du document */}
      <div className={`p-8 ${colors.bg} border-l-4 ${colors.border.replace('border-', 'border-l-')}`}>
        {children}
      </div>

      {/* Footer avec statut */}
      {status && (
        <div className="bg-slate-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">Statut du rapport :</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${colors.badge} text-white shadow-sm`}>
                {status === 'Conforme' && '✅ '}
                {status === 'À surveiller' && '⚠️ '}
                {status === 'Critique' && '🚨 '}
                {status === 'Non conforme' && '❌ '}
                {status === 'Stable' && '📊 '}
                {status === 'À risque' && '⚠️ '}
                {status}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              Généré le {new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Composants utilitaires pour le contenu des rapports

export function ReportRow({ 
  label, 
  value, 
  highlight = false,
  description, 
  href, // <--- nouveau
}: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
  description?: string;
  href?: string; // <--- nouveau
}) {
  return (
    <div className={`py-3 ${highlight ? 'bg-white/60 rounded-lg px-4 my-2' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {href ? (
            <a
              href={href}
              className="text-blue-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                alert("Lien vers la page Dépôts — à activer plus tard !");
              }}
            >
              <p className={`${highlight ? 'text-lg font-bold' : 'text-base'} text-gray-700`}>
                {label}
              </p>
            </a>
          ) : (
            <p className={`${highlight ? 'text-lg font-bold' : 'text-base'} text-gray-700`}>
              {label}
            </p>
          )}        
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <p className={`${highlight ? 'text-2xl font-bold' : 'text-lg font-semibold'} text-gray-900 ml-4`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export function ReportDivider() {
  return <hr className="my-4 border-t-2 border-gray-300" />;
}

export function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-3 pb-2 border-b-2 border-gray-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

export function ReportStatusBox({ 
  status, 
  message 
}: { 
  status: 'success' | 'warning' | 'error' | 'info';
  message: string;
}) {
  const config = {
    success: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', icon: '✅' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-800', icon: '⚠️' },
    error: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', icon: '🚨' },
    info: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', icon: 'ℹ️' },
  };

  const c = config[status];

  return (
    <div className={`${c.bg} border-2 ${c.border} rounded-xl p-4 my-4`}>
      <p className={`${c.text} font-medium leading-relaxed`}>
        <span className="text-lg mr-2">{c.icon}</span>
        {message}
      </p>
    </div>
  );
}