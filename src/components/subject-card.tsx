
'use client';

import { Subject } from '@/types';
import { Button } from './ui/button';
import { useAttendance } from '@/hooks/use-attendance';
import { calculateClassesToAttend, calculateClassesToBunk } from '@/lib/utils';
import { AttendanceNotification } from './attendance-notification';
import { History, Plus, Minus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditSubjectDialog } from './edit-subject-dialog';
import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

type SubjectCardProps = {
  subject: Subject;
};

const CircularProgress = ({ percentage, target, attendedClasses, totalClasses }: { percentage: number, target: number, attendedClasses: number, totalClasses: number }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const { theme } = useTheme();
  
  const offset = circumference - (percentage / 100) * circumference;
  
  let colorClass = 'text-yellow-400';
  if (percentage >= target) {
    colorClass = 'text-primary';
  } else if (percentage < target * 0.75) { 
    colorClass = 'text-red-500';
  }
  
  if (theme === 'radha-rani') {
    if (percentage >= target) {
      colorClass = 'text-primary';
    } else if (percentage < target * 0.75) { 
      colorClass = 'text-red-600';
    } else {
        colorClass = 'text-orange-500';
    }
  }


  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full" viewBox="0 0 90 90">
        <circle
          className="text-gray-600/50"
          strokeWidth="8"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="45"
          cy="45"
        />
        <motion.circle
          className={cn(colorClass, "transition-colors duration-300")}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="45"
          cy="45"
          transform="rotate(-90 45 45)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        key={`${attendedClasses}-${totalClasses}`}
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
      >
        <span className="text-xl font-bold">{percentage.toFixed(0)}%</span>
      </motion.div>
    </div>
  );
};


export function SubjectCard({ subject }: SubjectCardProps) {
  const { markAttendance, deleteSubject, overallTarget } = useAttendance();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { theme } = useTheme();
  const percentage = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  
  const needed = calculateClassesToAttend(subject.attendedClasses, subject.totalClasses, overallTarget);
  const bunkable = calculateClassesToBunk(subject.attendedClasses, subject.totalClasses, overallTarget);

  let statusText, statusColor, isAboveTarget;

  const isRadhaTheme = theme === 'radha-rani';

  if (percentage < overallTarget) {
    statusText = `Attend next ${needed} class${needed !== 1 ? 'es' : ''} to reach target.`;
    statusColor = isRadhaTheme ? "text-red-700" : "text-red-400";
    isAboveTarget = false;
  } else {
    statusText = `You can bunk next ${bunkable} class${bunkable !== 1 ? 'es' : ''}.`;
    statusColor = isRadhaTheme ? "text-orange-600" : "text-cyan-400";
    isAboveTarget = true;
  }
  if (needed === Infinity) {
    statusText = "Target is unreachable."
    statusColor = isRadhaTheme ? "text-red-700" : "text-red-400";
    isAboveTarget = false;
  }

  const handleDelete = () => {
    deleteSubject(subject.id);
    setIsDeleteDialogOpen(false);
  }

  return (
    <div className="glass-card p-4 space-y-3 transition-all duration-300 homepage-section">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold">{subject.name}</h3>
        </div>
        <div className="flex items-center">
            <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-accent w-8 h-8">
              <Link href={`/history/${subject.id}`}>
                <History className="h-4 w-4" />
              </Link>
            </Button>
          <EditSubjectDialog subject={subject}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary w-8 h-8">
              <Edit className="w-4 w-4" />
            </Button>
          </EditSubjectDialog>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive w-8 h-8">
                <Trash2 className="w-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-bold">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the subject &quot;{subject.name}&quot; and all its attendance history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/80 font-bold">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {isAboveTarget && (
         <div className="text-center">
            <p className="text-lg font-bold text-primary">
                {isRadhaTheme ? "राधे राधे you're on track!" : "You're on track! Keep it up!"}
            </p>
        </div>
      )}

      <div className="flex items-center justify-around gap-4">
        <CircularProgress percentage={percentage} target={overallTarget} attendedClasses={subject.attendedClasses} totalClasses={subject.totalClasses} />
        <motion.div 
            className="text-center"
            key={`${subject.attendedClasses}-${subject.totalClasses}-text`}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
        >
            <p className="text-3xl font-bold">
              {subject.attendedClasses}/{subject.totalClasses}
            </p>
            <p className="text-sm text-muted-foreground font-semibold">Classes</p>
        </motion.div>
      </div>
      
      <div className="text-center">
        <p className={cn("font-bold text-sm", statusColor)}>{statusText}</p>
        {!isAboveTarget && <AttendanceNotification subject={subject} />}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => markAttendance(subject.id, 'present')} size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg shadow-green-600/20 font-bold transition-all duration-300 hover:scale-[1.03] text-xs px-2">
          <Plus className="mr-1 md:mr-2 h-4 w-4"/> Attended
        </Button>
        <Button onClick={() => markAttendance(subject.id, 'absent')} size="sm" className="flex-1 bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20 font-bold transition-all duration-300 hover:scale-[1.03] text-xs px-2">
          <Minus className="mr-1 md:mr-2 h-4 w-4"/> Missed
        </Button>
      </div>
    </div>
  );
}
