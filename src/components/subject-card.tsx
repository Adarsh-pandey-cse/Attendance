'use client';

import { Subject } from '@/types';
import { Button } from './ui/button';
import { useAttendance } from '@/hooks/use-attendance';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';
import { MoreVertical, Edit, Trash2, PieChart, FileDown, History, Check, X, TrendingUp, TrendingDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AnalyticsDialog } from './analytics-dialog';
import { generatePdf } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/use-toast';
import { calculateClassesToAttend, calculateClassesToBunk } from '@/lib/utils';
import Link from 'next/link';
import { EditSubjectDialog } from './edit-subject-dialog';


type SubjectCardProps = {
  subject: Subject;
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const { deleteSubject, markAttendance, overallTarget, userName } = useAttendance();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const { theme } = useTheme();
  const { toast } = useToast();

  const percentage = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  
  const isLightTheme = theme === 'light';

  let progressColor = 'bg-yellow-400';
  if (percentage >= (overallTarget || 75)) {
    progressColor = 'bg-gradient-to-r from-green-500 to-sky-400';
  } else if (percentage < (overallTarget || 75) * 0.75) { 
    progressColor = 'bg-red-400';
  }

  const handleDelete = () => {
    deleteSubject(subject.id);
    setIsDeleteDialogOpen(false);
  }

  const handleExport = () => {
    try {
        generatePdf(subject, userName || 'Student');
        toast({ title: 'PDF Exported', description: `${subject.name} attendance has been exported.` });
    } catch(e) {
        console.error(e);
        toast({ title: 'Export Failed', description: 'There was an error generating the PDF.', variant: 'destructive' });
    }
  }

  const classesToAttend = calculateClassesToAttend(subject.attendedClasses, subject.totalClasses, overallTarget || 75);
  const classesToBunk = calculateClassesToBunk(subject.attendedClasses, subject.totalClasses, overallTarget || 75);

  return (
    <>
    <motion.div 
        className={cn("w-full rounded-lg p-4 transition-all duration-300", isLightTheme ? 'bg-white shadow' : 'glass-card' )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold truncate">{subject.name}</h3>
          <p className="text-xs text-muted-foreground font-semibold">{subject.attendedClasses} / {subject.totalClasses} Classes</p>
        </div>
        <div className="flex items-center gap-2">
             <div className="text-center">
                <motion.p
                    key={`${subject.attendedClasses}-${subject.totalClasses}`}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="font-bold text-lg"
                >
                    {percentage.toFixed(0)}%
                </motion.p>
            </div>
        
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn(isLightTheme ? 'bg-white' : 'glass-card')}>
                    <DropdownMenuItem asChild className="font-semibold gap-2 cursor-pointer">
                        <Link href={`/history/${subject.id}`}>
                            <History/> View History
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsAnalyticsOpen(true)} className="font-semibold gap-2 cursor-pointer"><PieChart/> View Analytics</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExport} className="font-semibold gap-2 cursor-pointer"><FileDown/> Export as PDF</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <EditSubjectDialog subject={subject}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="font-semibold gap-2 cursor-pointer"><Edit/> Edit</DropdownMenuItem>
                    </EditSubjectDialog>
                    <DropdownMenuItem onSelect={() => setIsDeleteDialogOpen(true)} className="text-destructive focus:text-destructive-foreground focus:bg-destructive font-semibold gap-2 cursor-pointer"><Trash2/> Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>

       <div className="mt-3 space-y-2">
            <Progress value={percentage} className="h-1.5" indicatorClassName={progressColor} />
            {subject.totalClasses > 0 && (
                <div className="text-center text-xs font-semibold text-muted-foreground">
                {percentage < (overallTarget || 75) ? (
                    <p className="flex items-center justify-center gap-1">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        Attend the next <span className="text-foreground font-bold">{classesToAttend}</span> class{classesToAttend !== 1 ? 'es' : ''} to reach {overallTarget || 75}%.
                    </p>
                ) : (
                    <p className="flex items-center justify-center gap-1">
                        <TrendingDown className="w-4 h-4 text-yellow-400" />
                        You can miss <span className="text-foreground font-bold">{classesToBunk}</span> class{classesToBunk !== 1 ? 'es' : ''} and stay above {overallTarget || 75}%.
                    </p>
                )}
            </div>
            )}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
            <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                <Button onClick={() => markAttendance(subject.id, 'present')} size="sm" className="w-full font-bold bg-green-500 text-white hover:bg-green-600">
                    <Check className="mr-2 h-4 w-4" /> Present
                </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.1 }}>
                <Button onClick={() => markAttendance(subject.id, 'absent')} size="sm" variant="destructive" className="w-full font-bold">
                    <X className="mr-2 h-4 w-4" /> Absent
                </Button>
            </motion.div>
        </div>

    </motion.div>

    <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle className="font-bold">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This will permanently delete the subject &quot;{subject.name}&quot; and all its attendance history. This action cannot be undone.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="font-bold">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>

    <AnalyticsDialog
        isOpen={isAnalyticsOpen}
        setIsOpen={setIsAnalyticsOpen}
        subject={subject}
    />
    </>
  );
}
