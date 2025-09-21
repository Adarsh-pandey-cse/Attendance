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
  setDoc,
} from 'firebase/firestore';
import type { Subject, AttendanceLog, UserData, TimetableEntry } from '@/types';
import { useToast } from './use-toast';

// A mock user ID. In a real multi-user app, this would come from an auth system.
const USER_ID = 'single-user';

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userName, setUserNameState] = useState<string>('Student');
  const [profilePicture, setProfilePictureState] = useState<string | null>(null);
  const [overallTarget, setOverallTargetState] = useState<number>(75);
  const [timetable, setTimetableState] = useState<UserData['timetable']>({});
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
        setTimetableState(data.timetable || {});
      } else {
        // If the user document doesn't exist, create it with default values
        // This is handled by the set functions now to ensure it exists before write
        setDoc(userDocRef, { userName: 'Student', overallTarget: 75, timetable: {} }, { merge: true });
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
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
          history: data.history || [],
        } as Subject;
      });
      setSubjects(subjectsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching subjects:", error);
        toast({ title: "Error", description: "Could not fetch subjects.", variant: "destructive" });
        setLoading(false);
    });

    return () => {
      unsubscribeUser();
      unsubscribeSubjects();
    };
  }, []);

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
      id: doc(collection(db, 'dummy')).id,
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
       toast({
        title: `Attendance Marked for ${subject.name}`,
        description: `You have been marked as ${status}.`,
      });
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
      await setDoc(userDocRef, { userName: name }, { merge: true });
    } catch (error) {
      console.error('Error updating user name:', error);
    }
  }

  const setProfilePicture = async (url: string | null) => {
    try {
      await setDoc(userDocRef, { profilePicture: url }, { merge: true });
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  }
  
  const setOverallTarget = async (target: number) => {
     try {
      await setDoc(userDocRef, { overallTarget: target }, { merge: true });
    } catch (error) {
      console.error('Error updating overall target:', error);
    }
  }

  const updateTimetable = async (newTimetable: UserData['timetable']) => {
    try {
      await setDoc(userDocRef, { timetable: newTimetable }, { merge: true });
      toast({ title: "Success", description: "Timetable updated." });
    } catch (error) {
      console.error('Error updating timetable:', error);
      toast({ title: "Error", description: "Failed to update timetable.", variant: "destructive" });
    }
  };

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
    timetable,
    updateTimetable,
    loading,
  };
};
