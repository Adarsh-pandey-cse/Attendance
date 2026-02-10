
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EditSubjectDialog } from './edit-subject-dialog';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Progress } from './ui/progress';
import { MoreVertical, Edit, Trash2, PieChart, FileDown } from 'lucide-react';
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


type SubjectCardProps = {
  subject: Subject;
};

export function SubjectCard({ subject }: SubjectCardProps) {
  const { deleteSubject, overallTarget, userName } = useAttendance();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const { theme } = useTheme();
  const { toast } = useToast();

  const percentage = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;
  
  const isLightTheme = theme === 'light';

  let progressColor = 'bg-yellow-500';
  if (percentage >= overallTarget) {
    progressColor = 'bg-primary';
  } else if (percentage < overallTarget * 0.75) { 
    progressColor = 'bg-red-500';
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

  return (
    <>
    <motion.div 
        className={cn("w-full rounded-xl p-4 transition-all duration-300", isLightTheme ? 'bg-white shadow' : 'glass-card' )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold truncate">{subject.name}</h3>
          <p className="text-xs text-muted-foreground font-semibold">{subject.attendedClasses} / {subject.totalClasses} Classes</p>
        </div>
        <div className="flex items-center gap-2 mx-4">
             <div className="text-center">
                <p className="font-bold text-lg">{percentage.toFixed(0)}%</p>
            </div>
        </div>
        
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn(isLightTheme ? 'bg-white' : 'glass-card')}>
                <DropdownMenuItem onClick={() => setIsAnalyticsOpen(true)} className="font-semibold gap-2"><PieChart/> View Analytics</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} className="font-semibold gap-2"><FileDown/> Export as PDF</DropdownMenuItem>
                <DropdownMenuSeparator />
                <EditSubjectDialog subject={subject}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="font-semibold gap-2"><Edit/> Edit</DropdownMenuItem>
                </EditSubjectDialog>
                <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive font-semibold gap-2"><Trash2/> Delete</DropdownMenuItem>
                </AlertDialogTrigger>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

       <div className="mt-3 space-y-2">
            <Progress value={percentage} className="h-2 [&>div]:" indicatorClassName={progressColor} />
        </div>

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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/80 font-bold">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>

    <AnalyticsDialog
        isOpen={isAnalyticsOpen}
        setIsOpen={setIsAnalyticsOpen}
        subject={subject}
    />
    </>
  );
}
