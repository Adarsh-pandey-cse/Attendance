
'use client';
import { Timestamp } from "firebase/firestore";

export type AttendanceLog = {
  id: string;
  timestamp: number;
  status: 'present' | 'absent';
};

export type Subject = {
  id:string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  history: AttendanceLog[];
};

export type TimetableEntry = {
  id: string;
  subjectId: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
}

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type UserData = {
    userName: string;
    profilePicture: string | null;
    overallTarget: number;
    timetable: {
      [key in DayOfWeek]?: TimetableEntry[];
    };
}

export type DeveloperInfo = {
    name: string;
    email: string;
    bio: string;
    profilePicture: string | null;
}

export type BugReport = {
  id: string;
  report: string;
  createdAt: Timestamp;
  status: 'new' | 'in-progress' | 'resolved';
}
