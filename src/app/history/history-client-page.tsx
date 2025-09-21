
'use client';

import { useAttendance } from '@/hooks/use-attendance';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { AttendanceLog } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

type GroupedLogs = {
  [key: string]: AttendanceLog[];
};

type HistoryClientPageProps = {
    subjectId: string;
}

export function HistoryClientPage({ subjectId }: HistoryClientPageProps) {
  const { getSubjectById } = useAttendance();
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-lg font-bold">Subject not found.</p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    );
  }

  const groupedLogs = subject.history.reduce((acc: GroupedLogs, log) => {
    const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const formatDateGroup = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM do, yyyy');
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <div className='flex-1'>
            <h1 className="text-2xl font-bold tracking-tight">{subject.name}</h1>
            <p className="text-sm font-semibold text-muted-foreground">Attendance History</p>
          </div>
        </div>

        <Card className="glass-card overflow-hidden">
          <CardContent className="p-4">
            {subject.history.length === 0 ? (
               <div className="text-center py-16 px-4">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground"/>
                <h3 className="text-lg font-bold text-foreground mt-4">No History Yet</h3>
                <p className="text-muted-foreground mt-2">
                  Mark attendance on the main screen to see the history here.
                </p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {sortedDates.map(date => (
                  <div key={date}>
                    <h3 className="font-bold text-lg mb-2 sticky top-0 bg-card/80 backdrop-blur-sm py-2">{formatDateGroup(date)}</h3>
                    <ul className="space-y-2 border-l-2 border-primary/20 ml-2 pl-4">
                      {groupedLogs[date].sort((a,b) => b.timestamp - a.timestamp).map(log => (
                        <li key={log.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {log.status === 'present' ? (
                                    <CheckCircle className="w-5 h-5 text-green-400"/>
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-400"/>
                                )}
                                <span className="font-bold capitalize">{log.status}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-semibold">
                                {format(new Date(log.timestamp), 'h:mm a')}
                            </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
