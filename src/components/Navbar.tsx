import React from 'react';
import { LogIn, LogOut, Menu, UserCheck, Settings, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenSetupGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenSetupGuide }) => {
  const { currentUser, userProfile, isDemoMode, signInWithGoogle, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <img 
              src="https://i.postimg.cc/mDxGNktt/logo-smkbb-removebg-preview-(2).png" 
              alt="Logo SMK Bukit Baru" 
              className="w-10 h-10 object-contain drop-shadow shrink-0" 
            />
            <div>
              <div className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center space-x-1.5 leading-tight">
                <span>Edu_Share</span>
                <span className="text-teal-400 font-semibold">HUB</span>
              </div>
              <span className="text-[10px] font-bold text-teal-300 block tracking-wider uppercase">
                SMK BUKIT BARU
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Demo Mode / Setup status */}
          {isDemoMode ? (
            <button
              onClick={onOpenSetupGuide}
              className="flex items-center space-x-1.5 px-2 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold transition cursor-pointer"
              title="KLIK UNTUK PANDUAN PERSEDIAAN FIREBASE"
            >
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="hidden md:inline">MOD DEMO</span>
              <Settings className="w-2.5 h-2.5 text-amber-400/80 ml-0.5" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 bg-teal-500/10 text-teal-300 border border-teal-500/30 rounded-lg text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>FIREBASE AKTIF</span>
            </div>
          )}

          {/* User Section */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-slate-800">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[11px] font-semibold text-slate-200 truncate max-w-[150px]">
                  {userProfile?.name || currentUser.displayName}
                </span>
                <span className="text-[9px] text-teal-400 truncate max-w-[150px]">
                  {currentUser.email}
                </span>
              </div>
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt="Avatar" 
                  className="w-7 h-7 rounded-full ring-2 ring-teal-500 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-teal-400 ring-1 ring-slate-700">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              )}
              <button
                onClick={() => signOut()}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                title="LOG KELUAR"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle().catch(() => {})}
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm uppercase tracking-wider cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>{isDemoMode ? 'MASUK GURU DEMO' : 'LOG MASUK GOOGLE'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
