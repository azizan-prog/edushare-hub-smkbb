import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Award, 
  Layers, 
  Download, 
  BookOpen, 
  Globe2, 
  FileText,
  PieChart,
  Users
} from 'lucide-react';
import { ResourceItem, SubjectItem } from '../types';

interface AnalyticsViewProps {
  resources: ResourceItem[];
  subjects: SubjectItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ resources, subjects }) => {
  // Aggregate real dynamic numbers
  const totalMaterials = resources.length;
  const totalDownloads = resources.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  // By Form Level
  const formCounts: Record<string, number> = {
    'Tingkatan 1': 0,
    'Tingkatan 2': 0,
    'Tingkatan 3': 0,
    'Tingkatan 4': 0,
    'Tingkatan 5': 0,
  };

  // By Category
  let digitalCount = 0;
  let nonDigitalCount = 0;

  // By Subject
  const subjectCounts: Record<string, { count: number; name: string }> = {};

  // By Contributor
  const contributorCounts: Record<string, { count: number; name: string; email: string }> = {};

  // By File Type
  const formatCounts: Record<string, number> = {};

  resources.forEach(r => {
    // Form
    if (formCounts[r.form] !== undefined) {
      formCounts[r.form]++;
    }

    // Category
    if (r.category === 'digital') {
      digitalCount++;
    } else {
      nonDigitalCount++;
    }

    // Subject
    if (!subjectCounts[r.subjectId]) {
      subjectCounts[r.subjectId] = { count: 0, name: r.subjectName };
    }
    subjectCounts[r.subjectId].count++;

    // Contributor
    if (!contributorCounts[r.ownerUid]) {
      contributorCounts[r.ownerUid] = { 
        count: 0, 
        name: r.ownerName || 'Guru MMI', 
        email: r.ownerEmail || '' 
      };
    }
    contributorCounts[r.ownerUid].count++;

    // Format
    formatCounts[r.resourceType] = (formatCounts[r.resourceType] || 0) + 1;
  });

  const sortedSubjects = Object.values(subjectCounts)
    .sort((a, b) => b.count - a.count);

  const topContributors = Object.values(contributorCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const digitalPct = totalMaterials ? Math.round((digitalCount / totalMaterials) * 100) : 0;
  const nonDigitalPct = totalMaterials ? Math.round((nonDigitalCount / totalMaterials) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="pb-3.5 border-b border-slate-200">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase">ANALITIK & STATISTIK SEBENAR</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-wide font-normal">
          DATA MASA-NYATA DIKIRA BERASASKAN REKOD BAHAN DAN AKTIVITI MUAT TURUN GURU
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JUMLAH BAHAN</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalMaterials}</div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">DALAM PANGKALAN DATA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">JUMLAH AKSES</span>
            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg"><Download className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-700 font-mono tabular-nums">{totalDownloads}</div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">KIRAAN MUAT TURUN</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GURU PENYUMBANG</span>
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Users className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{Object.keys(contributorCounts).length}</div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">WARGA PENDIDIK</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SUBJEK BERBAHAN</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Layers className="w-3.5 h-3.5" /></div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{Object.keys(subjectCounts).length}</div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">DARIPADA {subjects.length} SUBJEK</span>
        </div>
      </div>

      {/* Two Column Layout: Tingkatan & Digital vs Non-Digital */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Taburan Mengikut Tingkatan */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5 uppercase">
              <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
              <span>TABURAN BAHAN MENGIKUT TINGKATAN (1 - 5)</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-bold uppercase">{totalMaterials} BAHAN</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(formCounts).map(([formName, count]) => {
              const pct = totalMaterials ? Math.round((count / totalMaterials) * 100) : 0;
              return (
                <div key={formName} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700 uppercase">
                    <span>{formName}</span>
                    <span>{count} BAHAN ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-teal-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Digital vs Bukan Digital */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5 uppercase">
              <PieChart className="w-3.5 h-3.5 text-purple-600" />
              <span>KATEGORI: DIGITAL VS BUKAN DIGITAL</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3.5 bg-teal-50/60 rounded-2xl border border-teal-100">
              <div className="flex items-center space-x-1.5 text-teal-800 text-[11px] font-bold mb-1 uppercase">
                <Globe2 className="w-3.5 h-3.5 text-teal-600" />
                <span>BAHAN DIGITAL</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-teal-900 font-mono tabular-nums">{digitalCount}</div>
              <span className="text-[10px] text-teal-700 font-bold uppercase">{digitalPct}% DARIPADA KESELURUHAN</span>
              <p className="text-[10px] text-teal-600 mt-1.5 leading-relaxed uppercase font-normal">
                KUIZ QUIZIZZ, PAUTAN GOOGLE FORMS, SIMULASI, VIDEO PEMBELAJARAN.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100">
              <div className="flex items-center space-x-1.5 text-amber-800 text-[11px] font-bold mb-1 uppercase">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>BUKAN DIGITAL</span>
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-900 font-mono tabular-nums">{nonDigitalCount}</div>
              <span className="text-[10px] text-amber-700 font-bold uppercase">{nonDigitalPct}% DARIPADA KESELURUHAN</span>
              <p className="text-[10px] text-amber-600 mt-1.5 leading-relaxed uppercase font-normal">
                MODUL BERCETAK, LEMBARAN KERJA BILIK DARJAH, SOALAN TOPIKAL FIZIKAL.
              </p>
            </div>
          </div>

          {/* Format Types breakdown */}
          <div className="pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              PECAHAN FORMAT DOKUMEN
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {Object.entries(formatCounts).map(([fmt, cnt]) => (
                <div key={fmt} className="px-2.5 py-1 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 flex items-center space-x-1 uppercase font-bold text-[10px]">
                  <span>{fmt}:</span>
                  <span className="text-teal-700">{cnt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Subjects & Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Subjects */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5 uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>MATA PELAJARAN PALING AKTIF</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {sortedSubjects.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 uppercase font-medium">BELUM ADA BAHAN DIREKODKAN.</p>
            ) : (
              sortedSubjects.slice(0, 6).map((sub, index) => (
                <div key={sub.name} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-md bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-800 uppercase">{sub.name}</span>
                  </div>
                  <span className="font-bold text-teal-700 uppercase text-[11px]">{sub.count} BAHAN</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5 uppercase">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>GURU PENYUMBANG MMI TERBANYAK</span>
          </h2>

          <div className="divide-y divide-slate-100">
            {topContributors.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 uppercase font-medium">BELUM ADA PENYUMBANG DIREKODKAN.</p>
            ) : (
              topContributors.map((c, index) => (
                <div key={c.email || c.name} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold flex items-center justify-center text-[10px]">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 block leading-tight uppercase text-xs">{c.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">{c.email}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-100 rounded-lg font-bold text-[10px] uppercase">
                    {c.count} BAHAN
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
