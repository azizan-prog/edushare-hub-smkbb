import React, { useState } from 'react';
import { DownloadCloud, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm transition uppercase tracking-wider"
        title="PASANG APLIKASI PWA PADA PERANTI"
      >
        <DownloadCloud className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">PASANG PWA</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-xs font-bold transition uppercase tracking-wider"
          title="PASANG DI IOS / IPHONE"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PASANG DI IOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 text-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase">PASANG PADA IPHONE / IPAD</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                1. TEKAN IKON <strong>SHARE</strong> (KONGSIKAN) PADA BAR ALAT SAFARI.<br />
                2. SKROL KE BAWAH DAN PILIH <strong>ADD TO HOME SCREEN</strong> (TAMBAH KE SKRIN UTAMA).<br />
                3. TEKAN <strong>ADD</strong> UNTUK MEMASANG IKON Edu_Share HUB TERUS PADA PERANTI ANDA.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-teal-600 hover:bg-teal-700 py-2 text-xs font-bold text-white transition uppercase tracking-wider"
              >
                FAHAM & TUTUP
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
