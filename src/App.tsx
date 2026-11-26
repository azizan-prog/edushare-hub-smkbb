import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { CatalogView } from './views/CatalogView';
import { UploadView } from './views/UploadView';
import { MyResourcesView } from './views/MyResourcesView';
import { AnalyticsView } from './views/AnalyticsView';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { ManageSubjectsModal } from './components/ManageSubjectsModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { ResourceItem, SubjectItem, FilterState } from './types';
import { 
  fetchAllResources, 
  getSubjectsList, 
  incrementDownloadCounter,
  addCustomSubject,
  deleteResource
} from './services/resourceService';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { WifiOff, Loader2, AlertTriangle, Trash2 } from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<Partial<FilterState>>({});
  const [manageSubjectsOpen, setManageSubjectsOpen] = useState(false);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ResourceItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const isOnline = useOnlineStatus();

  const loadData = async () => {
    try {
      const [resList, subList] = await Promise.all([
        fetchAllResources(),
        getSubjectsList()
      ]);
      setResources(resList);
      setSubjects(subList);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownload = async (item: ResourceItem) => {
    // Increment download counter
    await incrementDownloadCounter(item.id, item.isDemo);

    // Update local state count so UI reflects immediately
    setResources(prev => prev.map(r => 
      r.id === item.id ? { ...r, downloadCount: (r.downloadCount || 0) + 1 } : r
    ));

    if (item.externalUrl) {
      const link = document.createElement('a');
      link.href = item.externalUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (item.fileUrl && item.fileUrl !== '#' && !item.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = item.fileUrl;
      if (!item.fileUrl.includes('drive.google.com')) {
        link.download = item.fileName || `${item.title.replace(/\s+/g, '_')}.${item.resourceType.toLowerCase()}`;
      }
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Generate simulated downloadable text file for demonstration in preview environment
      const dummyContent = `Edu_Share HUB - KEMENTERIAN PENDIDIKAN MALAYSIA
==================================================
Tajuk: ${item.title}
Mata Pelajaran: ${item.subjectName} (${item.form})
Kategori: ${item.category === 'digital' ? 'Digital' : 'Bukan Digital'}
Jenis Fail: ${item.resourceType}
Penyumbang: ${item.ownerName} (${item.ownerEmail})
Tarikh: ${new Date(item.createdAt).toLocaleString('ms-MY')}

PANDUAN PELAKSANAAN GURU PENGGANTI (MMI):
--------------------------------------------------
${item.description}

Bahan MMI ini sedia digunakan untuk murid di dalam bilik darjah.
==================================================`;

      const blob = new Blob([dummyContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.fileName || `${item.title.replace(/[^a-zA-Z0-9]/g, '_')}_MMI.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleSelectFormFilter = (form: string) => {
    setCatalogFilters({ form });
  };

  const handleNavigateCatalogFromHero = (filters?: { searchQuery?: string; form?: string; category?: string }) => {
    if (filters) {
      setCatalogFilters(filters);
    }
    setCurrentTab('catalog');
  };

  const handleAddSubject = async (name: string, code: string) => {
    const created = await addCustomSubject(name, code);
    setSubjects(prev => [...prev, created]);
  };

  const handleUploadSuccess = (newItem: ResourceItem) => {
    setResources(prev => [newItem, ...prev]);
    setCurrentTab('my-resources');
  };

  const handleRequestDelete = (item: ResourceItem) => {
    setDeleteError('');
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeleting(true);
      setDeleteError('');
      await deleteResource(itemToDelete);
      const deletedId = itemToDelete.id;
      setResources(prev => prev.filter(r => r.id !== deletedId));
      if (selectedItem?.id === deletedId) {
        setSelectedItem(null);
      }
      setItemToDelete(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'RALAT SEMASA MEMADAM BAHAN.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      {/* Offline Connectivity Notification */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-[10px] px-3 py-1.5 flex items-center justify-center space-x-2 font-bold uppercase tracking-wider sticky top-0 z-50 shadow-md">
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          <span>ANDA SEDANG BERADA DI LUAR TALIAN (OFFLINE). KANDUNGAN YANG TELAH DISIMPAN DALAM CACHE MASIH BOLEH DIAKSES.</span>
        </div>
      )}

      {/* Primary Top Navbar */}
      <Navbar 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSetupGuide={() => setSetupGuideOpen(true)}
      />

      <div className="flex flex-1">
        {/* Desktop & Mobile Responsive Sidebar */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectFormFilter={handleSelectFormFilter}
          onOpenManageSubjects={() => setManageSubjectsOpen(true)}
          totalMaterialsCount={resources.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-5 lg:p-6 max-w-7xl mx-auto w-full transition-all">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-2.5">
              <Loader2 className="w-6 h-6 text-teal-600 animate-spin" />
              <p className="text-xs font-bold text-slate-500 tracking-wider">MEMUATKAN DATA Edu_Share HUB...</p>
            </div>
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  resources={resources}
                  subjects={subjects}
                  currentUserUid={currentUser?.uid}
                  onNavigateCatalog={handleNavigateCatalogFromHero}
                  onNavigateUpload={() => setCurrentTab('upload')}
                  onPreview={(item) => setSelectedItem(item)}
                  onDownload={handleDownload}
                  onDelete={handleRequestDelete}
                />
              )}

              {currentTab === 'catalog' && (
                <CatalogView
                  resources={resources}
                  subjects={subjects}
                  currentUserUid={currentUser?.uid}
                  initialFilters={catalogFilters}
                  onPreview={(item) => setSelectedItem(item)}
                  onDownload={handleDownload}
                  onDelete={handleRequestDelete}
                />
              )}

              {currentTab === 'upload' && (
                <UploadView
                  subjects={subjects}
                  onUploadSuccess={handleUploadSuccess}
                />
              )}

              {currentTab === 'my-resources' && (
                <MyResourcesView
                  resources={resources}
                  onRefresh={loadData}
                  onPreview={(item) => setSelectedItem(item)}
                  onDownload={handleDownload}
                  onDelete={handleRequestDelete}
                  onNavigateUpload={() => setCurrentTab('upload')}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView
                  resources={resources}
                  subjects={subjects}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Resource Detail & Teacher Implementation Modal */}
      <ResourceDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDownload={handleDownload}
        canDelete={Boolean(selectedItem && currentUser && selectedItem.ownerUid === currentUser.uid)}
        onDelete={handleRequestDelete}
      />

      {/* Manage Subjects Modal */}
      <ManageSubjectsModal
        isOpen={manageSubjectsOpen}
        onClose={() => setManageSubjectsOpen(false)}
        subjects={subjects}
        onAddSubject={handleAddSubject}
        onSelectSubjectFilter={(subId) => {
          setCatalogFilters({ subjectId: subId });
          setCurrentTab('catalog');
        }}
      />

      {/* Setup Guide Modal */}
      <SetupGuideModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
      />

      {/* Global Delete Confirmation Modal */}
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

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-lg uppercase">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setItemToDelete(null);
                  setDeleteError('');
                }}
                disabled={deleting}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition uppercase tracking-wider cursor-pointer"
              >
                BATAL
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 rounded-xl transition shadow-xs inline-flex items-center space-x-1 uppercase tracking-wider cursor-pointer"
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

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
