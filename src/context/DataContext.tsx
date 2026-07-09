import React, { createContext, useContext, useEffect, useState } from 'react';
import { DashboardData, Project, Experiment, JournalEntry, Task, Skill, TimelineEvent, AboutInfo } from '../types';
import { db, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const defaultAbout: AboutInfo = {
  bio: "",
  currentFocus: "",
  goals: "",
  interests: [],
  favoriteTech: []
};

const initialData: DashboardData = {
  projects: [],
  experiments: [],
  journal: [],
  tasks: [],
  skills: [],
  timeline: [],
  about: defaultAbout
};

type DataContextType = {
  data: DashboardData;
  updateData: (key: keyof DashboardData, value: any) => void;
  addItem: <K extends keyof Omit<DashboardData, 'about'>>(key: K, item: any) => void;
  updateItem: <K extends keyof Omit<DashboardData, 'about'>>(key: K, id: string, item: any) => void;
  deleteItem: <K extends keyof Omit<DashboardData, 'about'>>(key: K, id: string) => void;
  loading: boolean;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [firestoreData, setFirestoreData] = useState<DashboardData>(initialData);
  const [localData, setLocalData] = useState<DashboardData>(() => {
    try {
      const saved = localStorage.getItem('sa_portfolio_local_data');
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });
  const [loading, setLoading] = useState(true);

  // Sync localData to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sa_portfolio_local_data', JSON.stringify(localData));
    } catch (e) {
      console.error('Failed to save local data:', e);
    }
  }, [localData]);

  // Check if current user is admin
  const user = auth.currentUser;
  const isAdmin = !!(user && ['2403717673821050@cit.edu.in', 'shreeanguarunachalm@gmail.com', 'shreeanguarunachalam@gmail.com'].includes(user.email || ''));

  // Utility to combine Firestore lists and Local lists, supporting overrides and deletions
  const combineLists = (firestoreList: any[] = [], localList: any[] = []): any[] => {
    const localDeletedIds = new Set(localList.filter(item => item._deleted).map(item => item.id));
    const localMap = new Map(localList.filter(item => !item._deleted).map(item => [item.id, item]));
    
    const combined = firestoreList
      .filter(item => !localDeletedIds.has(item.id))
      .map(item => {
        if (localMap.has(item.id)) {
          const localVersion = localMap.get(item.id);
          localMap.delete(item.id);
          return localVersion;
        }
        return item;
      });
      
    return [...combined, ...Array.from(localMap.values())];
  };

  const processTasks = (taskList: Task[]): Task[] => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayTime = new Date(todayStr + 'T00:00:00').getTime();

    return taskList.map(task => {
      if (!task.isRecurring && task.status !== 'Done' && task.date) {
        const taskTime = new Date(task.date + 'T00:00:00').getTime();
        if (taskTime < todayTime) {
          return {
            ...task,
            category: 'Today'
          };
        }
      }
      return task;
    });
  };

  const data: DashboardData = {
    projects: combineLists(firestoreData.projects, localData.projects),
    experiments: combineLists(firestoreData.experiments, localData.experiments),
    journal: combineLists(firestoreData.journal, localData.journal),
    tasks: processTasks(combineLists(firestoreData.tasks, localData.tasks)),
    skills: combineLists(firestoreData.skills, localData.skills),
    timeline: combineLists(firestoreData.timeline, localData.timeline),
    about: firestoreData.about && firestoreData.about.bio ? firestoreData.about : (localData.about || defaultAbout)
  };

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const setupListeners = () => {
      try {
        const collections = ['projects', 'experiments', 'journal', 'tasks', 'skills', 'timeline'];
        
        collections.forEach(colName => {
          const unsub = onSnapshot(collection(db, colName), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFirestoreData(prev => ({ ...prev, [colName]: items }));
          }, (error) => {
            console.error(`Error fetching ${colName}:`, error);
          });
          unsubs.push(unsub);
        });

        const unsubAbout = onSnapshot(doc(db, 'settings', 'about'), (docSnap) => {
          if (docSnap.exists()) {
            setFirestoreData(prev => ({ ...prev, about: docSnap.data() as AboutInfo }));
          } else {
            setFirestoreData(prev => ({ ...prev, about: defaultAbout }));
          }
        }, (error) => {
          console.error("Error fetching about:", error);
        });
        unsubs.push(unsubAbout);
        
        setLoading(false);
      } catch (err) {
        console.error("Error setting up Firestore listeners:", err);
        setLoading(false);
      }
    };

    // Re-establish listeners when auth state changes in case of permission errors
    const authUnsub = onAuthStateChanged(auth, () => {
      // Clear previous listeners
      unsubs.forEach(unsub => unsub());
      unsubs = [];
      setupListeners();
    });

    return () => {
      authUnsub();
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const updateData = async (key: keyof DashboardData, value: any) => {
    if (key === 'about') {
      if (isAdmin) {
        try {
          await setDoc(doc(db, 'settings', 'about'), value);
        } catch (error) {
          console.error('Error updating about:', error);
          handleFirestoreError(error, OperationType.WRITE, 'settings/about');
        }
      } else {
        setLocalData(prev => ({
          ...prev,
          about: value
        }));
      }
    }
  };

  const addItem = async <K extends keyof Omit<DashboardData, 'about'>>(key: K, item: any) => {
    if (isAdmin) {
      try {
        // Remove id if it exists since Firestore generates one
        const { id, ...itemData } = item;
        await addDoc(collection(db, key), itemData);
      } catch (error: any) {
        console.error(`Error adding item to ${key}:`, error);
        handleFirestoreError(error, OperationType.CREATE, key);
      }
    } else {
      const generatedId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
      const newItem = { ...item, id: item.id || generatedId, isLocal: true };
      setLocalData(prev => ({
        ...prev,
        [key]: [...(prev[key] || []), newItem]
      }));
    }
  };

  const updateItem = async <K extends keyof Omit<DashboardData, 'about'>>(key: K, id: string, item: any) => {
    const isLocalItem = localData[key]?.some((i: any) => i.id === id);

    if (isAdmin && !isLocalItem) {
      try {
        await updateDoc(doc(db, key, id), item);
      } catch (error: any) {
        console.error(`Error updating item in ${key}:`, error);
        handleFirestoreError(error, OperationType.UPDATE, `${key}/${id}`);
      }
    } else {
      setLocalData(prev => {
        const list = prev[key] || [];
        const index = list.findIndex((i: any) => i.id === id);
        if (index > -1) {
          const updatedList = [...list];
          updatedList[index] = { ...updatedList[index], ...item };
          return { ...prev, [key]: updatedList };
        } else {
          const original = firestoreData[key]?.find((i: any) => i.id === id);
          if (original) {
            const overridden = { ...original, ...item, id };
            return { ...prev, [key]: [...list, overridden] };
          }
        }
        return prev;
      });
    }
  };

  const deleteItem = async <K extends keyof Omit<DashboardData, 'about'>>(key: K, id: string) => {
    const isLocalItem = localData[key]?.some((i: any) => i.id === id && i.isLocal);

    if (isAdmin && !isLocalItem) {
      try {
        await deleteDoc(doc(db, key, id));
      } catch (error: any) {
        console.error(`Error deleting item from ${key}:`, error);
        handleFirestoreError(error, OperationType.DELETE, `${key}/${id}`);
      }
    } else {
      setLocalData(prev => {
        const list = prev[key] || [];
        const isOnlyLocal = list.some((i: any) => i.id === id && i.isLocal);
        if (isOnlyLocal) {
          return {
            ...prev,
            [key]: list.filter((i: any) => i.id !== id)
          };
        } else {
          return {
            ...prev,
            [key]: [...list, { id, _deleted: true }]
          };
        }
      });
    }
  };

  return (
    <DataContext.Provider value={{ data, updateData, addItem, updateItem, deleteItem, loading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
