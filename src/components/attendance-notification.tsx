
'use client';

import { useState, useEffect } from 'react';
import { Subject } from '@/types';
import { Star } from 'lucide-react';
import { lowAttendanceQuotes } from '@/lib/quotes';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';


// Function to get a random quote
const getRandomQuote = () => {
    return lowAttendanceQuotes[Math.floor(Math.random() * lowAttendanceQuotes.length)];
}

export function AttendanceNotification({ subject }: { subject: Subject }) {
  const [notification, setNotification] = useState<string>('');
  const { theme } = useTheme();


  useEffect(() => {
    setNotification(getRandomQuote());
  }, [subject.id]);

  if (!notification) return null;

  return (
    <p className={cn(
        "text-sm mt-2 italic flex items-center justify-center gap-2 text-center font-hindi font-bold motivational-quote"
    )}>
      <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
      <span>{notification}</span>
    </p>
  );
}
