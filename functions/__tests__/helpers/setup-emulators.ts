export default function setupEmulators(): void {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:9002";
  process.env.FIREBASE_FIRESTORE_EMULATOR_ADDRESS = "127.0.0.1:9002";
};
