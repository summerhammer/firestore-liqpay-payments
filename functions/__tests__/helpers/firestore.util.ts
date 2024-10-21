import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Query
} from "firebase-admin/firestore";

export function firestoreWaitForDocumentWithIdInCollection(
  query: Query,
  id: string,
  timeout = 20_000
): Promise<DocumentData> {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(
        new Error(
          `Timeout waiting for firestore document to exist with id ${id} in collection`
        )
      );
    }, timeout);

    const unsubscribe = query.onSnapshot(async (snapshot) => {
      const docs = snapshot.docChanges();

      const record: DocumentData = docs.filter(
        ($) => $.doc.id === id
      )[0];

      if (record) {
        unsubscribe();
        if (!timedOut) {
          clearTimeout(timer);
          resolve(record);
        }
      }
    });
  });
}

export function firestoreWaitForDocumentToExistWithField(
  ref: DocumentReference,
  field: string,
  timeout = 20_000
): Promise<DocumentData> {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(
        new Error(
          `Timeout waiting for firestore document to exist with field ${field}`
        )
      );
    }, timeout);

    const unsubscribe = ref.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (data && data[field]) {
        unsubscribe();
        if (!timedOut) {
          clearTimeout(timer);
          resolve(data);
        }
      }
    });
  });
}

export function firestoreWaitForDocumentToExistWithFields(
  ref: DocumentReference,
  fields: Record<any, any>,
  timeout = 20_000
): Promise<DocumentData> {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(
        new Error(
          `Timeout waiting for firestore document to exist with fields ${JSON.stringify(
            fields
          )}`
        )
      );
    }, timeout);

    const unsubscribe = ref.onSnapshot((snapshot) => {
      const data = snapshot.data();
      if (data) {
        const hasFields = Object.keys(fields).every(
          (key) => data[key] === fields[key]
        );
        if (hasFields) {
          unsubscribe();
          if (!timedOut) {
            clearTimeout(timer);
            resolve(data);
          }
        }
      }
    });
  });
}

export function firestoreWaitForDocumentExist(
  ref: DocumentReference,
  timeout = 5_000,
): Promise<DocumentData> {
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      reject(
        new Error(
          `Timeout waiting for firestore document to exist at path ${ref.path}`
        )
      );
    }, timeout);

    const unsubscribe = ref.onSnapshot((snapshot) => {
      if (snapshot.exists) {
        unsubscribe();
        if (!timedOut) {
          clearTimeout(timer);
          const data = snapshot.data();
          if (!data) {
            reject(
              new Error(
                `Document at path ${ref.path} exists but has no data`
              )
            );
          } else {
            resolve(data);
          }
        }
      }
    });
  });
}

export async function firestoreDeleteCollection(
  ref: CollectionReference
): Promise<void> {
  const docs = await ref.listDocuments();
  for (const doc of docs) {
    await doc.delete();
  }
}
