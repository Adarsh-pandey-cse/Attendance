
'use client';

import { AddSubjectDialog } from '@/components/add-subject-dialog';
import { Greeting } from '@/components/greeting';
import { Header } from '@/components/header';
import { OverallAttendance } from '@/components/overall-attendance';
import { SubjectCard } from '@/components/subject-card';
import { Separator } from '@/components/ui/separator';
import { useAttendance } from '@/hooks/use-attendance';
import { PlusCircle, Loader2, BookOpenCheck } from 'lucide-react';

export default function Home() {
  const { subjects, loading } = useAttendance();

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
        <Header />
        <Greeting />
        <OverallAttendance />

        <Separator className="my-6 bg-white/10" />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold tracking-tight">Subjects</h2>
            <AddSubjectDialog>
              <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors duration-300">
                <PlusCircle className="w-5 h-5" />
                <span className="font-bold">Add New</span>
              </button>
            </AddSubjectDialog>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 glass-card">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="ml-4 text-lg font-semibold">Loading Subjects...</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-16 px-4 glass-card transition-all duration-500 ease-in-out hover:shadow-2xl hover:border-primary/30">
              <BookOpenCheck className="w-16 h-16 mx-auto text-primary/70 mb-4 transition-transform duration-300 group-hover:scale-110" />
              <h3 className="text-xl font-bold text-foreground mb-2">
                Add a subject to track your attendance
              </h3>
              <p className="text-muted-foreground mt-2">
                Click the &quot;Add New&quot; button to get started.
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
