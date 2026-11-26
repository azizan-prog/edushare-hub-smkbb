import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Layers, 
  Download, 
  ArrowRight, 
  Sparkles, 
  UploadCloud, 
  Globe2, 
  FileText, 
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { ResourceItem, SubjectItem } from '../types';
import { ResourceCard } from '../components/ResourceCard';

interface DashboardViewProps {
  resources: ResourceItem[];
  subjects: SubjectItem[];
  currentUserUid?: string | null;
  onNavigateCatalog: (filters?: { searchQuery?: string; form?: string; category?: string }) => void;
  onNavigateUpload: () => void;
  onPreview: (item: ResourceItem) => void;
  onDownload: (item: ResourceItem) => void;
  onDelete?: (item: ResourceItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  resources,
  subjects,
  currentUserUid,
  onNavigateCatalog,
  onNavigateUpload,
  onPreview,
  onDownload,
  onDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);
  const digitalCount = resources.filter(r => r.category === 'digital').length;
  const nonDigitalCount = resources.filter(r => r.category === 'bukan_digital').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigateCatalog({ searchQuery: searchTerm.trim() });
  };

  const latestResources = resources.slice(0, 6);

  const forms = ['Tingkatan 1', 'Tingkatan 2', 'Tingkatan 3', 'Tingkatan 4', 'Tingkatan 5'];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Section with Navy and Teal palette */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-7 sm:p-10 lg:p-12 border border-slate-800 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-teal-500/15 border border-teal-500/30 text-teal-300 rounded-full text-[10px] font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            <span>PUSAT SUMBER INSTRUKSIONAL GURU SMK BUKIT BARU</span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight uppercase">
            PUSAT PERKONGSIAN BAHAN <span className="text-teal-400">MMI</span>
          </h1>

          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed max-w-xl uppercase tracking-wide font-normal">
            SISTEM PENGURUSAN BAHAN PENGAJARAN TERSUSUN UNTUK GURU MENCARI, MENYUMBANG, DAN MEMUAT TURUN LATIHAN KENDIRI BAGI KELAS RELIEF TINGKATAN 1 HINGGA 5.
          </p>

          {/* Search bar inside Hero */}
          <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="CARI TOPIK, TINGKATAN, ATAU KATA KUNCI (CTH: TATABAHASA, ALGEBRA)..."
                className="w-full pl-9 pr-3.5 py-2.5 bg-white text-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-400 shadow-md placeholder:text-slate-400 uppercase"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1.5 uppercase tracking-wider"
            >
              <span>CARI BAHAN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick tags */}
          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
            <span className="font-bold text-slate-300 uppercase">CARIAN POPULAR:</span>
            {['MATEMATIK T4', 'BAHASA MELAYU T2', 'SAINS T3', 'SEJARAH SPM'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onNavigateCatalog({ searchQuery: tag })}
                className="text-teal-300 hover:text-white underline underline-offset-2 transition font-semibold uppercase"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JUMLAH BAHAN</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{resources.length}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block uppercase font-medium">TERSEDIA UNTUK PENGAJARAN</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MUAT TURUN</span>
            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg"><Download className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalDownloads}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block uppercase font-medium">AKSES OLEH GURU GANTI</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DIGITAL</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Globe2 className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{digitalCount}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block uppercase font-medium">KUIZ & PAUTAN MAYA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">BUKAN DIGITAL</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><FileText className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{nonDigitalCount}</div>
          <span className="text-[10px] text-slate-400 mt-0.5 block uppercase font-medium">LEMBARAN & MODUL CETAK</span>
        </div>
      </div>

      {/* Tingkatan Cards Selection */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase">PILIH MENGIKUT TINGKATAN</h2>
            <p className="text-[11px] text-slate-500 uppercase font-normal">CARI BAHAN INSTRUKSIONAL KHUSUS MENGIKUT TAHAP KELAS MURID</p>
          </div>
          <span className="text-[10px] font-bold text-teal-700 hidden sm:inline uppercase">KURIKULUM STANDARD SEKOLAH MENENGAH (KSSM)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {forms.map((formName, idx) => {
            const count = resources.filter(r => r.form.toUpperCase() === formName.toUpperCase()).length;
            return (
              <button
                key={formName}
                onClick={() => onNavigateCatalog({ form: formName })}
                className="p-3 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 text-left transition group shadow-2xs"
              >
                <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center font-bold text-[11px] text-slate-700 transition mb-1.5">
                  T{idx + 1}
                </div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-teal-700 transition uppercase">
                  {formName}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-medium">
                  {count} BAHAN
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Latest Materials */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase">BAHAN MMI TERKINI</h2>
            <p className="text-[11px] text-slate-500 uppercase font-normal">PERKONGSIAN BAHAN INSTRUKSIONAL TERBAHARU DALAM SISTEM</p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onNavigateUpload}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition uppercase tracking-wider"
            >
              <UploadCloud className="w-3 h-3 text-teal-600" />
              <span>SUMBANG BAHAN</span>
            </button>
            <button
              onClick={() => onNavigateCatalog()}
              className="inline-flex items-center space-x-1 text-[11px] font-bold text-teal-700 hover:text-teal-800 uppercase tracking-wider"
            >
              <span>LIHAT SEMUA KATALOG</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {latestResources.map((item) => {
            const isOwner = Boolean(currentUserUid && item.ownerUid === currentUserUid);
            return (
              <ResourceCard
                key={item.id}
                item={item}
                canManage={isOwner}
                onPreview={onPreview}
                onDownload={onDownload}
                onDelete={isOwner ? onDelete : undefined}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
