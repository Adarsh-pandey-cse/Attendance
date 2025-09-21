'use client';

import { useEffect, useState, useMemo } from 'react';
import { Subject } from '@/types';
import { calculateClassesToAttend } from '@/lib/utils';
import { attendanceTargetNotifications } from '@/ai/flows/attendance-target-notifications';
import { radhaThemeAttendanceNotification } from '@/ai/flows/radha-theme-notification-flow';
import { Sparkles, Star } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

export function AttendanceNotification({ subject }: { subject: Subject }) {
  const [notification, setNotification] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { overallTarget } = useAttendance();
  const { theme } = useTheme();
  const isRadhaTheme = theme === 'radha-rani';

  const attendancePercentage = useMemo(() => {
    return subject.totalClasses > 0
      ? (subject.attendedClasses / subject.totalClasses) * 100
      : 0;
  }, [subject.attendedClasses, subject.totalClasses]);

  const classesNeeded = useMemo(() => {
    return calculateClassesToAttend(
      subject.attendedClasses,
      subject.totalClasses,
      overallTarget
    );
  }, [subject.attendedClasses, subject.totalClasses, overallTarget]);

  useEffect(() => {
    const fetchNotification = async () => {
      if (classesNeeded === Infinity) {
        setNotification('');
        return;
      }
      setIsLoading(true);
      try {
        let response;
        if (isRadhaTheme) {
          response = await radhaThemeAttendanceNotification({
            subjectName: subject.name,
            attendancePercentage,
          });
        } else {
          response = await attendanceTargetNotifications({
            subjectName: subject.name,
            attendancePercentage,
            attendanceTarget: overallTarget,
            classesNeeded,
          });
        }
        setNotification(response.notificationMessage);
      } catch (error) {
        console.error('Failed to get AI notification:', error);
        setNotification('');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchNotification, 500); // Debounce
    return () => clearTimeout(timer);
  }, [subject.name, attendancePercentage, overallTarget, classesNeeded, isRadhaTheme]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
        <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
        <span>Generating advice...</span>
      </div>
    );
  }

  if (!notification) return null;

  return (
    <p className={cn("text-xs mt-2 italic flex items-center justify-center gap-1", isRadhaTheme ? 'font-hindi font-bold text-orange-700' : 'text-muted-foreground')}>
      {isRadhaTheme ? <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" /> : <Sparkles className="w-3 h-3 text-accent/70 flex-shrink-0" />}
      <span>{notification}</span>
    </p>
  );
}
