'use client';

import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Subject, AttendanceLog } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useAttendance = () => {
  const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
  const [userName, setUserName] = useLocalStorage<string>('userName', 'Student');

  const addSubject = (newSubject: Omit<Subject, 'id' | 'history'>) => {
    const subjectWithId: Subject = {
      ...newSubject,
      id: uuidv4(),
      history: [],
    };
    setSubjects([...subjects, subjectWithId]);
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
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const newLog: AttendanceLog = {
      id: uuidv4(),
      timestamp: Date.now(),
      status,
    };

    const updatedSubject: Subject = {
      ...subject,
      totalClasses: subject.totalClasses + 1,
      attendedClasses: status === 'present' ? subject.attendedClasses + 1 : subject.attendedClasses,
      history: [...subject.history, newLog],
    };

    updateSubject(updatedSubject);
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
  };
};

// Dummy uuidv4 for environments where crypto is not available (like initial SSR)
const v4 = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
