export type FormLevel = 'Tingkatan 1' | 'Tingkatan 2' | 'Tingkatan 3' | 'Tingkatan 4' | 'Tingkatan 5';

export type ResourceCategory = 'digital' | 'bukan_digital';

export type ResourceType = 'PDF' | 'DOCX' | 'PPTX' | 'XLSX' | 'Imej' | 'Video' | 'Pautan Luar';

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  form: FormLevel;
  category: ResourceCategory;
  resourceType: ResourceType;
  fileName?: string;
  fileUrl?: string;
  storagePath?: string;
  externalUrl?: string;
  fileSizeBytes?: number;
  ownerUid: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: number;
  updatedAt: number;
  status: 'published' | 'archived';
  downloadCount: number;
  isDemo?: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  createdAt: number;
}

export interface DownloadRecord {
  id?: string;
  resourceId: string;
  uid?: string;
  downloadedAt: number;
}

export interface FilterState {
  searchQuery: string;
  subjectId: string;
  form: string;
  category: string;
  resourceType: string;
}
