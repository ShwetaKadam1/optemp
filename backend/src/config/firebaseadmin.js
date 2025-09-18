import admin from "firebase-admin";

let initialized = false;
export const initFirebase = () => {
  if (initialized) return;
  if (!admin.apps.length) {
    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (raw) {
      admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
    } else if (path) {
      admin.initializeApp({ credential: admin.credential.cert(path) });
    } else {
      throw new Error("Firebase Admin credentials not set");
    }
  }
  initialized = true;
};

export default admin;
