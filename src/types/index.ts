export type AttendanceLog = {
  id: string;
  timestamp: number;
  status: 'present' | 'absent';
};

export type Subject = {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  target: number; // 1-100
  history: AttendanceLog[];
};
