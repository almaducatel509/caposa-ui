import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { FaFileSignature } from "react-icons/fa6";
import { PiSignatureBold } from "react-icons/pi";
import { TbSignatureOff } from "react-icons/tb";

// ─── SignatureField ───────────────────────────────────────────────────────────
export default function SignatureField({ value, onChange, error }: {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}) {
  const [mode, setMode] = useState<'nom' | 'croix'>('nom');

  const handleCroix = () => {
    const now = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    onChange(`✚ — Ne sait pas signer (${now})`);
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
        Signature du membre
      </p>

      {/* Toggle mode */}
      <div className="flex gap-2 mb-3">
        <button type="button" onClick={() => { setMode('nom'); onChange(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg border transition-colors ${
            mode === 'nom'
              ? 'bg-[#DDEAD5] text-[#1B5E20] border-[#2E7D32]/30'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}>
          <PiSignatureBold  size={14} />
          Signer par nom
        </button>
        <button type="button" onClick={() => { setMode('croix'); handleCroix(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg border transition-colors ${
            mode === 'croix'
              ? 'bg-[#DDEAD5] text-[#1B5E20] border-[#2E7D32]/30'
              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
          }`}>
          <TbSignatureOff size={14} />
          Ne sait pas signer
        </button>
      </div>
      {/* Champ signature */}
      {mode === 'nom' ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Le membre écrit son nom complet ici"
          className={`w-full px-4 py-3 text-lg border rounded-xl bg-white italic text-gray-700
            focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/30 focus:border-[#2E7D32]
            ${error ? 'border-red-300' : 'border-gray-200'}`}
          style={{ fontFamily: 'cursive' }}
        />
      ) : (
        <div className="w-full px-4 py-3 border border-[#2E7D32]/30 rounded-xl bg-[#DDEAD5]/20 flex flex-col items-center gap-1">
          <FaPlus size={20} className="text-gray-700" />
          <p className="text-xs text-gray-500">{value}</p>
        </div>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}   