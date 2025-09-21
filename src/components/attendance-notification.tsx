'use client';

import { useState, useEffect, useMemo } from 'react';
import { Subject } from '@/types';
import { Sparkles, Star } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { quotes } from '@/lib/quotes';

// Function to get a random quote
const getRandomQuote = () => {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

export function AttendanceNotification({ subject }: { subject: Subject }) {
  const [notification, setNotification] = useState<string>('');
  const { theme } = useTheme();
  const isRadhaTheme = theme === 'radha-rani';

  useEffect(() => {
    if (isRadhaTheme) {
        setNotification(getRandomQuote());
    } else {
        setNotification('');
    }
  }, [subject.id, isRadhaTheme]);


  if (!notification && !isRadhaTheme) return null;
  
  if (!isRadhaTheme) {
      return null;
  }

  return (
    <p className={cn(
        "text-sm mt-2 italic flex items-center justify-center gap-2 text-center", 
        isRadhaTheme ? 'font-hindi font-bold text-orange-700' : 'text-yellow-400 font-semibold'
    )}>
      {isRadhaTheme ? <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" /> : <Sparkles className="w-4 h-4 text-accent/70 flex-shrink-0" />}
      <span>{notification}</span>
    </p>
  );
}
