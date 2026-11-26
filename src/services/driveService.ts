import { ResourceType } from '../types';

export interface DriveFolderConfig {
  id: string;
  label: string;
  url: string;
}

export const DRIVE_FOLDERS: Record<'LINK' | 'PDF' | 'VIDEO' | 'OFFICE', DriveFolderConfig> = {
  LINK: {
    id: '1MhGN2_MYb2PHhnd043Z_EcNFoP7u-tVc',
    label: 'BAHAN LINK',
    url: 'https://drive.google.com/drive/folders/1MhGN2_MYb2PHhnd043Z_EcNFoP7u-tVc',
  },
  PDF: {
    id: '1Jk4N2prP84lc_Ju1PzJmxT7RXkLNct5-',
    label: 'BAHAN PDF MMI',
    url: 'https://drive.google.com/drive/folders/1Jk4N2prP84lc_Ju1PzJmxT7RXkLNct5-',
  },
  VIDEO: {
    id: '1dK4v9JcVoqbnkgQGahcd4do69bvn0lnt',
    label: 'BAHAN VIDEO MMI',
    url: 'https://drive.google.com/drive/folders/1dK4v9JcVoqbnkgQGahcd4do69bvn0lnt',
  },
  OFFICE: {
    id: '1RkCZ_SwA42ai-N8goMUYpbn-_pLtWhd0',
    label: 'BAHAN WORD,EXCEL MMI',
    url: 'https://drive.google.com/drive/folders/1RkCZ_SwA42ai-N8goMUYpbn-_pLtWhd0',
  },
};

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink: string;
  folderId: string;
  folderLabel: string;
}

export const GAS_MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB had praktikal payload Apps Script

export function getTargetDriveFolder(
  resourceType: ResourceType,
  file?: File | null
): DriveFolderConfig {
  if (resourceType === 'Pautan Luar') {
    return DRIVE_FOLDERS.LINK;
  }

  const fileNameLower = file?.name?.toLowerCase() || '';
  const mimeLower = file?.type?.toLowerCase() || '';

  if (
    resourceType === 'PDF' ||
    fileNameLower.endsWith('.pdf') ||
    mimeLower === 'application/pdf'
  ) {
    return DRIVE_FOLDERS.PDF;
  }

  if (resourceType === 'Video' || mimeLower.startsWith('video/')) {
    return DRIVE_FOLDERS.VIDEO;
  }

  return DRIVE_FOLDERS.OFFICE;
}

export function getGasWebhookUrl(): string {
  return (import.meta.env.VITE_GAS_WEBHOOK_URL || '').trim();
}

export function isGasRelayConfigured(): boolean {
  const url = getGasWebhookUrl();
  return Boolean(
    url &&
    url.startsWith('https://script.google.com/') &&
    !url.includes('AKfycb...')
  );
}

function fileToBase64(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.min(45, Math.round((e.loaded / e.total) * 45)));
      }
    };
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx !== -1 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('GAGAL MEMBACA FAIL UNTUK MUAT NAIK.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadFileViaGasRelay(
  file: File,
  resourceType: ResourceType,
  onProgress?: (percent: number) => void
): Promise<DriveUploadResult> {
  const webhookUrl = getGasWebhookUrl();
  if (!isGasRelayConfigured()) {
    throw new Error(
      'PINTU MUAT NAIK DRIVE SEKOLAH (VITE_GAS_WEBHOOK_URL) BELUM DIKONFIGURASI. SILA PASANG APPS SCRIPT SEKALI SAHAJA ATAU GUNA MOD PAUTAN LUAR (URL).'
    );
  }

  if (file.size > GAS_MAX_FILE_BYTES) {
    throw new Error(
      'SAIZ FAIL MELEBIHI HAD 25MB BAGI MUAT NAIK KE DRIVE SEKOLAH. SILA KECILKAN FAIL ATAU GUNA MOD PAUTAN LUAR (URL).'
    );
  }

  const base64 = await fileToBase64(file, onProgress);
  if (onProgress) onProgress(65);

  const res = await fetch(webhookUrl, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({
      action: 'upload_drive_file',
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      resourceType,
      fileBase64: base64,
    }),
  });

  if (!res.ok) {
    throw new Error(`RALAT PELAYAN DRIVE SEKOLAH (${res.status}). SILA CUBA LAGI.`);
  }

  const data = await res.json();
  if (data.status !== 'success' || !data.fileId) {
    throw new Error(data.message || 'MUAT NAIK KE GOOGLE DRIVE SEKOLAH GAGAL.');
  }

  if (onProgress) onProgress(100);
  const targetFolder = getTargetDriveFolder(resourceType, file);

  return {
    id: data.fileId,
    name: data.fileName || file.name,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.fileId}/view`,
    folderId: data.folderId || targetFolder.id,
    folderLabel: data.folderLabel || targetFolder.label,
  };
}

export async function saveLinkViaGasRelay(
  params: {
    title: string;
    subjectName: string;
    form: string;
    externalUrl: string;
    description: string;
    ownerName: string;
    ownerEmail: string;
  },
  onProgress?: (percent: number) => void
): Promise<DriveUploadResult | null> {
  const webhookUrl = getGasWebhookUrl();
  if (!isGasRelayConfigured()) return null;

  if (onProgress) onProgress(40);
  const res = await fetch(webhookUrl, {
    method: 'POST',
    redirect: 'follow',
    body: JSON.stringify({
      action: 'upload_link_backup',
      ...params,
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'success' || !data.fileId) return null;

  if (onProgress) onProgress(100);
  return {
    id: data.fileId,
    name: data.fileName || params.title,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.fileId}/view`,
    folderId: data.folderId || DRIVE_FOLDERS.LINK.id,
    folderLabel: data.folderLabel || DRIVE_FOLDERS.LINK.label,
  };
}
