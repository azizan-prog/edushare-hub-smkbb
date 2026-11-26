import React, { useState } from 'react';
import { X, Plus, BookOpen, Check, Search } from 'lucide-react';
import { SubjectItem } from '../types';

interface ManageSubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: SubjectItem[];
  onAddSubject: (name: string, code: string) => Promise<void>;
  onSelectSubjectFilter?: (subjectId: string) => void;
}

export const ManageSubjectsModal: React.FC<ManageSubjectsModalProps> = ({
  isOpen,
  onClose,
  subjects,
  onAddSubject,
  onSelectSubjectFilter
}) => {
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) return;

    try {
      setLoading(true);
      await onAddSubject(newName.trim(), newCode.trim());
      setNewName('');
      setNewCode('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase">SENARAI MATA PELAJARAN</h2>
              <p className="text-[10px] text-slate-500 font-medium uppercase">URUS DAN TAMBAH MATA PELAJARAN KURIKULUM SEKOLAH MENENGAH</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-2.5">
            <span className="text-[11px] font-black text-slate-800 uppercase tracking-wide block">
              TAMBAH MATA PELAJARAN BAHARU
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="NAMA SUBJEK (CTH: BAHASA ARAB)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none uppercase font-semibold"
                />
              </div>
              <div>
                <input
                  type="text"
                  required
                  placeholder="KOD (CTH: BA)"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none uppercase font-semibold"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              {success ? (
                <span className="text-[10px] text-emerald-600 font-bold uppercase flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>MATA PELAJARAN BERJAYA DITAMBAH!</span>
                </span>
              ) : <div />}
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg text-[10px] font-bold uppercase inline-flex items-center space-x-1 transition shadow-xs tracking-wider"
              >
                <Plus className="w-3 h-3" />
                <span>{loading ? 'MENYIMPAN...' : 'TAMBAH SUBJEK'}</span>
              </button>
            </div>
          </form>

          {/* List Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">MATA PELAJARAN AKTIF ({subjects.length})</span>
              <div className="relative w-44">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="CARI SUBJEK..."
                  className="w-full pl-7 pr-2 py-1 text-[11px] border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-teal-500 uppercase font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto p-1">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    if (onSelectSubjectFilter) {
                      onSelectSubjectFilter(s.id);
                      onClose();
                    }
                  }}
                  className="p-2 bg-white border border-slate-200 hover:border-teal-400 rounded-lg flex items-center justify-between transition cursor-pointer hover:bg-teal-50/30 group uppercase"
                >
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-teal-800 truncate mr-2">
                    {s.name}
                  </span>
                  <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 flex-shrink-0">
                    {s.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition"
          >
            SELESAI
          </button>
        </div>
      </div>
    </div>
  );
};
