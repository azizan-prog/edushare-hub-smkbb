import React, { useState } from 'react';
import { X, Check, Copy, Flame, Sheet, ShieldCheck, ExternalLink, HardDrive } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase/firebaseConfig';
import { isGasRelayConfigured } from '../services/driveService';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const gasActive = isGasRelayConfigured();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleEnv = `VITE_GAS_WEBHOOK_URL="https://script.google.com/macros/s/AKfycb.../exec"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
              <Flame className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase">PANDUAN KONFIGURASI FIREBASE & GOOGLE DRIVE SEKOLAH</h2>
              <p className="text-[10px] text-slate-500 font-medium uppercase">SUPAYA SEMUA GURU BOLEH MUAT NAIK TANPA PENGESAHAN DRIVE</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-600 uppercase font-medium">
          <div className={`p-3 rounded-xl leading-relaxed font-semibold text-[11px] border ${
            isFirebaseConfigured
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200/80 text-amber-900'
          }`}>
            <strong className="font-black">
              {isFirebaseConfigured ? 'STATUS FIREBASE: AKTIF & DISAMBUNGKAN' : 'STATUS SEMASA: MOD PRATONTON (DEMO MODE)'}
            </strong><br />
            {isFirebaseConfigured
              ? 'DATABASE CLOUD FIRESTORE & LOG MASUK GOOGLE SUDAH AKTIF. MOD MUAT NAIK DRIVE SEKOLAH: ' + (gasActive ? 'AKTIF (TANPA PENGESAHAN GURU).' : 'MENUNGGU URL APPS SCRIPT.')
              : 'APLIKASI SEDANG BEROPERASI MENGGUNAKAN CACHE PERANTI.'}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <HardDrive className="w-3.5 h-3.5 text-teal-600" />
              <span>1. MUAT NAIK DRIVE TANPA PENGESAHAN GURU (APPS SCRIPT RELAY)</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-1 leading-relaxed text-slate-700 font-semibold text-[11px]">
              <li>BUKA GOOGLE SHEETS DI AKAUN PEMILIK 4 FOLDER DRIVE SEKOLAH.</li>
              <li>KLIK <strong className="font-black">EXTENSIONS &rarr; APPS SCRIPT</strong> DAN TAMPAL KOD DARIPADA FAIL <code className="lowercase font-bold">gas/Code.gs</code>.</li>
              <li>KLIK <strong className="font-black">DEPLOY &rarr; NEW DEPLOYMENT &rarr; WEB APP</strong>.</li>
              <li>TETAPKAN <strong className="font-black">EXECUTE AS: ME</strong> DAN <strong className="font-black">WHO HAS ACCESS: ANYONE</strong>.</li>
              <li>MASUKKAN URL WEB APP TERSEBUT KE DALAM SECRETS / <code className="lowercase font-bold">.env</code>:</li>
            </ol>

            <div className="relative">
              <pre className="p-3 bg-slate-900 text-teal-300 rounded-xl text-[10px] sm:text-[11px] overflow-x-auto font-mono lowercase">
                {sampleEnv}
              </pre>
              <button
                onClick={() => handleCopy(sampleEnv, 'env')}
                className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold uppercase inline-flex items-center space-x-1"
              >
                {copiedKey === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'env' ? 'DISALIN' : 'SALIN'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
              <span>2. BENARKAN SEMUA GURU LOG MASUK (ELAK ERROR 403)</span>
            </h3>
            <p className="leading-relaxed font-semibold text-slate-700 text-[11px]">
              BUKA <a href="https://console.cloud.google.com/auth/audience?project=gen-lang-client-0105114901" target="_blank" rel="noreferrer" className="text-teal-700 underline font-black inline-flex items-center">GOOGLE CLOUD AUDIENCE <ExternalLink className="w-2.5 h-2.5 ml-0.5" /></a> DAN KLIK <strong className="font-black">PUBLISH APP</strong>. OLEH KERANA LOG MASUK GURU HANYA MENGGUNAKAN PROFIL ASAS (TANPA SKOP DRIVE), GOOGLE TIDAK MEMERLUKAN PENGESAHAN APP UNTUK SEMUA GURU @MOE-DL.EDU.MY LOG MASUK.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
              <Sheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. LOG REKOD AUTOMATIK KE GOOGLE SHEETS</span>
            </h3>
            <p className="leading-relaxed font-semibold text-slate-700 text-[11px]">
              SKRIP <code className="lowercase font-bold">gas/Code.gs</code> TURUT MENCATAT SETIAP BAHAN YANG DIMUAT NAIK KE DALAM HELAIAN <strong className="font-black">MMI_RECORDS</strong> SECARA AUTOMATIK.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
          >
            TUTUP PANDUAN
          </button>
        </div>
      </div>
    </div>
  );
};
