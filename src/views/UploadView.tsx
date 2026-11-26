import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  Info,
  ShieldCheck,
  FileCheck,
  HardDrive,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SubjectItem, FormLevel, ResourceCategory, ResourceType, ResourceItem } from '../types';
import { uploadResource } from '../services/resourceService';
import { getTargetDriveFolder, isGasRelayConfigured, GAS_MAX_FILE_BYTES } from '../services/driveService';

interface UploadViewProps {
  subjects: SubjectItem[];
  onUploadSuccess: (item: ResourceItem) => void;
}

const GoogleLogoIcon: React.FC = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

export const UploadView: React.FC<UploadViewProps> = ({ subjects, onUploadSuccess }) => {
  const { currentUser, userProfile, isDemoMode, signInWithGoogle } = useAuth();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || 'bm');
  const [form, setForm] = useState<FormLevel>('Tingkatan 1');
  const [category, setCategory] = useState<ResourceCategory>('bukan_digital');
  const [resourceType, setResourceType] = useState<ResourceType>('PDF');
  const [description, setDescription] = useState('');
  const [uploadMode, setUploadMode] = useState<'file' | 'link'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [externalUrl, setExternalUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [successItem, setSuccessItem] = useState<ResourceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 text-center shadow-sm space-y-5 animate-in fade-in">
        <div className="w-14 h-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <UploadCloud className="w-7 h-7" />
        </div>
        <div>
          {isDemoMode && (
            <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider">
              MOD PRATONTON (DEMO MUAT NAIK)
            </span>
          )}
          <h2 className="text-xl font-black text-slate-900 uppercase">
            {isDemoMode ? 'AKTIFKAN SESI GURU DEMO' : 'LOG MASUK DIPERLUKAN'}
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed uppercase">
            {isDemoMode
              ? 'APLIKASI KINI BERJALAN DALAM MOD DEMO. KLIK BUTANG DI BAWAH UNTUK MASUK SECARA AUTOMATIK SEBAGAI GURU DEMO DAN MENGUJI FUNGSI MUAT NAIK BAHAN MMI.'
              : 'UNTUK MEMELIHARA INTEGRITI PERKONGSIAN KURIKULUM DAN HAK CIPTA BAHAN, SEMUA GURU DIKEHENDAKI LOG MASUK MELALUI AKAUN GOOGLE SEBELUM MEMUAT NAIK BAHAN MMI.'}
          </p>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-left text-xs text-slate-600 space-y-1.5 uppercase font-medium">
          <div className="font-bold text-slate-800 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{isDemoMode ? 'APA YANG ANDA BOLEH UJI DALAM MOD DEMO:' : 'KELEBIHAN MENGGUNAKAN AKAUN GOOGLE:'}</span>
          </div>
          <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-500">
            <li>BAHAN ANDA DITERBITKAN SERTA-MERTA TANPA PERLU MENUNGGU KELULUSAN ADMIN</li>
            <li>NAMA & EMEL ANDA DIREKODKAN SEBAGAI PENYUMBANG RASMI</li>
            <li>ANDA BOLEH MENGURUS, MENGEMASKINI, ATAU MEMADAM BAHAN ANDA PADA BILA-BILA MASA</li>
          </ul>
        </div>

        <button
          onClick={() => signInWithGoogle().catch((e) => setErrorMsg(e?.message || 'LOG MASUK GOOGLE DIBATALKAN ATAU DISEKAT PELAYAR.'))}
          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center space-x-2.5 uppercase tracking-wider cursor-pointer ${
            isDemoMode
              ? 'bg-teal-600 hover:bg-teal-700 text-white'
              : 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300'
          }`}
        >
          {isDemoMode ? <LogIn className="w-4 h-4" /> : <GoogleLogoIcon />}
          <span>{isDemoMode ? 'AKTIFKAN DEMO MUAT NAIK SEKARANG' : 'SIGN IN WITH GOOGLE'}</span>
        </button>
        {errorMsg && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-[11px] font-bold uppercase">
            {errorMsg}
          </div>
        )}
      </div>
    );
  }

  const gasRelayActive = isGasRelayConfigured();
  const activeResourceType: ResourceType = uploadMode === 'link' ? 'Pautan Luar' : resourceType;
  const targetDriveFolder = getTargetDriveFolder(activeResourceType, file);
  const maxFileBytes = gasRelayActive ? GAS_MAX_FILE_BYTES : 50 * 1024 * 1024;
  const maxFileLabel = gasRelayActive ? '25MB' : '50MB';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > maxFileBytes) {
        setErrorMsg(`SAIZ FAIL MELEBIHI HAD MAKSIMUM ${maxFileLabel}. SILA KURANGKAN SAIZ ATAU GUNAKAN PAUTAN GOOGLE DRIVE.`);
        return;
      }
      setFile(selectedFile);
      setErrorMsg('');
    }
  };

  const handleRemoveSelectedFile = () => {
    setFile(null);
    setErrorMsg('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessItem(null);

    if (title.trim().length < 3) {
      setErrorMsg('TAJUK BAHAN MESTILAH SEKURANG-KURANGNYA 3 AKSARA.');
      return;
    }

    if (description.trim().length < 5) {
      setErrorMsg('PENERANGAN BAHAN MESTILAH SEKURANG-KURANGNYA 5 AKSARA.');
      return;
    }

    if (uploadMode === 'file' && !file) {
      setErrorMsg('SILA PILIH FAIL PDF, WORD, SLAID, ATAU IMEJ UNTUK DIMUAT NAIK.');
      return;
    }

    if (uploadMode === 'link') {
      if (!externalUrl.trim()) {
        setErrorMsg('SILA MASUKKAN PAUTAN URL BAHAN YANG SAH.');
        return;
      }
      if (!externalUrl.startsWith('http://') && !externalUrl.startsWith('https://')) {
        setErrorMsg('PAUTAN URL MESTILAH BERMULA DENGAN HTTPS:// ATAU HTTP://');
        return;
      }
    }

    try {
      setLoading(true);
      const chosenSubject = subjects.find(s => s.id === subjectId);

      const created = await uploadResource({
        title: title.trim(),
        description: description.trim(),
        subjectId,
        subjectName: chosenSubject?.name || 'Lain-lain',
        form,
        category,
        resourceType: activeResourceType,
        externalUrl: uploadMode === 'link' ? externalUrl.trim() : '',
        ownerUid: currentUser.uid,
        ownerName: userProfile?.name || currentUser.displayName || 'Guru MMI',
        ownerEmail: currentUser.email || 'guru@moe-dl.edu.my',
      }, file, (pct) => setProgress(pct));

      setSuccessItem(created);
      setTitle('');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setExternalUrl('');
      setProgress(0);
      onUploadSuccess(created);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ralat berlaku semasa muat naik.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-10 animate-in fade-in duration-200">
      {/* Title */}
      <div className="mb-5 pb-3 border-b border-slate-100">
        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 uppercase">UPLOAD BAHAN INSTRUKSIONAL (MMI)</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase font-normal">
          BAHAN YANG DIMUAT NAIK AKAN TERUS DITERBITKAN KE DALAM KATALOG UNTUK KEGUNAAN WARGA GURU DI SELURUH MALAYSIA.
        </p>
      </div>

      {isDemoMode ? (
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-[11px] flex items-center space-x-2 uppercase font-bold">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            MOD DEMO AKTIF: BORANG MUAT NAIK SUDAH SEDIA DIGUNAKAN. BAHAN UJIAN ANDA AKAN DISIMPAN DALAM CACHE PELAYAR INI.
          </span>
        </div>
      ) : gasRelayActive ? (
        <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-[11px] flex items-center space-x-2 uppercase font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            SIMPANAN DRIVE SEKOLAH AKTIF: FAIL (MAKS. 25MB) DAN PAUTAN AKAN DISIMPAN TERUS KE GOOGLE DRIVE SEKOLAH TANPA SEBARANG PENGESAHAN GOOGLE DRIVE.
          </span>
        </div>
      ) : (
        <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start space-x-2.5 text-slate-700 text-[11px] uppercase font-bold">
          <HardDrive className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
          <span>
            PENGESAHAN GOOGLE DRIVE TELAH DIMATIKAN UNTUK KEMUDAHAN GURU. PILIH "PAUTAN LUAR (URL)" UNTUK TERBIT SERTA-MERTA, ATAU LENGKAPKAN URL APPS SCRIPT (VITE_GAS_WEBHOOK_URL) DI SECRETS SUPAYA FAIL FIZIKAL MASUK TERUS KE 4 FOLDER DRIVE SEKOLAH.
          </span>
        </div>
      )}

      {/* Error state */}
      {errorMsg && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2 uppercase font-bold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success state */}
      {successItem && (
        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 uppercase font-bold">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-extrabold block">BAHAN BERJAYA DITERBITKAN!</span>
              <span className="text-[11px] text-emerald-700 font-medium">
                "{successItem.title}" KINI AKTIF DALAM KATALOG DAN MODUL BAHAN SAYA.
              </span>
            </div>
          </div>
          <button
            onClick={() => setSuccessItem(null)}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs transition uppercase tracking-wider"
          >
            MUAT NAIK LAGI
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
            TAJUK BAHAN MMI *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="CTH: MODUL RELIEF MMI BAB 2 SAINS TINGKATAN 3 - DAYA & GERAKAN"
            className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none uppercase"
          />
        </div>

        {/* Mata Pelajaran & Tingkatan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
              MATA PELAJARAN *
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white uppercase font-medium"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name.toUpperCase()} ({s.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
              TINGKATAN (SASARAN MURID) *
            </label>
            <select
              value={form}
              onChange={(e) => setForm(e.target.value as FormLevel)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white uppercase font-medium"
            >
              <option value="Tingkatan 1">TINGKATAN 1 (MENENGAH RENDAH)</option>
              <option value="Tingkatan 2">TINGKATAN 2 (MENENGAH RENDAH)</option>
              <option value="Tingkatan 3">TINGKATAN 3 (MENENGAH RENDAH)</option>
              <option value="Tingkatan 4">TINGKATAN 4 (MENENGAH ATAS)</option>
              <option value="Tingkatan 5">TINGKATAN 5 (PERSEDIAAN SPM)</option>
            </select>
          </div>
        </div>

        {/* Kategori & Cara Sumbangan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
              KATEGORI PENGGUNAAN *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ResourceCategory)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white uppercase font-medium"
            >
              <option value="bukan_digital">BUKAN DIGITAL (LEMBARAN CETAK / MODUL BERTULIS)</option>
              <option value="digital">DIGITAL (KUIZ INTERAKTIF / VIDEO / LAMAN PEMBELAJARAN)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
              KAEDAH FAIL / PAUTAN *
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition uppercase tracking-wider ${
                  uploadMode === 'file' 
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                FAIL DOKUMEN
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('link')}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl border transition uppercase tracking-wider ${
                  uploadMode === 'link' 
                    ? 'bg-teal-600 text-white border-teal-600 shadow-2xs' 
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                PAUTAN LUAR (URL)
              </button>
            </div>
          </div>
        </div>

        {/* File picker vs URL input */}
        {uploadMode === 'file' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                JENIS DOKUMEN *
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value as ResourceType)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white uppercase font-medium"
              >
                <option value="PDF">DOKUMEN PDF (.PDF)</option>
                <option value="DOCX">MICROSOFT WORD (.DOCX / .DOC)</option>
                <option value="PPTX">POWERPOINT PRESENTATION (.PPTX)</option>
                <option value="XLSX">MICROSOFT EXCEL (.XLSX)</option>
                <option value="Imej">IMEJ / INFOGRAFIK (.PNG / .JPG)</option>
                <option value="Video">VIDEO RINGKAS (.MP4)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                PILIH FAIL (HAD MAKS. {maxFileLabel}) *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                className="w-full text-[11px] text-slate-600 file:mr-2.5 file:py-1.5 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 cursor-pointer uppercase"
              />
              {file && (
                <div className="mt-2 p-2 bg-white border border-teal-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="text-[10px] text-teal-700 font-bold flex items-center space-x-1 uppercase min-w-0">
                    <FileCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">FAIL SEDIA: {file.name.toUpperCase()} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveSelectedFile}
                    className="inline-flex items-center space-x-1 px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-lg text-[10px] font-bold transition uppercase shrink-0 cursor-pointer"
                    title="BUANG FAIL YANG DIPILIH"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>BUANG FAIL</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
            <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
              PAUTAN URL (GOOGLE DRIVE, YOUTUBE, GOOGLE FORMS, QUIZIZZ, WORDWALL) *
            </label>
            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="HTTPS://DRIVE.GOOGLE.COM/FILE/... ATAU HTTPS://QUIZIZZ.COM/..."
                className="w-full pl-8 pr-3 py-2 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none bg-white"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block uppercase font-normal">
              PASTIKAN KEBENARAN GOOGLE DRIVE DITETAPKAN KEPADA "ANYONE WITH THE LINK CAN VIEW".
            </span>
          </div>
        )}

        {/* Description & Teacher Implementation Guide */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
            PENERANGAN / CADANGAN PENGGUNAAN GURU PENGGANTI (RELIEF TEACHER) *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="NYATAKAN ARAHAN PELAKSANAAN YANG JELAS UNTUK GURU PENGGANTI (CTH: MURID DIBERI 40 MINIT UNTUK MELENGKAPKAN LEMBARAN KERJA KENDIRI, DIIKUTI DENGAN PERBINCANGAN JAWAPAN RINGKAS)..."
            className="w-full px-3 py-2 text-xs font-normal border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none leading-relaxed"
          />
        </div>

        {/* Google Drive Target Folder Info */}
        <div className="p-3 bg-teal-50/70 border border-teal-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] uppercase">
          <div className="flex items-center space-x-2 text-teal-900 font-bold">
            <HardDrive className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>
              FOLDER SIMPANAN DRIVE: <strong className="text-teal-700">{targetDriveFolder.label}</strong>
            </span>
          </div>
          <a
            href={targetDriveFolder.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-extrabold text-teal-700 hover:text-teal-900 inline-flex items-center space-x-1 underline shrink-0"
          >
            <span>BUKA FOLDER DRIVE</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Contributor preview */}
        <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-center justify-between uppercase font-medium">
          <span>PENYUMBANG: <strong>{userProfile?.name || currentUser.displayName}</strong></span>
          <span className="text-[11px] text-teal-700 font-bold">{currentUser.email}</span>
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 text-right block uppercase font-bold">MEMPROSES MUAT NAIK... {progress}%</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs transition shadow-xs flex items-center justify-center space-x-2 uppercase tracking-wider"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{loading ? 'SEDANG MENERBITKAN BAHAN...' : 'TERBITKAN BAHAN MMI SEKARANG'}</span>
        </button>
      </form>
    </div>
  );
};
