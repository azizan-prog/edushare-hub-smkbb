import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  BookOpen, 
  Filter, 
  Sparkles, 
  Layers, 
  FileCheck2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ResourceItem, SubjectItem, FilterState } from '../types';
import { ResourceCard } from '../components/ResourceCard';

interface CatalogViewProps {
  resources: ResourceItem[];
  subjects: SubjectItem[];
  currentUserUid?: string | null;
  initialFilters?: Partial<FilterState>;
  onPreview: (item: ResourceItem) => void;
  onDownload: (item: ResourceItem) => void;
  onDelete?: (item: ResourceItem) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  resources,
  subjects,
  currentUserUid,
  initialFilters,
  onPreview,
  onDownload,
  onDelete
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: initialFilters?.searchQuery || '',
    subjectId: initialFilters?.subjectId || '',
    form: initialFilters?.form || '',
    category: initialFilters?.category || '',
    resourceType: initialFilters?.resourceType || '',
  });

  const [page, setPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
      setPage(1);
    }
  }, [initialFilters]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.ownerName.toLowerCase().includes(q);

      const matchSubject = !filters.subjectId || item.subjectId.toLowerCase() === filters.subjectId.toLowerCase();
      const matchForm = !filters.form || item.form.toLowerCase() === filters.form.toLowerCase();
      const matchCategory = !filters.category || item.category.toLowerCase() === filters.category.toLowerCase();
      const matchType = !filters.resourceType || item.resourceType.toLowerCase() === filters.resourceType.toLowerCase();

      return matchSearch && matchSubject && matchForm && matchCategory && matchType;
    });
  }, [resources, filters]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage) || 1;
  const paginatedItems = filteredResources.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      subjectId: '',
      form: '',
      category: '',
      resourceType: '',
    });
    setPage(1);
  };

  const formsList = ['TINGKATAN 1', 'TINGKATAN 2', 'TINGKATAN 3', 'TINGKATAN 4', 'TINGKATAN 5'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase">KATALOG BAHAN MMI</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-normal">
            TEROKAI MODUL, LEMBARAN KERJA, DAN KUIZ INTERAKTIF MENGIKUT SILIBUS TINGKATAN 1 HINGGA 5
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-slate-400 uppercase font-medium">
          <span>MENUNJUKKAN <strong>{filteredResources.length}</strong> DARIPADA {resources.length} BAHAN</span>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        {/* Main Search Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => { 
                setFilters(prev => ({ ...prev, searchQuery: e.target.value })); 
                setPage(1); 
              }}
              placeholder="CARI KATA KUNCI, TOPIK, MATA PELAJARAN, ATAU NAMA GURU..."
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-slate-400 uppercase"
            />
          </div>

          <div className="flex items-center space-x-2">
            {(filters.searchQuery || filters.subjectId || filters.form || filters.category || filters.resourceType) && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition inline-flex items-center space-x-1 uppercase tracking-wider"
                title="KOSONGKAN SEMUA PENAPIS"
              >
                <RotateCcw className="w-3 h-3" />
                <span>RESET</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2.5 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              MATA PELAJARAN
            </label>
            <select
              value={filters.subjectId}
              onChange={(e) => { 
                setFilters(p => ({ ...p, subjectId: e.target.value })); 
                setPage(1); 
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium uppercase"
            >
              <option value="">SEMUA SUBJEK ({subjects.length})</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name.toUpperCase()} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              TINGKATAN
            </label>
            <select
              value={filters.form}
              onChange={(e) => { 
                setFilters(p => ({ ...p, form: e.target.value })); 
                setPage(1); 
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium uppercase"
            >
              <option value="">SEMUA TINGKATAN (1-5)</option>
              {formsList.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              KATEGORI PELAKSANAAN
            </label>
            <select
              value={filters.category}
              onChange={(e) => { 
                setFilters(p => ({ ...p, category: e.target.value })); 
                setPage(1); 
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium uppercase"
            >
              <option value="">SEMUA KATEGORI</option>
              <option value="bukan_digital">BUKAN DIGITAL (CETAK / LEMBARAN)</option>
              <option value="digital">DIGITAL (MAYA / INTERAKTIF)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              JENIS FORMAT
            </label>
            <select
              value={filters.resourceType}
              onChange={(e) => { 
                setFilters(p => ({ ...p, resourceType: e.target.value })); 
                setPage(1); 
              }}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-800 bg-slate-50/50 hover:bg-white focus:ring-2 focus:ring-teal-500 outline-none font-medium uppercase"
            >
              <option value="">SEMUA FORMAT</option>
              <option value="PDF">DOKUMEN PDF</option>
              <option value="DOCX">MICROSOFT WORD (DOCX)</option>
              <option value="PPTX">POWERPOINT (PPTX)</option>
              <option value="XLSX">EXCEL SPREADSHEET (XLSX)</option>
              <option value="Video">VIDEO PEMBELAJARAN</option>
              <option value="Imej">IMEJ / INFOGRAFIK</option>
              <option value="Pautan Luar">PAUTAN LUAR (LINK)</option>
            </select>
          </div>
        </div>

        {/* Quick Tingkatan Switcher Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[10px] font-bold text-slate-400 mr-1 uppercase">TINGKATAN:</span>
          <button
            onClick={() => { setFilters(p => ({ ...p, form: '' })); setPage(1); }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition uppercase tracking-wider ${
              filters.form === '' 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            SEMUA
          </button>
          {formsList.map(f => (
            <button
              key={f}
              onClick={() => { setFilters(p => ({ ...p, form: f })); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition uppercase tracking-wider ${
                filters.form.toUpperCase() === f.toUpperCase() 
                  ? 'bg-teal-600 text-white shadow-2xs' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Cards Content */}
      {paginatedItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/90 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-black text-slate-900 uppercase">TIADA BAHAN MMI DIJUMPAI</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto uppercase">
            TIADA BAHAN INSTRUKSIONAL YANG MEMENUHI KRITERIA CARIAN ATAU PENAPISAN ANDA SAAT INI. SILA CUBA KATA KUNCI LAIN ATAU KOSONGKAN TAPISAN.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition uppercase tracking-wider"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>TETAPKAN SEMULA CARIAN</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedItems.map((item) => {
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
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 transition inline-flex items-center space-x-1 uppercase tracking-wider"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>SEBELUMNYA</span>
          </button>

          <span className="text-xs font-bold text-slate-700 px-3 uppercase">
            HALAMAN {page} DARI {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 transition inline-flex items-center space-x-1 uppercase tracking-wider"
          >
            <span>SETERUSNYA</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
