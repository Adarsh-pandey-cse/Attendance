
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
import { startOfWeek, subWeeks, getTime } from 'date-fns';

const USER_ID = 'single-user';

export const useAttendance = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userData, setUserData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const userDocRef = doc(db, 'users', USER_ID);
  const subjectsColRef = collection(db, 'users', USER_ID, 'subjects');
  
  const { userName, profilePicture, overallTarget, timetable, currentStreak, longestStreak } = userData;

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
            currentStreak: data.currentStreak || 0,
            longestStreak: data.longestStreak || 0,
            lastWeekEvaluated: data.lastWeekEvaluated || 0,
            perfectWeeks: data.perfectWeeks || 0,
        });
      } else {
        const defaultData: UserData = { 
            userName: 'Student', 
            overallTarget: 75, 
            timetable: {},
            currentStreak: 0,
            longestStreak: 0,
            lastWeekEvaluated: 0,
            perfectWeeks: 0,
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

  // --- Streak Evaluation Logic ---
  useEffect(() => {
    if (loading || !subjects.length || userData.lastWeekEvaluated === undefined) return;

    const evaluateWeeklyStreak = async () => {
        const now = new Date();
        const lastWeekStartDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const lastWeekStartDateTimestamp = getTime(lastWeekStartDate);

        // Only evaluate if we haven't already evaluated for the last week
        if (userData.lastWeekEvaluated && userData.lastWeekEvaluated >= lastWeekStartDateTimestamp) {
            return;
        }

        const lastWeekEndDate = new Date(lastWeekStartDate);
        lastWeekEndDate.setDate(lastWeekEndDate.getDate() + 6);
        lastWeekEndDate.setHours(23, 59, 59, 999);

        let totalScheduled = 0;
        let totalAttended = 0;

        const dayMapping: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        if(userData.timetable){
            for (let d = new Date(lastWeekStartDate); d <= lastWeekEndDate; d.setDate(d.getDate() + 1)) {
                const dayOfWeek = dayMapping[d.getDay()];
                if (userData.timetable[dayOfWeek]) {
                    totalScheduled += userData.timetable[dayOfWeek]!.length;
                }
            }
        }


        subjects.forEach(subject => {
            subject.history.forEach(log => {
                if(log.timestamp >= lastWeekStartDateTimestamp && log.timestamp <= getTime(lastWeekEndDate)) {
                    if (log.status === 'present') {
                        totalAttended++;
                    }
                }
            });
        });

        const newUserData: Partial<UserData> = { lastWeekEvaluated: getTime(now) };

        if (totalScheduled > 0 && totalAttended >= totalScheduled) {
            newUserData.currentStreak = (userData.currentStreak || 0) + 1;
            newUserData.perfectWeeks = (userData.perfectWeeks || 0) + 1;
            if (newUserData.currentStreak > (userData.longestStreak || 0)) {
                newUserData.longestStreak = newUserData.currentStreak;
            }
            toast({ title: 'Perfect Week! 🎉', description: 'You attended all your classes last week. Your streak continues!' });
        } else if (totalScheduled > 0) {
            newUserData.currentStreak = 0;
            if((userData.currentStreak || 0) > 0) {
              toast({ title: 'Streak Reset', description: 'You missed a class last week. Keep trying for a perfect week!', variant: 'destructive'});
            }
        }
        
        await setDoc(userDocRef, newUserData, { merge: true });
    };

    evaluateWeeklyStreak();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, subjects, userData.lastWeekEvaluated]);


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
    try {
      await updateDoc(doc(subjectsColRef, id), dataToUpdate);
      toast({ title: "Success", description: "Subject updated." });
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({ title: "Error", description: "Failed to update subject.", variant: "destructive" });
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
    currentStreak, longestStreak,
  };
};
