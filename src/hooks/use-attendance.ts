'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import type { Subject, AttendanceLog, UserData } from '@/types';
import { useToast } from './use-toast';

// A mock user ID. In a real multi-user app, this would come from an auth system.
const USER_ID = 'single-user';

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userName, setUserNameState] = useState<string>('Student');
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);
  const [overallTarget, setOverallTargetState] = useState<number>(75);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userDocRef = doc(db, 'users', USER_ID);
  const subjectsColRef = collection(db, 'users', USER_ID, 'subjects');

  // --- Real-time Listeners ---
  useEffect(() => {
    setLoading(true);
    // Listen for user profile data (name, picture, target)
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        setUserNameState(data.userName || 'Student');
        setProfilePictureState(data.profilePicture || null);
        setOverallTargetState(data.overallTarget || 75);
      } else {
        // If the user document doesn't exist, create it with default values
        updateDoc(userDocRef, {
            userName: 'Student',
            profilePicture: null,
            overallTarget: 75,
        }, { merge: true });
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
      // We don't want to block the UI for user data errors, but we can toast
      toast({ title: "Warning", description: "Could not load user profile.", variant: "destructive" });
    });

    // Listen for subjects data
    const q = query(subjectsColRef);
    const unsubscribeSubjects = onSnapshot(q, (querySnapshot) => {
      const subjectsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          // Firestore timestamps need to be converted to JS Dates if needed,
          // but we are using numbers (milliseconds) which is fine.
          history: data.history || [],
        } as Subject;
      });
      setSubjects(subjectsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching subjects:", error);
        toast({ title: "Error", description: "Could not fetch subjects.", variant: "destructive" });
        setLoading(false); // Make sure loading is turned off on error too
    });

    return () => {
      unsubscribeUser();
      unsubscribeSubjects();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Data Manipulation Functions ---

  const addSubject = async (newSubject: Omit<Subject, 'id' | 'history'>) => {
    try {
      await addDoc(subjectsColRef, {
        ...newSubject,
        history: [],
      });
      toast({ title: "Success", description: "Subject added successfully." });
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({ title: "Error", description: "Failed to add subject.", variant: "destructive" });
    }
  };

  const updateSubject = async (updatedSubject: Partial<Subject> & { id: string }) => {
    const { id, ...dataToUpdate } = updatedSubject;
    const subjectDocRef = doc(db, 'users', USER_ID, 'subjects', id);
    try {
      await updateDoc(subjectDocRef, dataToUpdate);
      toast({ title: "Success", description: "Subject updated." });
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({ title: "Error", description: "Failed to update subject.", variant: "destructive" });
    }
  };

  const deleteSubject = async (subjectId: string) => {
    const subjectDocRef = doc(db, 'users', USER_ID, 'subjects', subjectId);
    try {
      await deleteDoc(subjectDocRef);
      toast({ title: "Success", description: "Subject deleted." });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({ title: "Error", description: "Failed to delete subject.", variant: "destructive" });
    }
  };

  const markAttendance = async (subjectId: string, status: 'present' | 'absent') => {
    const subjectDocRef = doc(db, 'users', USER_ID, 'subjects', subjectId);
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newLog: AttendanceLog = {
      id: doc(collection(db, 'dummy')).id, // Generate a unique ID
      timestamp: Date.now(),
      status,
    };

    const updatedData = {
        totalClasses: subject.totalClasses + 1,
        attendedClasses: status === 'present' ? subject.attendedClasses + 1 : subject.attendedClasses,
        history: [...subject.history, newLog],
    };

    try {
      await updateDoc(subjectDocRef, updatedData);
      // No toast here to keep the UI clean on frequent actions
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({ title: "Error", description: "Failed to mark attendance.", variant: "destructive" });
    }
  };

  const getSubjectById = (subjectId: string): Subject | undefined => {
    return subjects.find(s => s.id === subjectId);
  };
  
  const setUserName = async (name: string) => {
    try {
      await updateDoc(userDocRef, { userName: name }, { merge: true });
    } catch (error) {
      console.error('Error updating user name:', error);
    }
  }

  const setProfilePicture = async (url: string | null) => {
    try {
      await updateDoc(userDocRef, { profilePicture: url }, { merge: true });
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  }
  
  const setOverallTarget = async (target: number) => {
     try {
      await updateDoc(userDocRef, { overallTarget: target }, { merge: true });
    } catch (error) {
      console.error('Error updating overall target:', error);
    }
  }

  return {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,
    markAttendance,
    getSubjectById,
    userName,
    setUserName,
    profilePicture,
    setProfilePicture,
    overallTarget,
    setOverallTarget,
    loading,
  };
};
