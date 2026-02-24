'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import type { Subject, AttendanceLog, UserData, DayOfWeek } from '@/types';
import { useToast } from './use-toast';

const USER_ID = 'single-user';

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userDocRef = doc(db, 'users', USER_ID);
  const subjectsColRef = collection(db, 'users', USER_ID, 'subjects');
  
  const { userName, profilePicture, overallTarget, timetable } = userData;

  // --- Real-time Listeners ---
  useEffect(() => {
    setLoading(true);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as UserData;
        setUserData({
            userName: data.userName || 'Student',
            profilePicture: data.profilePicture || null,
            overallTarget: data.overallTarget || 75,
            timetable: data.timetable || {},
        });
      } else {
        const defaultData: UserData = { 
            userName: 'Student', 
            overallTarget: 75, 
            timetable: {},
            profilePicture: null,
        };
        setDoc(userDocRef, defaultData, { merge: true });
        setUserData(defaultData);
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
      toast({ title: "Warning", description: "Could not load user profile.", variant: "destructive" });
    });

    const q = query(subjectsColRef);
    const unsubscribeSubjects = onSnapshot(q, (querySnapshot) => {
      const subjectsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        history: doc.data().history || [],
      } as Subject));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const addSubject = async (newSubject: Omit<Subject, 'id' | 'history'>) => {
    try {
      await addDoc(subjectsColRef, { ...newSubject, history: [] });
      toast({ title: "Success", description: "Subject added successfully." });
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({ title: "Error", description: "Failed to add subject.", variant: "destructive" });
    }
  };

  const updateSubject = async (updatedSubject: Partial<Subject> & { id: string }) => {
    const { id, ...dataToUpdate } = updatedSubject;
    const subjectDocRef = doc(subjectsColRef, id);

    const originalSubject = subjects.find(s => s.id === id);
    if (!originalSubject) {
        toast({ title: "Error", description: "Could not find subject to update.", variant: "destructive" });
        return;
    }

    const attendedChanged = dataToUpdate.attendedClasses !== undefined && dataToUpdate.attendedClasses !== originalSubject.attendedClasses;
    const totalChanged = dataToUpdate.totalClasses !== undefined && dataToUpdate.totalClasses !== originalSubject.totalClasses;

    // If attendance numbers changed, create a history log.
    if (attendedChanged || totalChanged) {
        const changes: string[] = [];
        if (dataToUpdate.name !== undefined && dataToUpdate.name !== originalSubject.name) {
            changes.push(`name from "${originalSubject.name}" to "${dataToUpdate.name}"`);
        }
        if (attendedChanged) {
            changes.push(`attended classes from ${originalSubject.attendedClasses} to ${dataToUpdate.attendedClasses}`);
        }
        if (totalChanged) {
            changes.push(`total classes from ${originalSubject.totalClasses} to ${dataToUpdate.totalClasses}`);
        }

        const details = 'Edited: ' + changes.join(', ');
        const newLog: AttendanceLog = {
            id: doc(collection(db, 'dummy')).id,
            timestamp: Date.now(),
            status: 'edit',
            details: details,
        };
        
        const finalUpdateData = {
            ...dataToUpdate,
            history: [...(originalSubject.history || []), newLog]
        };

        try {
            await updateDoc(subjectDocRef, finalUpdateData);
            toast({ title: "Success", description: "Subject updated." });
        } catch (error) {
            console.error('Error updating subject:', error);
            toast({ title: "Error", description: "Failed to update subject.", variant: "destructive" });
        }
    } else { // Only name might have changed, or nothing. No history log needed.
        if (Object.keys(dataToUpdate).length > 0) {
            try {
                await updateDoc(subjectDocRef, dataToUpdate);
                toast({ title: "Success", description: "Subject updated." });
            } catch (error) {
                console.error('Error updating subject:', error);
                toast({ title: "Error", description: "Failed to update subject.", variant: "destructive" });
            }
        }
    }
  };

  const deleteSubject = async (subjectId: string) => {
    try {
      await deleteDoc(doc(subjectsColRef, subjectId));
      toast({ title: "Success", description: "Subject deleted." });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({ title: "Error", description: "Failed to delete subject.", variant: "destructive" });
    }
  };

  const markAttendance = async (subjectId: string, status: 'present' | 'absent') => {
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
      await updateDoc(doc(subjectsColRef, subjectId), updatedData);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({ title: "Error", description: "Failed to mark attendance.", variant: "destructive" });
    }
  };

  const getSubjectById = (subjectId: string): Subject | undefined => {
    return subjects.find(s => s.id === subjectId);
  };
  
  const setUserName = async (name: string) => {
    try { await setDoc(userDocRef, { userName: name }, { merge: true }); } 
    catch (error) { console.error('Error updating user name:', error); }
  }

  const setProfilePicture = async (url: string | null) => {
    try { await setDoc(userDocRef, { profilePicture: url }, { merge: true }); } 
    catch (error) { console.error('Error updating profile picture:', error); }
  }
  
  const setOverallTarget = async (target: number) => {
     try { await setDoc(userDocRef, { overallTarget: target }, { merge: true }); }
     catch (error) { console.error('Error updating overall target:', error); }
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
    subjects, addSubject, updateSubject, deleteSubject, markAttendance, getSubjectById,
    loading,
    // From UserData
    userName, setUserName,
    profilePicture, setProfilePicture,
    overallTarget, setOverallTarget,
    timetable, updateTimetable,
  };
};
