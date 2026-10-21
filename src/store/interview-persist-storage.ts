import type { PersistStorage, StorageValue } from 'zustand/middleware';

const DATABASE_NAME = 'interview-flashcard-storage';
const DATABASE_VERSION = 1;
const OBJECT_STORE = 'zustand-state';

let databasePromise: Promise<IDBDatabase> | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  const opening = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is unavailable'));
      return;
    }
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(OBJECT_STORE)) {
        request.result.createObjectStore(OBJECT_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open IndexedDB'));
    request.onblocked = () => reject(new Error('IndexedDB upgrade is blocked'));
  });
  databasePromise = opening.catch((error) => {
    databasePromise = null;
    throw error;
  });
  return databasePromise;
}

function readFromDatabase(db: IDBDatabase, name: string): Promise<StorageValue<unknown> | undefined> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(OBJECT_STORE, 'readonly').objectStore(OBJECT_STORE).get(name);
    request.onsuccess = () => resolve(request.result as StorageValue<unknown> | undefined);
    request.onerror = () => reject(request.error ?? new Error('Could not read interview state'));
  });
}

function writeToDatabase(db: IDBDatabase, name: string, value: StorageValue<unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE, 'readwrite');
    transaction.objectStore(OBJECT_STORE).put(value, name);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not save interview state'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Interview state save was aborted'));
  });
}

function removeFromDatabase(db: IDBDatabase, name: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(OBJECT_STORE, 'readwrite');
    transaction.objectStore(OBJECT_STORE).delete(name);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Could not remove interview state'));
    transaction.onabort = () => reject(transaction.error ?? new Error('Interview state removal was aborted'));
  });
}

/** IndexedDB avoids serializing the full interview snapshot on every store update. */
export const interviewPersistStorage: PersistStorage<unknown> = {
  async getItem(name) {
    try {
      const db = await openDatabase();
      const value = await readFromDatabase(db, name);
      if (value) return value;
    } catch {
      // Keep the legacy localStorage path available in private/restricted contexts.
    }

    try {
      const legacyValue = localStorage.getItem(name);
      if (!legacyValue) return null;
      const parsed = JSON.parse(legacyValue) as StorageValue<unknown>;
      try {
        await writeToDatabase(await openDatabase(), name, parsed);
        localStorage.removeItem(name);
      } catch {
        // The parsed legacy value is still usable even if migration cannot be persisted.
      }
      return parsed;
    } catch {
      return null;
    }
  },
  async setItem(name, value) {
    try {
      await writeToDatabase(await openDatabase(), name, value);
    } catch {
      localStorage.setItem(name, JSON.stringify(value));
    }
  },
  async removeItem(name) {
    try {
      await removeFromDatabase(await openDatabase(), name);
    } finally {
      localStorage.removeItem(name);
    }
  },
};
