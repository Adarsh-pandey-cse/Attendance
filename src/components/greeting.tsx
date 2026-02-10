
'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { premanandJiQuotes } from '@/lib/quotes';

export function Greeting() {
  const { userName } = useAttendance();
  const [quote, setQuote] = useState('');
  const [greetingText, setGreetingText] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();
  
  const isRadhaTheme = isClient && theme === 'radha-rani';

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(format(new Date(), 'EEEE, MMMM do'));
    setQuote(premanandJiQuotes[Math.floor(Math.random() * premanandJiQuotes.length)]);

    const getGreeting = () => {
      if (theme === 'radha-rani') {
        return 'राधा वल्लभ श्री हरिवंश,';
      }
      const currentHour = new Date().getHours();
      if (currentHour < 12) {
        return 'Good Morning,';
      } else if (currentHour < 18) {
        return 'Good Afternoon,';
      } else {
        return 'Good Evening,';
      }
    };
    setGreetingText(getGreeting());

  }, [theme]);
  
  if (!isClient) {
    return (
        <div className="text-center h-[160px] md:h-auto">
            {/* Placeholder to prevent layout shift */}
        </div>
    );
  }

  return (
    <div className="text-center">
      {isRadhaTheme && (
        <div className="mb-4">
          <Image 
            src="https://i.imgur.com/Y0bagua.jpeg" 
            alt="Radha Rani"
            width={96}
            height={96}
            priority
            className="w-24 h-24 rounded-full mx-auto border-2 border-pink-300/70 shadow-[0_0_12px_2px_rgba(251,191,36,0.5),_0_0_8px_1px_rgba(236,72,153,0.6)]"
          />
        </div>
      )}
      <h2 className={cn("text-3xl font-bold", isRadhaTheme && "font-hindi text-yellow-950")}>
          {greetingText}
      </h2>
      <div className="text-center">
          <span className={cn("text-2xl font-bold ml-2", isRadhaTheme && "text-yellow-950")}>{userName}!</span>
      </div>
      <p className="text-muted-foreground font-semibold mt-1 text-center">{currentDate}</p>
      
      {!quote ? (
          <p className="text-lg font-semibold mt-2 italic text-center text-muted-foreground">Loading quote...</p>
      ) : (
          <p className={cn("text-lg font-hindi font-bold mt-2 italic text-center text-yellow-950")}>&quot;{quote}&quot;</p>
      )}
    </div>
  );
}
