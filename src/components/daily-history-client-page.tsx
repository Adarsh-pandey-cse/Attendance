'use client';

import { useAttendance } from '@/hooks/use-attendance';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { useMemo } from 'react';

// A new combined log type
type CombinedAttendanceLog = {
  id: string;
  timestamp: number;
  status: 'present' | 'absent';
  subjectName: string;
  subjectId: string;
};

type GroupedLogs = {
  [key: string]: CombinedAttendanceLog[];
};

export function DailyHistoryClientPage() {
  const { subjects, loading } = useAttendance();

  const allLogs = useMemo((): CombinedAttendanceLog[] => {
    if (loading || subjects.length === 0) return [];
    
    return subjects.flatMap(subject => 
      subject.history.map(log => ({
        ...log,
        subjectName: subject.name,
        subjectId: subject.id,
      }))
    );
  }, [subjects, loading]);


  const groupedLogs = useMemo(() => {
    return allLogs.reduce((acc: GroupedLogs, log) => {
        const logDate = new Date(log.timestamp); 
        const dateKey = format(logDate, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(log);
        return acc;
      }, {});
  }, [allLogs]);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const formatDateGroup = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM do, yyyy');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 glass-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-lg font-semibold">Loading History...</p>
      </div>
    );
  }

  return (
    <Card className="glass-card overflow-hidden">
      <CardContent className="p-4">
        {allLogs.length === 0 ? (
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
                <ul className="space-y-3 border-l-2 border-primary/20 ml-2 pl-4">
                  {groupedLogs[date].sort((a,b) => b.timestamp - a.timestamp).map(log => (
                    <li key={log.id} className="flex items-center justify-between bg-secondary/20 p-2 rounded-md">
                        <div className="flex items-center gap-3">
                            {log.status === 'present' ? (
                                <CheckCircle className="w-5 h-5 text-green-400"/>
                            ) : (
                                <XCircle className="w-5 h-5 text-red-400"/>
                            )}
                            <div>
                                <p className="font-bold capitalize">{log.subjectName}</p>
                                <p className="text-xs text-muted-foreground font-semibold">{log.status}</p>
                            </div>
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
  );
}
