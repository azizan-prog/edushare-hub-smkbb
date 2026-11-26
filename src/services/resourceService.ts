import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { 
  auth, 
  db, 
  storage, 
  isFirebaseConfigured, 
  OperationType, 
  handleFirestoreError 
} from '../firebase/firebaseConfig';
import { ResourceItem, SubjectItem } from '../types';
import { 
  isGasRelayConfigured,
  getGasWebhookUrl,
  uploadFileViaGasRelay,
  saveLinkViaGasRelay
} from './driveService';

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  { id: 'bm', name: 'Bahasa Melayu', code: 'BM', active: true },
  { id: 'bi', name: 'Bahasa Inggeris', code: 'BI', active: true },
  { id: 'mat', name: 'Matematik', code: 'MAT', active: true },
  { id: 'sn', name: 'Sains', code: 'SN', active: true },
  { id: 'sej', name: 'Sejarah', code: 'SEJ', active: true },
  { id: 'geo', name: 'Geografi', code: 'GEO', active: true },
  { id: 'pi', name: 'Pendidikan Islam', code: 'PI', active: true },
  { id: 'pm', name: 'Pendidikan Moral', code: 'PM', active: true },
  { id: 'rbt', name: 'Reka Bentuk & Teknologi (RBT)', code: 'RBT', active: true },
  { id: 'ask', name: 'Asas Sains Komputer (ASK)', code: 'ASK', active: true },
  { id: 'psv', name: 'Pendidikan Seni Visual (PSV)', code: 'PSV', active: true },
  { id: 'pjpk', name: 'Pendidikan Jasmani & Kesihatan (PJPK)', code: 'PJPK', active: true },
  { id: 'fiz', name: 'Fizik', code: 'FIZ', active: true },
  { id: 'kim', name: 'Kimia', code: 'KIM', active: true },
  { id: 'bio', name: 'Biologi', code: 'BIO', active: true },
  { id: 'addmat', name: 'Matematik Tambahan', code: 'MT', active: true },
  { id: 'prinsip-akaun', name: 'Prinsip Perakaunan', code: 'PA', active: true },
  { id: 'perniagaan', name: 'Perniagaan', code: 'PNG', active: true },
  { id: 'ekonomi', name: 'Ekonomi', code: 'EKO', active: true }
];

export const INITIAL_DEMO_RESOURCES: ResourceItem[] = [
  {
    id: 'demo-res-1',
    title: 'Modul MMI Kendiri: Tatabahasa & Sintaksis (Ayat Majmuk Gabungan)',
    description: 'Bahan cetak latihan pengukuhan tatabahasa untuk kelas relief Tingkatan 1 & 2 semasa ketiadaan guru matapelajaran. Dilengkapi skema jawapan ringkas di bahagian belakang.',
    subjectId: 'bm',
    subjectName: 'Bahasa Melayu',
    form: 'Tingkatan 2',
    category: 'bukan_digital',
    resourceType: 'PDF',
    fileName: 'MMI_BM_T2_Sintaksis_AyatMajmuk.pdf',
    fileSizeBytes: 2450000,
    ownerUid: 'demo-guru-101',
    ownerName: 'Cikgu Noraini binti Ahmad',
    ownerEmail: 'noraini.ahmad@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    status: 'published',
    downloadCount: 142,
    isDemo: true
  },
  {
    id: 'demo-res-2',
    title: 'Kuiz Interaktif Form 4: Trigonometry & Circle Measures Challenge',
    description: 'Set kuiz Quizizz berpandu 20 soalan aplikasi KBAT Trigonometri Tingkatan 4. Murid boleh menjawab menggunakan peranti sendiri di makmal atau perpustakaan.',
    subjectId: 'mat',
    subjectName: 'Matematik',
    form: 'Tingkatan 4',
    category: 'digital',
    resourceType: 'Pautan Luar',
    externalUrl: 'https://quizizz.com/join?gc=892341',
    ownerUid: 'demo-guru-102',
    ownerName: 'Cikgu Tan Wei Loon',
    ownerEmail: 'tanwl@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now() - 86400000 * 4,
    status: 'published',
    downloadCount: 215,
    isDemo: true
  },
  {
    id: 'demo-res-3',
    title: 'Video Pembelajaran MMI: Bab 3 Nutrisi & Sistem Pencernaan Manusia',
    description: 'Pautan video animasi interaktif Kementerian Pendidikan Malaysia berserta lembaran grafik untuk diisi oleh pelajar semasa 2 waktu masa ganti.',
    subjectId: 'sn',
    subjectName: 'Sains',
    form: 'Tingkatan 2',
    category: 'digital',
    resourceType: 'Video',
    externalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    ownerUid: 'demo-guru-103',
    ownerName: 'Ustaz Muhammad Fakhrul',
    ownerEmail: 'fakhrul.razi@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 6,
    updatedAt: Date.now() - 86400000 * 6,
    status: 'published',
    downloadCount: 178,
    isDemo: true
  },
  {
    id: 'demo-res-4',
    title: 'Lembaran Kerja MMI: Garis Masa Pendudukan Jepun di Tanah Melayu',
    description: 'Aktiviti menganalisis dokumen dan membina carta garis masa Sejarah Tingkatan 3. Sesuai untuk diserahkan kepada guru ganti untuk diagihkan kepada kelas.',
    subjectId: 'sej',
    subjectName: 'Sejarah',
    form: 'Tingkatan 3',
    category: 'bukan_digital',
    resourceType: 'DOCX',
    fileName: 'Sejarah_T3_MMI_GarisMasaJepun.docx',
    fileSizeBytes: 1850000,
    ownerUid: 'demo-guru-104',
    ownerName: 'Cikgu Kamala Devi',
    ownerEmail: 'kamaladevi@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 8,
    updatedAt: Date.now() - 86400000 * 8,
    status: 'published',
    downloadCount: 94,
    isDemo: true
  },
  {
    id: 'demo-res-5',
    title: 'English Reading Comprehension & Vocabulary Drill: Climate Actions',
    description: 'Form 5 CEFR-aligned reading text with multi-choice and short answer questions. Ideal for independent self-access learning during unexpected teacher leave.',
    subjectId: 'bi',
    subjectName: 'Bahasa Inggeris',
    form: 'Tingkatan 5',
    category: 'bukan_digital',
    resourceType: 'PDF',
    fileName: 'Form5_CEFR_ReadingDrill_Climate.pdf',
    fileSizeBytes: 3120000,
    ownerUid: 'demo-guru-101',
    ownerName: 'Cikgu Azizan Hisham',
    ownerEmail: 'azizanhisham@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 10,
    status: 'published',
    downloadCount: 304,
    isDemo: true
  },
  {
    id: 'demo-res-6',
    title: 'Simulasi Interaktif RBT: Sistem Pengaturcaraan Mikropengawal Arduino',
    description: 'Pautan projek Tinkercad Circuits untuk murid Tingkatan 3 bereksperimen dengan litar LED dan sensor secara maya tanpa peralatan fizikal.',
    subjectId: 'rbt',
    subjectName: 'Reka Bentuk & Teknologi (RBT)',
    form: 'Tingkatan 3',
    category: 'digital',
    resourceType: 'Pautan Luar',
    externalUrl: 'https://www.tinkercad.com/circuits',
    ownerUid: 'demo-guru-105',
    ownerName: 'Cikgu Hafizuddin bin Ramli',
    ownerEmail: 'hafizuddin@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now() - 86400000 * 12,
    status: 'published',
    downloadCount: 160,
    isDemo: true
  },
  {
    id: 'demo-res-7',
    title: 'Modul Intensif Bab 1 Geografi: Bentuk Muka Bumi & Saliran Malaysia',
    description: 'Lembaran peta buta dan soalan struktur bagi Tingkatan 1. Sangat berguna apabila kelas berada dalam pengawasan guru relief.',
    subjectId: 'geo',
    subjectName: 'Geografi',
    form: 'Tingkatan 1',
    category: 'bukan_digital',
    resourceType: 'PDF',
    fileName: 'Geo_T1_PetaButaSaliran.pdf',
    fileSizeBytes: 4200000,
    ownerUid: 'demo-guru-104',
    ownerName: 'Cikgu Kamala Devi',
    ownerEmail: 'kamaladevi@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 15,
    status: 'published',
    downloadCount: 88,
    isDemo: true
  },
  {
    id: 'demo-res-8',
    title: 'Ujian Google Forms MMI: Tajuk Fiqh Bersuci & Solat Berjemaah',
    description: 'Google Forms yang menyemak sendiri (auto-grading) untuk murid Tingkatan 1 menyiapkan latihan kendiri.',
    subjectId: 'pi',
    subjectName: 'Pendidikan Islam',
    form: 'Tingkatan 1',
    category: 'digital',
    resourceType: 'Pautan Luar',
    externalUrl: 'https://docs.google.com/forms',
    ownerUid: 'demo-guru-103',
    ownerName: 'Ustaz Muhammad Fakhrul',
    ownerEmail: 'fakhrul.razi@moe-dl.edu.my',
    createdAt: Date.now() - 86400000 * 18,
    updatedAt: Date.now() - 86400000 * 18,
    status: 'published',
    downloadCount: 132,
    isDemo: true
  }
];

const LOCAL_STORAGE_RESOURCES_KEY = 'emmi_resources_local_cache';
const LOCAL_STORAGE_SUBJECTS_KEY = 'emmi_subjects_local_cache';
const LOCAL_STORAGE_LIVE_CACHE_KEY = 'emmi_live_offline_cache';

// Helper to sync metadata log with Google Apps Script Webhook (Google Sheets)
const syncToGoogleAppsScript = async (resource: ResourceItem) => {
  if (!isGasRelayConfigured()) return;
  const webhookUrl = getGasWebhookUrl();

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'log_sheet',
        ...resource
      })
    });
  } catch (err) {
    console.warn('Google Apps Script sync failed:', err);
  }
};

export const getSubjectsList = async (): Promise<SubjectItem[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDocs(collection(db, 'subjects'));
      const firestoreSubjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as SubjectItem));
      if (firestoreSubjects.length > 0) {
        // Merge default curriculum subjects with custom subjects from Firestore
        const mergedMap = new Map<string, SubjectItem>();
        DEFAULT_SUBJECTS.forEach(s => mergedMap.set(s.id, s));
        firestoreSubjects.forEach(s => mergedMap.set(s.id, s));
        return Array.from(mergedMap.values());
      }
      return DEFAULT_SUBJECTS;
    } catch (err) {
      console.warn('Could not fetch subjects from Firestore, using default fallback:', err);
      return DEFAULT_SUBJECTS;
    }
  }

  // Local storage fallback for customized subjects in Demo Mode
  const cached = localStorage.getItem(LOCAL_STORAGE_SUBJECTS_KEY);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // ignore
    }
  }
  return DEFAULT_SUBJECTS;
};

export const addCustomSubject = async (name: string, code: string): Promise<SubjectItem> => {
  const cleanId = code.toLowerCase().replace(/[^a-z0-9_-]/g, '') || `sub_${Date.now()}`;
  const newSubject: SubjectItem = {
    id: cleanId.slice(0, 64),
    name: name.trim().slice(0, 120),
    code: code.trim().toUpperCase().slice(0, 20),
    active: true
  };

  if (isFirebaseConfigured && db) {
    const subjectPath = `subjects/${newSubject.id}`;
    try {
      await setDoc(doc(db, 'subjects', newSubject.id), newSubject);
      return newSubject;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, subjectPath);
    }
  }

  const current = await getSubjectsList();
  const updated = [...current, newSubject];
  localStorage.setItem(LOCAL_STORAGE_SUBJECTS_KEY, JSON.stringify(updated));
  return newSubject;
};

export const fetchAllResources = async (): Promise<ResourceItem[]> => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'resources'),
        where('status', '==', 'published')
      );
      const snap = await getDocs(q);
      const liveList = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as ResourceItem))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      try {
        localStorage.setItem(LOCAL_STORAGE_LIVE_CACHE_KEY, JSON.stringify(liveList));
      } catch {
        // ignore quota errors on offline cache
      }
      return liveList;
    } catch (err: any) {
      // If offline, serve cached real resources from last online session
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const offlineCached = localStorage.getItem(LOCAL_STORAGE_LIVE_CACHE_KEY);
        if (offlineCached) {
          try {
            return JSON.parse(offlineCached);
          } catch {
            // ignore
          }
        }
        return [];
      }
      handleFirestoreError(err, OperationType.LIST, 'resources');
    }
  }

  // Local storage or initial demo data (Demo Mode only)
  const cached = localStorage.getItem(LOCAL_STORAGE_RESOURCES_KEY);
  if (cached) {
    try {
      const parsed: ResourceItem[] = JSON.parse(cached);
      return parsed;
    } catch {
      // ignore
    }
  }

  localStorage.setItem(LOCAL_STORAGE_RESOURCES_KEY, JSON.stringify(INITIAL_DEMO_RESOURCES));
  return INITIAL_DEMO_RESOURCES;
};

export const uploadResource = async (
  item: Omit<ResourceItem, 'id' | 'createdAt' | 'updatedAt' | 'downloadCount' | 'status'>,
  file: File | null,
  onProgress?: (percent: number) => void
): Promise<ResourceItem> => {
  let downloadUrl = '';
  let storagePath = '';
  const fileSizeBytes = file ? Math.floor(file.size) : 0;

  if (isFirebaseConfigured && db) {
    const useGasRelay = isGasRelayConfigured();

    if (file) {
      if (!useGasRelay) {
        throw new Error(
          'PINTU MUAT NAIK DRIVE SEKOLAH (VITE_GAS_WEBHOOK_URL) BELUM DIKONFIGURASI. SILA PASANG APPS SCRIPT SEKALI SAHAJA ATAU GUNA MOD PAUTAN LUAR (URL).'
        );
      }
      const gasRes = await uploadFileViaGasRelay(file, item.resourceType, onProgress);
      downloadUrl = gasRes.webViewLink;
      storagePath = `gdrive:${gasRes.id}`;
    } else if (item.externalUrl && useGasRelay) {
      try {
        const linkRelayRes = await saveLinkViaGasRelay(
          {
            title: item.title,
            subjectName: item.subjectName,
            form: item.form,
            externalUrl: item.externalUrl,
            description: item.description,
            ownerName: item.ownerName,
            ownerEmail: item.ownerEmail,
          },
          onProgress
        );
        if (linkRelayRes) {
          storagePath = `gdrive:${linkRelayRes.id}`;
        }
      } catch (relayLinkErr) {
        console.warn('Google Drive link backup via GAS skipped:', relayLinkErr);
      }
    }

    const now = Date.now();
    const payload: Omit<ResourceItem, 'id'> = {
      title: (item.title || '').trim().slice(0, 250),
      description: (item.description || '').trim().slice(0, 3000),
      subjectId: (item.subjectId || '').slice(0, 64),
      subjectName: (item.subjectName || '').slice(0, 120),
      form: item.form,
      category: item.category,
      resourceType: item.resourceType,
      fileUrl: (downloadUrl || item.fileUrl || '').slice(0, 2000),
      storagePath: (storagePath || '').slice(0, 500),
      fileName: (file ? file.name : (item.fileName || '')).slice(0, 260),
      externalUrl: (item.externalUrl || '').slice(0, 2000),
      fileSizeBytes,
      ownerUid: item.ownerUid,
      ownerName: (item.ownerName || 'Guru MMI').slice(0, 150),
      ownerEmail: (item.ownerEmail || '').slice(0, 200),
      status: 'published',
      downloadCount: 0,
      createdAt: now,
      updatedAt: now
    };

    try {
      const docRef = await addDoc(collection(db, 'resources'), payload);
      const createdItem: ResourceItem = { id: docRef.id, ...payload };

      // Sync to GAS if configured
      syncToGoogleAppsScript(createdItem);
      return createdItem;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'resources');
    }
  }

  // Demo / Offline Mode upload
  if (onProgress) {
    for (let p = 10; p <= 100; p += 25) {
      onProgress(p);
      await new Promise(r => setTimeout(r, 60));
    }
  }

  let localFileUrl = '';
  if (file) {
    try {
      localFileUrl = URL.createObjectURL(file);
    } catch {
      localFileUrl = '#';
    }
  }

  const newResource: ResourceItem = {
    ...item,
    id: `local_mmi_${Date.now()}`,
    fileUrl: localFileUrl || item.fileUrl || '',
    storagePath: '',
    fileName: file ? file.name : (item.fileName || ''),
    fileSizeBytes,
    status: 'published',
    downloadCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isDemo: true
  };

  const currentList = await fetchAllResources();
  const updatedList = [newResource, ...currentList];
  localStorage.setItem(LOCAL_STORAGE_RESOURCES_KEY, JSON.stringify(updatedList));

  // Sync to GAS if configured
  syncToGoogleAppsScript(newResource);

  return newResource;
};

export const incrementDownloadCounter = async (resourceId: string, isDemo?: boolean): Promise<number> => {
  if (!isDemo && isFirebaseConfigured && db) {
    const resourcePath = `resources/${resourceId}`;
    try {
      const resRef = doc(db, 'resources', resourceId);
      await updateDoc(resRef, { downloadCount: increment(1) });

      const downloadPayload: { resourceId: string; downloadedAt: number; uid?: string } = {
        resourceId,
        downloadedAt: Date.now()
      };
      if (auth?.currentUser?.uid) {
        downloadPayload.uid = auth.currentUser.uid;
      }
      await addDoc(collection(db, 'downloads'), downloadPayload);
      return 1;
    } catch (err) {
      console.warn(`Increment download counter failed at ${resourcePath}:`, err);
      return 0;
    }
  }

  // Update in local cache (Demo Mode)
  const cached = localStorage.getItem(LOCAL_STORAGE_RESOURCES_KEY);
  if (cached) {
    try {
      const list: ResourceItem[] = JSON.parse(cached);
      const index = list.findIndex(r => r.id === resourceId);
      if (index !== -1) {
        list[index].downloadCount = (list[index].downloadCount || 0) + 1;
        localStorage.setItem(LOCAL_STORAGE_RESOURCES_KEY, JSON.stringify(list));
        return list[index].downloadCount;
      }
    } catch {
      // ignore
    }
  }
  return 1;
};

export const deleteResource = async (resource: ResourceItem): Promise<void> => {
  if (isFirebaseConfigured && db && !resource.isDemo) {
    if (resource.storagePath && !resource.storagePath.startsWith('gdrive:') && storage) {
      try {
        const fileRef = ref(storage, resource.storagePath);
        await deleteObject(fileRef);
      } catch (e) {
        console.warn('Storage file deletion note:', e);
      }
    }
    const resourcePath = `resources/${resource.id}`;
    try {
      await deleteDoc(doc(db, 'resources', resource.id));
      return;
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, resourcePath);
    }
  }

  // Remove from local cache (Demo Mode)
  const cached = localStorage.getItem(LOCAL_STORAGE_RESOURCES_KEY);
  if (cached) {
    try {
      const list: ResourceItem[] = JSON.parse(cached);
      const updated = list.filter(r => r.id !== resource.id);
      localStorage.setItem(LOCAL_STORAGE_RESOURCES_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
};
