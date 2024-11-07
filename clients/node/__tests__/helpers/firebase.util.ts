import * as admin from "firebase-admin";

export function firebaseInitializeAppIfNeeded(): void {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: "demo-test",
    });
    const firestore = admin.firestore();
    firestore.settings({
      projectId: "demo-test",
      host: "localhost",
      port: 9002,
    });
  }
}
