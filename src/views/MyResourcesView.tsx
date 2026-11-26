import React, { useState, useMemo } from 'react';
import { 
  FolderHeart, 
  Trash2, 
  Eye, 
  Download, 
  Search, 
  AlertTriangle, 
  UploadCloud, 
  LogIn, 
  Sparkles,
  BarChart,
  Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ResourceItem } from '../types';
import { ResourceCard } from '../components/ResourceCard';
import { deleteResource } from '../services/resourceService';

interface MyResourcesViewProps {
  resources: ResourceItem[];
  onRefresh: () => void;
  onPreview: (item: ResourceItem) => void;
  onDownload: (item: ResourceItem) => void;
  onDelete?: (item: ResourceItem) => void;
  onNavigateUpload: () => void;
}

export const MyResourcesView: React.FC<MyResourcesViewProps> = ({
  resources,
  onRefresh,
  onPreview,
  onDownload,
  onDelete,
  onNavigateUpload
}) => {
  const { currentUser, isDemoMode, signInWithGoogle } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<ResourceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter items owned by the current user
  const myItems = useMemo(() => {
    if (!currentUser) return [];
    return resources.filter(r => r.ownerUid === currentUser.uid);
  }, [resources, currentUser]);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return myItems;
    const q = searchTerm.toLowerCase();
    return myItems.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.subjectName.toLowerCase().includes(q) ||
      r.form.toLowerCase().includes(q)
    );
  }, [myItems, searchTerm]);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 border border-slate-200/90 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
          <FolderHeart className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 uppercase">AKSES BAHAN SAYA</h2>
        <p className="text-xs text-slate-500 leading-relaxed uppercase">
          {isDemoMode
            ? 'KLIK BUTANG DI BAWAH UNTUK MASUK SEBAGAI GURU DEMO DAN MENGURUSKAN REKOD BAHAN YANG ANDA MUAT NAIK.'
            : 'SILA LOG MASUK DENGAN AKAUN GOOGLE UNTUK MELIHAT DAN MENGURUSKAN REKOD BAHAN INSTRUKSIONAL YANG ANDA SUMBANGKAN.'}
        </p>
        <button
          onClick={() => {
            setErrorMsg('');
            signInWithGoogle().catch((e) => setErrorMsg(e?.message || 'LOG MASUK DIBATALKAN.'));
          }}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center space-x-2 uppercase tracking-wider cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{isDemoMode ? 'MASUK SEBAGAI GURU DEMO' : 'SIGN IN WITH GOOGLE'}</span>
        </button>
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-bold uppercase">
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  const totalDownloadsForMe = myItems.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      setErrorMsg('');
      await deleteResource(itemToDelete);
      setItemToDelete(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Ralat memadam bahan.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-3.5 border-b border-slate-200">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase">BAHAN SAYA</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wide font-normal">
            URUS BAHAN PENGAJARAN MMI YANG DITERBITKAN ATAS NAMA ANDA
          </p>
        </div>

        <button
          onClick={onNavigateUpload}
          className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center space-x-1.5 self-start sm:self-auto uppercase tracking-wider"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>TAMBAH BAHAN BAHARU</span>
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            BAHAN DITERBITKAN
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{myItems.length}</div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">MODUL & PAUTAN AKTIF</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            IMPAK MUAT TURUN
          </span>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-700 font-mono tabular-nums">{totalDownloadsForMe}</div>
          <span className="text-[10px] text-slate-400 uppercase font-medium">JUMLAH RUJUKAN RAKAN GURU</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            STATUS PENYUMBANG
          </span>
          <div className="text-xs sm:text-sm font-extrabold text-slate-800 truncate uppercase">{currentUser.displayName || 'GURU AKTIF'}</div>
          <span className="text-[10px] text-teal-600 font-bold uppercase">PENGESAHAN GOOGLE SAH</span>
        </div>
      </div>

      {/* Search Bar if user has items */}
      {myItems.length > 0 && (
        <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 flex items-center shadow-2xs">
          <Search className="w-3.5 h-3.5 text-slate-400 ml-2 mr-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="CARI DALAM SENARAI BAHAN SAYA..."
            className="w-full text-xs font-medium text-slate-800 outline-none uppercase"
          />
        </div>
      )}

      {/* List or Empty State */}
      {myItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200/90 text-center space-y-4">
          <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto">
            <FolderHeart className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase">ANDA BELUM MENYUMBANG BAHAN MMI</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto uppercase">
              BAHAN YANG ANDA MUAT NAIK AKAN DIREKODKAN DI SINI. ANDA BOLEH MELIHAT BILANGAN MUAT TURUN ATAU MEMADAMNYA BILA-BILA MASA.
            </p>
          </div>
          <button
            onClick={onNavigateUpload}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center space-x-2 uppercase tracking-wider"
          >
            <UploadCloud className="w-4 h-4" />
            <span>MUAT NAIK BAHAN PERTAMA ANDA</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-500 uppercase">
          TIADA BAHAN SEPADAN DENGAN CARIAN "{searchTerm.toUpperCase()}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map(item => (
            <ResourceCard
              key={item.id}
              item={item}
              canManage={true}
              onPreview={onPreview}
              onDownload={onDownload}
              onDelete={(res) => (onDelete ? onDelete(res) : setItemToDelete(res))}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal Before Delete */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">PENGESAHAN PADAM BAHAN</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed uppercase">
                ADAKAH ANDA PASTI MAHU MEMADAM <strong>"{itemToDelete.title}"</strong>?{' '}
                REKOD BAHAN INI AKAN DIPADAM DARIPADA KATALOG DAN PANGKALAN DATA SISTEM.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2 bg-rose-50 text-rose-700 text-[11px] rounded-lg uppercase">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition uppercase tracking-wider"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 rounded-xl transition shadow-xs inline-flex items-center space-x-1 uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? 'SEDANG MEMADAM...' : 'YA, PADAM BAHAN'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
