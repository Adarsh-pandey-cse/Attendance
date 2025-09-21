'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Subject, AttendanceLog } from '@/types';

// Simple UUID generator for client-side use
const v4 = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const useAttendance = () => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [userName, setUserName] = useLocalStorage<string>('userName', 'Student');
  const [profilePicture, setProfilePicture] = useLocalStorage<string | null>('profilePicture', null);
  const [overallTarget, setOverallTarget] = useLocalStorage<number>('overallTarget', 75);

  const addSubject = (newSubject: Omit<Subject, 'id' | 'history'>) => {
    const subjectWithId: Subject = {
      ...newSubject,
      id: v4(),
      history: [],
    };
    setSubjects(prevSubjects => [...prevSubjects, subjectWithId]);
  };

  const updateSubject = (updatedSubject: Subject) => {
    setSubjects(
      subjects.map((subject) =>
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    );
  };
  
  const deleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter((subject) => subject.id !== subjectId));
  };

  const markAttendance = (subjectId: string, status: 'present' | 'absent') => {
    setSubjects(prevSubjects => {
      return prevSubjects.map(subject => {
        if (subject.id === subjectId) {
          const newLog: AttendanceLog = {
            id: v4(),
            timestamp: Date.now(),
            status,
          };
          return {
            ...subject,
            totalClasses: subject.totalClasses + 1,
            attendedClasses: status === 'present' ? subject.attendedClasses + 1 : subject.attendedClasses,
            history: [...subject.history, newLog],
          };
        }
        return subject;
      });
    });
  };

  const getSubjectById = (subjectId: string): Subject | undefined => {
    return subjects.find(s => s.id === subjectId);
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
  };
};
