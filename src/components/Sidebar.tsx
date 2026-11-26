import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  UploadCloud, 
  FolderHeart, 
  BarChart2, 
  Layers, 
  X,
  FileCheck2,
  ChevronRight,
  BookMarked
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onSelectFormFilter: (form: string) => void;
  onOpenManageSubjects: () => void;
  totalMaterialsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  setCurrentTab, 
  isOpen, 
  onClose,
  onSelectFormFilter,
  onOpenManageSubjects,
  totalMaterialsCount
}) => {
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD UTAMA', icon: LayoutDashboard },
    { id: 'catalog', label: 'KATALOG BAHAN MMI', icon: BookOpen },
    { id: 'upload', label: 'UPLOAD BAHAN', icon: UploadCloud },
    { id: 'my-resources', label: 'BAHAN SAYA', icon: FolderHeart },
    { id: 'analytics', label: 'ANALITIK & STATISTIK', icon: BarChart2 },
  ];

  const forms = [
    { name: 'TINGKATAN 1', desc: 'MENENGAH RENDAH' },
    { name: 'TINGKATAN 2', desc: 'MENENGAH RENDAH' },
    { name: 'TINGKATAN 3', desc: 'MENENGAH RENDAH' },
    { name: 'TINGKATAN 4', desc: 'MENENGAH ATAS' },
    { name: 'TINGKATAN 5', desc: 'PERSEDIAAN SPM' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar element */}
      <aside className={`
        fixed top-16 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 border-r border-slate-800
        flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="overflow-y-auto px-4 py-5 space-y-6">
          {/* Mobile close button */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <img 
                src="https://i.postimg.cc/mDxGNktt/logo-smkbb-removebg-preview-(2).png" 
                alt="Logo SMK Bukit Baru" 
                className="w-7 h-7 object-contain" 
              />
              <span className="text-xs uppercase font-bold tracking-wider text-teal-400">SMK BUKIT BARU</span>
            </div>
            <button 
              onClick={onClose} 
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Primary Navigation */}
          <div>
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              MENU UTAMA
            </span>
            <nav className="mt-1.5 space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-bold transition-all uppercase tracking-wider ${
                      isActive 
                        ? 'bg-teal-600 text-white shadow-xs' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'catalog' && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-teal-700 text-teal-100' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {totalMaterialsCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Filter: Tingkatan 1 - 5 */}
          <div>
            <div className="px-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>MENGIKUT TINGKATAN</span>
              <Layers className="w-3 h-3 text-teal-400" />
            </div>
            <div className="mt-1.5 space-y-0.5">
              {forms.map((f) => (
                <button
                  key={f.name}
                  onClick={() => {
                    onSelectFormFilter(f.name);
                    setCurrentTab('catalog');
                    onClose();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase text-slate-300 hover:bg-slate-800 hover:text-teal-300 transition flex items-center justify-between group"
                >
                  <div className="flex flex-col">
                    <span className="group-hover:translate-x-0.5 transition-transform">{f.name}</span>
                    <span className="text-[9px] text-slate-400 font-medium">{f.desc}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-teal-300 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Mata Pelajaran Action */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                onOpenManageSubjects();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[11px] font-black bg-slate-800/60 hover:bg-slate-800 text-teal-300 border border-slate-700/60 transition uppercase tracking-wider"
            >
              <div className="flex items-center space-x-2">
                <BookMarked className="w-3.5 h-3.5 text-teal-400" />
                <span>URUS MATA PELAJARAN</span>
              </div>
              <span className="text-[9px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-bold">KONFIGUR</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer info */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 text-[10px] text-slate-400 space-y-0.5 uppercase font-medium">
          <div className="flex items-center space-x-1.5 text-slate-300 font-bold text-[10px]">
            <FileCheck2 className="w-3 h-3 text-teal-400" />
            <span>PEMATUHAN MMI KPM</span>
          </div>
          <p className="leading-tight text-[9px] text-slate-400 font-normal">
            PUSAT SUMBER INSTRUKSIONAL SMK BUKIT BARU.
          </p>
        </div>
      </aside>
    </>
  );
};
