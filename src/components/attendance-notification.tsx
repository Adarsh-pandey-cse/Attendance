'use client';

import { useEffect, useState, useMemo } from 'react';
import { Subject } from '@/types';
import { calculateClassesToAttend } from '@/lib/utils';
import { attendanceTargetNotifications } from '@/ai/flows/attendance-target-notifications';
import { Sparkles } from 'lucide-react';

export function AttendanceNotification({ subject }: { subject: Subject }) {
  const [notification, setNotification] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const attendancePercentage = useMemo(() => {
    return subject.totalClasses > 0
      ? (subject.attendedClasses / subject.totalClasses) * 100
      : 0;
  }, [subject.attendedClasses, subject.totalClasses]);

  const classesNeeded = useMemo(() => {
    return calculateClassesToAttend(
      subject.attendedClasses,
      subject.totalClasses,
      subject.target
    );
  }, [subject.attendedClasses, subject.totalClasses, subject.target]);

  useEffect(() => {
    const fetchNotification = async () => {
      if (classesNeeded === Infinity) {
        setNotification('');
        return;
      }
      setIsLoading(true);
      try {
        const response = await attendanceTargetNotifications({
          subjectName: subject.name,
          attendancePercentage,
          attendanceTarget: subject.target,
          classesNeeded,
        });
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
  }, [subject.name, attendancePercentage, subject.target, classesNeeded]);

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
    <p className="text-xs text-muted-foreground mt-2 italic flex items-center justify-center gap-1">
      <Sparkles className="w-3 h-3 text-accent/70 flex-shrink-0" />
      <span>{notification}</span>
    </p>
  );
}
