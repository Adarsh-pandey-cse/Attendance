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

type SubjectCardProps = {
  subject: Subject;
};

const CircularProgress = ({ percentage, target, animateControls }: { percentage: number, target: number, animateControls: any }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  
  const a = (percentage / 100) * circumference;
  const [offset, setOffset] = useState(circumference - a)
  
  useEffect(() => {
    setOffset(circumference - (percentage / 100) * circumference);
  }, [percentage, circumference]);
  
  let colorClass = 'text-yellow-400';
  if (percentage >= target) {
    colorClass = 'text-green-400';
  } else if (percentage < target * 0.75) { 
    colorClass = 'text-red-500';
  }

  return (
    <div className="relative w-28 h-28">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          className="text-gray-600/50"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
        />
        <motion.circle
          className={`${colorClass} transition-colors duration-300`}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="60"
          cy="60"
          transform="rotate(-90 60 60)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>
      <motion.div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        animate={animateControls}
        initial={{ scale: 1 }}
      >
        <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
      </motion.div>
    </div>
  );
};


export function SubjectCard({ subject }: SubjectCardProps) {
  const { markAttendance, deleteSubject, overallTarget } = useAttendance();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const percentage = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  
  const needed = calculateClassesToAttend(subject.attendedClasses, subject.totalClasses, overallTarget);
  const bunkable = calculateClassesToBunk(subject.attendedClasses, subject.totalClasses, overallTarget);

  let statusText, statusColor, isAboveTarget;
  if (percentage < overallTarget) {
    statusText = `Attend next ${needed} class${needed !== 1 ? 'es' : ''} to reach target.`;
    statusColor = "text-red-400";
    isAboveTarget = false;
  } else {
    statusText = `You can bunk next ${bunkable} class${bunkable !== 1 ? 'es' : ''}.`;
    statusColor = "text-cyan-400";
    isAboveTarget = true;
  }
  if (needed === Infinity) {
    statusText = "Target is unreachable."
    statusColor = "text-red-400";
    isAboveTarget = false;
  }

  const handleDelete = () => {
    deleteSubject(subject.id);
    setIsDeleteDialogOpen(false);
  }
  
  const animationControls = useAnimation();
  const prevSubjectRef = useRef(subject);

  useEffect(() => {
    if (prevSubjectRef.current.attendedClasses !== subject.attendedClasses || prevSubjectRef.current.totalClasses !== subject.totalClasses) {
      animationControls.start({
        scale: [1, 1.2, 1],
        transition: { duration: 0.4, times: [0, 0.5, 1] }
      });
    }
    prevSubjectRef.current = subject;
  }, [subject.attendedClasses, subject.totalClasses, animationControls]);


  return (
    <div className="glass-card p-4 space-y-4 transition-all duration-300 hover:shadow-xl hover:border-primary/20 glowing-border">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold">{subject.name}</h3>
        </div>
        <div className="flex items-center">
          <EditSubjectDialog subject={subject}>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary w-8 h-8">
              <Edit className="w-4 h-4" />
            </Button>
          </EditSubjectDialog>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive w-8 h-8">
                <Trash2 className="w-4 h-4" />
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
            <p className="text-xl font-bold text-green-400 font-hindi" style={{fontFamily: "'Tiro Devanagari Hindi', serif"}}>
                ले बेटे मौज कर दी...!! 😎
            </p>
        </div>
      )}

      <div className="flex items-center justify-around gap-4">
        <CircularProgress percentage={percentage} target={overallTarget} animateControls={animationControls} />
        <motion.div 
            className="text-center"
            animate={animationControls}
            initial={{ scale: 1 }}
        >
            <p className="text-3xl font-bold">
              {subject.attendedClasses}/{subject.totalClasses}
            </p>
            <p className="text-sm text-muted-foreground font-semibold">Classes</p>
        </motion.div>
      </div>
      
      <div className="text-center">
        <p className={`font-bold ${statusColor}`}>{statusText}</p>
        {!isAboveTarget && <AttendanceNotification subject={subject} />}
      </div>

      <div className="flex gap-2">
        <Button onClick={() => markAttendance(subject.id, 'present')} className="flex-1 bg-green-600/20 text-green-300 border border-green-600/50 hover:bg-green-600/30 font-bold transition-all duration-300 hover:scale-105 neon-button">
          <Plus className="mr-2 h-4 w-4"/> Attended
        </Button>
        <Button onClick={() => markAttendance(subject.id, 'absent')} className="flex-1 bg-red-600/20 text-red-300 border border-red-600/50 hover:bg-red-600/30 font-bold transition-all duration-300 hover:scale-105 neon-button">
          <Minus className="mr-2 h-4 w-4"/> Missed
        </Button>
        <Button asChild variant="outline" size="icon" className="transition-all duration-300 hover:scale-105 hover:bg-accent/50">
          <Link href={`/history/${subject.id}`}>
            <History className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
