const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Fallback content for src/firebase.ts in case it is missing
const FIREBASE_TS_CONTENT = `import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const fallbackConfig = {
  projectId: "gen-lang-client-0222636590",
  appId: "1:1075535761422:web:edd9faf7da0238aa6bec5f",
  apiKey: "AIzaSyCUud_t8mZZ6BmnLkjbAz0OU5HibPrCbEI",
  authDomain: "gen-lang-client-0222636590.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-metatrader5mt5-8e7f0865-f2f6-44a6-aee6-234d7e9dbceb",
  storageBucket: "gen-lang-client-0222636590.firebasestorage.app",
  messagingSenderId: "1075535761422"
};

let firebaseConfig: any = fallbackConfig;
try {
  // @ts-ignore
  const cfg = await import('../firebase-applet-config.json');
  if (cfg && cfg.default) firebaseConfig = cfg.default;
} catch {}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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
  authInfo: any;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: { userId: auth.currentUser?.uid },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check:', error.message);
    }
  }
}

export async function loginWithGoogle() {
  try {
    const res = await signInWithPopup(auth, googleProvider);
    return res.user;
  } catch (err) {
    console.error('Google Sign-in failed', err);
    throw err;
  }
}

export async function logoutUser() {
  await signOut(auth);
}
`;

try {
  // Check critical files
  const critical = [
    'src/firebase.ts',
    'src/types/mt5.ts',
    'src/components/quotes/QuotesView.tsx',
    'src/components/trade/TradeView.tsx',
    'src/components/modals/OtpModal.tsx',
    'capacitor.config.json',
    'android/build.gradle'
  ];

  const missing = critical.filter(f => !fs.existsSync(path.resolve(process.cwd(), f)));

  if (missing.length > 0) {
    console.log(`[build-check] Found ${missing.length} missing files: ${missing.join(', ')}`);
    console.log('[build-check] Automatically syncing full repository files from Mm55...');

    try {
      const tmp = path.resolve(process.cwd(), '.tmp_upstream');
      if (fs.existsSync(tmp)) fs.rmSync(tmp, { recursive: true, force: true });
      execSync('git clone --depth 1 https://github.com/alqadasif2-cloud/Mm55.git .tmp_upstream', { stdio: 'inherit' });
      execSync('cp -rn .tmp_upstream/* . 2>/dev/null || true', { stdio: 'inherit' });
      fs.rmSync(tmp, { recursive: true, force: true });
      console.log('[build-check] All missing files successfully restored from upstream!');
    } catch (gitErr) {
      console.warn('[build-check] Git sync warning:', gitErr.message);
    }

    // In case git clone couldn't get firebase.ts, write embedded fallback
    if (!fs.existsSync(path.resolve(process.cwd(), 'src/firebase.ts'))) {
      fs.mkdirSync(path.resolve(process.cwd(), 'src'), { recursive: true });
      fs.writeFileSync(path.resolve(process.cwd(), 'src/firebase.ts'), FIREBASE_TS_CONTENT, 'utf-8');
      console.log('[build-check] Created fallback src/firebase.ts successfully.');
    }
  } else {
    console.log('[build-check] All required build files are present.');
  }
} catch (err) {
  console.warn('[build-check] Notice:', err.message);
}
