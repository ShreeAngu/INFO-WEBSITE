import React, { createContext, useContext, useEffect, useState } from 'react';
import { DashboardData, Project, Experiment, JournalEntry, Task, Skill, TimelineEvent, AboutInfo } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

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
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const setupListeners = () => {
      try {
        const collections = ['projects', 'experiments', 'journal', 'tasks', 'skills', 'timeline'];
        
        collections.forEach(colName => {
          const unsub = onSnapshot(collection(db, colName), (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setData(prev => ({ ...prev, [colName]: items }));
          }, (error) => {
            console.error(`Error fetching ${colName}:`, error);
          });
          unsubs.push(unsub);
        });

        const unsubAbout = onSnapshot(doc(db, 'settings', 'about'), (docSnap) => {
          if (docSnap.exists()) {
            setData(prev => ({ ...prev, about: docSnap.data() as AboutInfo }));
          } else {
            setData(prev => ({ ...prev, about: defaultAbout }));
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

    setupListeners();

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, []);

  const updateData = async (key: keyof DashboardData, value: any) => {
    if (key === 'about') {
      try {
        await setDoc(doc(db, 'settings', 'about'), value);
      } catch (error) {
        console.error('Error updating about:', error);
      }
    }
  };

  const addItem = async <K extends keyof Omit<DashboardData, 'about'>>(key: K, item: any) => {
    try {
      // Remove id if it exists since Firestore generates one
      const { id, ...itemData } = item;
      await addDoc(collection(db, key), itemData);
    } catch (error) {
      console.error(`Error adding item to ${key}:`, error);
    }
  };

  const updateItem = async <K extends keyof Omit<DashboardData, 'about'>>(key: K, id: string, item: any) => {
    try {
      await updateDoc(doc(db, key, id), item);
    } catch (error) {
      console.error(`Error updating item in ${key}:`, error);
    }
  };

  const deleteItem = async <K extends keyof Omit<DashboardData, 'about'>>(key: K, id: string) => {
    try {
      await deleteDoc(doc(db, key, id));
    } catch (error) {
      console.error(`Error deleting item from ${key}:`, error);
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
