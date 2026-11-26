import React from 'react';
import { 
  FileText, 
  ExternalLink, 
  Download, 
  Trash2, 
  Globe2, 
  Book, 
  Eye,
  FileSpreadsheet,
  FileCheck,
  Video,
  Image as ImageIcon
} from 'lucide-react';
import { ResourceItem } from '../types';

interface ResourceCardProps {
  item: ResourceItem;
  onPreview: (item: ResourceItem) => void;
  onDownload: (item: ResourceItem) => void;
  onDelete?: (item: ResourceItem) => void;
  canManage?: boolean;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  item,
  onPreview,
  onDownload,
  onDelete,
  canManage = false
}) => {
  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'PDF': return <FileText className="w-4 h-4 text-rose-600" />;
      case 'DOCX': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'PPTX': return <FileCheck className="w-4 h-4 text-orange-600" />;
      case 'XLSX': return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case 'Video': return <Video className="w-4 h-4 text-purple-600" />;
      case 'Imej': return <ImageIcon className="w-4 h-4 text-amber-600" />;
      default: return <ExternalLink className="w-4 h-4 text-teal-600" />;
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative">
      {item.isDemo && (
        <span className="absolute top-3.5 right-3.5 z-10 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800 rounded border border-amber-300">
          DEMO
        </span>
      )}

      <div className="p-5">
        {/* Top metadata row with clean typographic separators (Zero-Pill discipline) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mb-2 uppercase font-bold">
          <span className="font-bold text-teal-700 flex items-center space-x-1">
            {getFormatIcon(item.resourceType)}
            <span className="ml-0.5">{item.resourceType}</span>
          </span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-bold text-slate-800">{item.form}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center space-x-1">
            {item.category === 'digital' ? (
              <span className="text-teal-600 flex items-center space-x-0.5">
                <Globe2 className="w-3 h-3 inline mr-0.5" />DIGITAL
              </span>
            ) : (
              <span className="text-slate-600 flex items-center space-x-0.5">
                <Book className="w-3 h-3 inline mr-0.5" />BUKAN DIGITAL
              </span>
            )}
          </span>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onPreview(item)}
          className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-700 transition cursor-pointer line-clamp-2 leading-snug mb-1 uppercase"
          title={item.title}
        >
          {item.title}
        </h3>

        {/* Subject kicker */}
        <div className="text-[11px] font-bold text-teal-700 mb-1.5 uppercase">
          {item.subjectName}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3 font-normal">
          {item.description}
        </p>

        {/* Contributor & Date Footer */}
        <div className="pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between uppercase font-medium">
          <div className="truncate max-w-[160px]" title={item.ownerName}>
            <span className="text-slate-400 font-bold">OLEH: </span>
            <span className="font-bold text-slate-700">{item.ownerName}</span>
          </div>
          <span className="text-slate-400 font-normal">{formattedDate}</span>
        </div>
      </div>

      {/* Action footer */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          onClick={() => onPreview(item)}
          className="font-bold text-slate-700 hover:text-teal-700 inline-flex items-center space-x-1.5 transition uppercase tracking-wider text-[11px]"
        >
          <Eye className="w-3 h-3 text-slate-500" />
          <span>PRATONTON</span>
        </button>

        <div className="flex items-center space-x-1.5">
          {(canManage || Boolean(onDelete)) && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-lg font-bold transition uppercase tracking-wider text-[10px] cursor-pointer"
              title="PADAM REKOD BAHAN INI"
            >
              <Trash2 className="w-3 h-3" />
              <span>PADAM</span>
            </button>
          )}

          <button
            onClick={() => onDownload(item)}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold transition shadow-2xs uppercase tracking-wider text-[10px]"
          >
            {item.externalUrl ? (
              <>
                <ExternalLink className="w-3 h-3" />
                <span>BUKA LINK</span>
              </>
            ) : (
              <>
                <Download className="w-3 h-3" />
                <span>MUAT TURUN ({item.downloadCount || 0})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
