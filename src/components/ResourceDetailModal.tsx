import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Share2, 
  Check, 
  Info,
  Clock,
  Layers,
  Sparkles,
  Trash2
} from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourceDetailModalProps {
  item: ResourceItem | null;
  onClose: () => void;
  onDownload: (item: ResourceItem) => void;
  canDelete?: boolean;
  onDelete?: (item: ResourceItem) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  item,
  onClose,
  onDownload,
  canDelete = false,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const handleCopyShare = () => {
    const textToCopy = `${item.title} (${item.subjectName} - ${item.form})\nBahan MMI Edu_Share HUB\n${item.externalUrl || window.location.href}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50/60">
          <div>
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-1">
              <span>{item.subjectName}</span>
              <span>·</span>
              <span>{item.form}</span>
              {item.isDemo && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[9px] font-black uppercase">
                  DEMO DATA
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug uppercase">
              {item.title}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-600">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-slate-700 uppercase">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">KATEGORI</span>
              <span className="font-bold text-slate-800 text-xs">
                {item.category === 'digital' ? 'DIGITAL (ONLINE)' : 'BUKAN DIGITAL'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">JENIS FAIL</span>
              <span className="font-bold text-slate-800 text-xs">{item.resourceType}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">MUAT TURUN</span>
              <span className="font-bold text-teal-700 text-xs">{item.downloadCount || 0} KALI</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">STATUS</span>
              <span className="font-bold text-emerald-700 text-xs">TERSEDIA</span>
            </div>
          </div>

          {/* Teacher Implementation Guide */}
          <div>
            <div className="flex items-center space-x-1.5 text-slate-800 font-bold mb-1 text-xs uppercase tracking-wide">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              <span>PANDUAN PELAKSANAAN GURU PENGGANTI (RELIEF TEACHER)</span>
            </div>
            <div className="p-3.5 bg-teal-50/50 border border-teal-100 rounded-xl text-slate-700 leading-relaxed whitespace-pre-line uppercase font-normal text-xs">
              {item.description}
            </div>
          </div>

          {/* External Link Alert if applicable */}
          {item.externalUrl && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between uppercase">
              <div className="truncate mr-2.5">
                <span className="text-[10px] font-bold text-slate-400 block">PAUTAN URL BAHAN:</span>
                <span className="text-xs text-teal-700 font-semibold truncate block lowercase">{item.externalUrl}</span>
              </div>
              <a
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-[11px] font-bold inline-flex items-center space-x-1 flex-shrink-0 uppercase tracking-wider"
              >
                <span>BUKA</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* File Meta */}
          {item.fileName && (
            <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-200/60 uppercase">
              <div className="flex items-center space-x-2 truncate">
                <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="font-semibold text-slate-800 truncate text-xs">{item.fileName}</span>
              </div>
              {item.fileSizeBytes ? (
                <span className="text-slate-400 text-[10px] flex-shrink-0 font-medium">
                  {(item.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB
                </span>
              ) : null}
            </div>
          )}

          {/* Owner details */}
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 uppercase font-medium">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 text-slate-400" />
              <span>DISUMBANG OLEH: <strong className="text-slate-700 font-bold">{item.ownerName}</strong> ({item.ownerEmail})</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400 font-normal">
              <Clock className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 uppercase">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyShare}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition uppercase tracking-wider cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'DISALIN KE CLIPBOARD' : 'KONGSI INFO'}</span>
            </button>

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={() => {
                  const target = item;
                  onClose();
                  onDelete(target);
                }}
                className="inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 rounded-xl transition uppercase tracking-wider cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>PADAM BAHAN</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition uppercase tracking-wider cursor-pointer"
            >
              TUTUP
            </button>
            <button
              onClick={() => {
                onDownload(item);
                onClose();
              }}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition uppercase tracking-wider"
            >
              {item.externalUrl ? (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>AKSES PAUTAN SUMBER</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>MUAT TURUN FAIL</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
