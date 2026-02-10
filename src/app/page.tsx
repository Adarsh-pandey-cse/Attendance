'use client';

import { AddSubjectDialog } from '@/components/add-subject-dialog';
import { Greeting } from '@/components/greeting';
import { Header } from '@/components/header';
import { OverallAttendance } from '@/components/overall-attendance';
import { SubjectCard } from '@/components/subject-card';
import { Separator } from '@/components/ui/separator';
import { useAttendance } from '@/hooks/use-attendance';
import { PlusCircle, Loader2, BookOpenCheck } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { AttendanceImpactCalculator } from '@/components/attendance-impact-calculator';

export default function Home() {
  const { subjects, loading } = useAttendance();
  const { theme } = useTheme();
  
  const isLightTheme = theme === 'light';

  return (
    <main className={cn("min-h-screen", isLightTheme ? 'bg-slate-50' : '')}>
        <div className="flex justify-center">
          <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
            <Header />
            <Greeting />
            <OverallAttendance />

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h2 className="text-xl font-bold tracking-tight">Subjects</h2>
                <AddSubjectDialog>
                  <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300">
                    <PlusCircle className="w-5 h-5" />
                    <span className="font-bold text-sm">Add New</span>
                  </button>
                </AddSubjectDialog>
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : subjects.length === 0 ? (
                <div className={cn("text-center py-16 px-4 rounded-xl", isLightTheme ? 'bg-white shadow' : 'glass-card')}>
                  <BookOpenCheck className="w-16 h-16 mx-auto text-primary/70 mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    No Subjects Added
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Click &quot;Add New&quot; to start tracking your attendance.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {subjects.map((subject) => (
                    <SubjectCard key={subject.id} subject={subject} />
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-4" />
            
            <AttendanceImpactCalculator />

          </div>
        </div>
    </main>
  );
}
