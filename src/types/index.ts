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

export type UserData = {
    userName: string;
    profilePicture: string | null;
    overallTarget: number;
}

export type Badge = {
    id: string;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    achieved: boolean;
};
