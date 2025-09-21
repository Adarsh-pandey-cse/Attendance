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
  history: AttendanceLog[];
};
