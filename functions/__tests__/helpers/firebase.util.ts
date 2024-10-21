import * as admin from "firebase-admin";
import setupEmulators from "./setup-emulators";

export function firebaseInitializeAppIfNeeded(): void {
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: "demo-test",
    });
    setupEmulators();
    const firestore = admin.firestore();
    firestore.settings({
      projectId: "demo-test",
      host: "localhost",
      port: 9002,
    });
  }
}
