import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db as firestore } from '../firebase';
import db from '../db';

class SyncService {
  constructor() {
    this.unsubscribers = [];
    this.isSyncing = false;
  }

  async startSync(uid) {
    if (!uid) return;
    console.log('🔄 Starting Cloud Sync for:', uid);

    try {
      // 1. Setup listeners for each major table
      const tables = ['categories', 'transactions', 'budgets', 'savingsGoals'];
      
      for (const table of tables) {
        const q = query(collection(firestore, table), where('uid', '==', uid));
        
        const unsub = onSnapshot(q, async (snapshot) => {
          for (const change of snapshot.docChanges()) {
            const remoteData = change.doc.data();
            const localId = change.doc.id;

            if (change.type === 'removed') {
              await db[table].delete(localId);
            } else {
              // Last Write Wins logic
              const localRecord = await db[table].get(localId);
              const remoteUpdatedAt = remoteData.updatedAt?.toMillis?.() || 0;
              const localUpdatedAt = localRecord?.updatedAt || 0;

              if (!localRecord || remoteUpdatedAt > localUpdatedAt) {
                await db[table].put({
                  ...remoteData,
                  id: localId,
                  updatedAt: remoteUpdatedAt // store as ms
                });
              }
            }
          }
        }, (err) => {
          console.warn(`Firestore listener error on ${table}:`, err.message);
        });
        this.unsubscribers.push(unsub);
      }

      // 2. Setup Dexie hooks to push local changes to Firestore
      this.setupLocalHooks(uid);
    } catch (err) {
      console.warn("Could not initiate Firestore sync. Proceeding in strictly Offline Mode.", err.message);
    }
  }

  setupLocalHooks(uid) {
    const tables = ['categories', 'transactions', 'budgets', 'savingsGoals'];
    
    tables.forEach(tableName => {
      db[tableName].hook('creating', (primaryKey, obj) => {
        obj.uid = uid;
        obj.updatedAt = Date.now();
        this.pushToFirestore(tableName, primaryKey, obj);
      });

      db[tableName].hook('updating', (mods, primKey, obj) => {
        const update = { ...obj, ...mods, updatedAt: Date.now() };
        this.pushToFirestore(tableName, primKey, update);
        return mods; // important for Dexie
      });

      db[tableName].hook('deleting', (primKey) => {
        this.deleteFromFirestore(tableName, primKey);
      });
    });
  }

  async pushToFirestore(table, id, data) {
    try {
      const docRef = doc(firestore, table, id.toString());
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp() // Firestore server time
      }, { merge: true });
    } catch (err) {
      console.error(`Sync Error (Push ${table}):`, err);
    }
  }

  async deleteFromFirestore(table, id) {
    try {
      await deleteDoc(doc(firestore, table, id.toString()));
    } catch (err) {
      console.error(`Sync Error (Delete ${table}):`, err);
    }
  }

  stopSync() {
    this.unsubscribers.forEach(unsub => unsub());
    this.unsubscribers = [];
  }
}

export const syncService = new SyncService();
