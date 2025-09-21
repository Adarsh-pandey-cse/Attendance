
'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { getDailyQuote } from '@/ai/flows/daily-quote-flow';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Greeting() {
  const { userName } = useAttendance();
  const [quote, setQuote] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setIsClient(true);
    setCurrentDate(format(new Date(), 'EEEE, MMMM do'));
  }, []);

  const isRadhaTheme = isClient && theme === 'radha-rani';

  useEffect(() => {
    if (!isClient) return;

    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const response = await getDailyQuote({});
        if (response?.quote) {
          setQuote(response.quote);
        } else {
          setQuote("The best way to predict the future is to create it.");
        }
      } catch (error) {
        console.error("Failed to fetch daily quote", error);
        setQuote("The best way to predict the future is to create it.");
      } finally {
        setQuoteLoading(false);
      }
    };

    if (isRadhaTheme) {
        fetchQuote();
    } else {
        setQuote("The best way to predict the future is to create it.");
        setQuoteLoading(false);
    }
  }, [isClient, isRadhaTheme]);
  
  const getGreeting = () => {
    if (!isClient) return 'Hello,';
    if (isRadhaTheme) {
      return 'राधा वल्लभ श्री हरिवंश,';
    }
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return 'Good morning,';
    } else if (currentHour < 18) {
      return 'Good afternoon,';
    } else {
      return 'Good evening,';
    }
  };
  
  const greetingText = getGreeting();
  
  const quoteColorClass = isRadhaTheme ? 'text-orange-700' : 'text-yellow-400';

  if (!isClient) {
    return (
        <div className="text-center h-[160px] md:h-auto">
            {/* Placeholder to prevent layout shift */}
        </div>
    );
  }

  return (
    <div className={cn("text-center", isRadhaTheme && "homepage-section")}>
      {isRadhaTheme && (
        <div className="mb-4">
          <Image 
            src="https://i.postimg.cc/mD2tg5sD/radha-rani-dp.png" 
            alt="Radha Rani"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full mx-auto border-2 border-pink-300/70 shadow-[0_0_12px_2px_rgba(251,191,36,0.5),_0_0_8px_1px_rgba(236,72,153,0.6)]"
          />
        </div>
      )}
      <h2 className={cn("text-3xl font-bold", isRadhaTheme && "font-hindi")}>
          {greetingText}
      </h2>
      <div className="text-center">
          <span className="text-2xl font-bold ml-2">{userName}!</span>
      </div>
      <p className="text-muted-foreground font-semibold mt-1 text-center">{currentDate}</p>

      {isRadhaTheme && (
        <>
          {quoteLoading ? (
              <p className="text-lg font-semibold text-yellow-300/80 mt-2 italic text-center">Loading quote...</p>
          ) : (
              <p className={cn("text-lg font-semibold mt-2 italic text-center", quoteColorClass, isRadhaTheme && "font-hindi")}>&quot;{quote}&quot;</p>
          )}
        </>
      )}
    </div>
  );
}
