import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

const rawApiKey = firebaseAppletConfig?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY;
const rawProjectId = firebaseAppletConfig?.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(
  rawApiKey &&
  rawProjectId &&
  !rawApiKey.includes('YourActualApiKey') &&
  rawProjectId !== 'your-project-id' &&
  rawProjectId !== 'remixed-project-id'
);

const firebaseConfig = {
  apiKey: rawApiKey,
  authDomain: firebaseAppletConfig?.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: rawProjectId,
  storageBucket: firebaseAppletConfig?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseAppletConfig?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseAppletConfig?.appId || import.meta.env.VITE_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = firebaseAppletConfig?.firestoreDatabaseId
      ? getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
      : getFirestore(app);
    storage = getStorage(app);

    // Validate connection to Firestore on startup
    const testConnection = async () => {
      if (!db) return;
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
      }
    };
    void testConnection();
  } catch (err) {
    console.warn('Firebase initialization error, fallback to preview mode:', err);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid ?? null,
      email: auth?.currentUser?.email ?? null,
      emailVerified: auth?.currentUser?.emailVerified ?? null,
      isAnonymous: auth?.currentUser?.isAnonymous ?? null,
      tenantId: auth?.currentUser?.tenantId ?? null,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export { app, auth, db, storage };
export const googleProvider = new GoogleAuthProvider();
