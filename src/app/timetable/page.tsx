
'use client';

import { useAttendance } from '@/hooks/use-attendance';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DayOfWeek } from '@/types';
import { TimetableTab } from '@/components/timetable-tab';

const daysOfWeek: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

function getToday(): DayOfWeek {
    const dayIndex = new Date().getDay();
    // Sunday is 0, Monday is 1, etc. Match it with our array order.
    const adjustedDay = (dayIndex + 6) % 7;
    return daysOfWeek[adjustedDay];
}


export default function TimetablePage() {
  const { loading } = useAttendance();
  const today = getToday();

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">My Timetable</h1>
        </div>

        {loading ? (
            <div className="flex justify-center items-center py-16 glass-card">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="ml-4 text-lg font-semibold">Loading Timetable...</p>
            </div>
        ) : (
        <Tabs defaultValue={today} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 h-auto">
            {daysOfWeek.map(day => (
              <TabsTrigger key={day} value={day} className="capitalize text-xs md:text-sm">
                {day.slice(0,3)}
              </TabsTrigger>
            ))}
          </TabsList>
            {daysOfWeek.map(day => (
                <TabsContent key={day} value={day}>
                    <TimetableTab day={day} />
                </TabsContent>
            ))}
        </Tabs>
        )}
      </div>
    </main>
  );
}
