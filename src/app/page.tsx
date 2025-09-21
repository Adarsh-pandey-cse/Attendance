'use client';

import { AddSubjectDialog } from '@/components/add-subject-dialog';
import { Greeting } from '@/components/greeting';
import { Header } from '@/components/header';
import { SubjectCard } from '@/components/subject-card';
import { useAttendance } from '@/hooks/use-attendance';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const { subjects } = useAttendance();

  return (
    <main className="flex justify-center min-h-screen bg-gradient-to-b from-background to-slate-900/50">
      <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
        <Header />
        <Greeting />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Subjects</h2>
            <AddSubjectDialog>
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                <PlusCircle className="w-5 h-5" />
                <span className="font-bold">Add New</span>
              </button>
            </AddSubjectDialog>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-16 px-4 glass-card">
              <h3 className="text-lg font-bold text-foreground">Welcome to AttendX!</h3>
              <p className="text-muted-foreground mt-2">
                You haven&apos;t added any subjects yet.
              </p>
              <p className="text-muted-foreground mt-1">
                Click &quot;Add New&quot; to get started.
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
      </div>
    </main>
  );
}
