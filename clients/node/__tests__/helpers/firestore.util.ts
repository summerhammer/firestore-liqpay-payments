import {
  DocumentData,
  QueryDocumentSnapshot
} from "firebase-admin/lib/firestore";
import {firestore} from "firebase-admin";
import Timestamp = firestore.Timestamp;
import DocumentReference = firestore.DocumentReference;
import * as sinon from "sinon";

export function createMockSnapshot(
  data: DocumentData & {createdAt: Date, updatedAt: Date},
): QueryDocumentSnapshot {
  return {
    createTime: Timestamp.fromDate(data.createdAt),
    updateTime: Timestamp.fromDate(data.updatedAt),
    exists: true,
    ref: {} as any, // Mock reference, replace with actual if needed
    id: "mockId",
    readTime: Timestamp.fromDate(new Date("2023-10-02T00:00:00Z")),
    size: 0,
    data: () => data,
    get: (field: string) => data[field],
    isEqual: () => false,
  } as QueryDocumentSnapshot;
}

export function createDocumentReference(params: {
  data?: DocumentData,
  error?: Error,
}): DocumentReference {
  return {
    id: "mockId",
    withConverter: sinon.stub().returnsThis(),
    get: sinon.stub().callsFake(() => {
      return Promise.resolve({
        data: () => params.data,
        exists: params.data !== undefined,
      });
    }),
    onSnapshot: sinon.stub().callsFake((onNext, onError) => {
      if (params.error) {
        onError(params.error);
      }
      if (params.data) {
        onNext({
          data: () => params.data,
        });
      }
      return () => {};
    }),
  } as unknown as DocumentReference;
}
