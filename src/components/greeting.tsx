
'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { getDailyQuote } from '@/ai/flows/daily-quote-flow';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

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
    fetchQuote();
  }, [isClient]);
  
  const getGreeting = () => {
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
  
  const greetingText = isClient ? getGreeting() : 'Hello,';
  
  let quoteColorClass = 'text-yellow-400';
  if (isRadhaTheme) {
    quoteColorClass = 'text-orange-700';
  }

  return (
    <div className={cn("text-center", isRadhaTheme && "homepage-section")}>
      <h2 className="text-3xl font-bold font-hindi text-center" style={{fontFamily: isRadhaTheme ? "'Tiro Devanagari Hindi', serif" : 'inherit'}}>
          {greetingText}
      </h2>
      <div className="text-center">
          <span className="text-2xl font-bold ml-2">{isClient ? userName : 'Student'}!</span>
      </div>
      {isClient && <p className="text-muted-foreground font-semibold mt-1 text-center">{currentDate}</p>}

      {isClient && (
        <>
          {quoteLoading ? (
              <p className="text-lg font-semibold text-yellow-300/80 mt-2 italic text-center">Loading quote...</p>
          ) : (
              <p className={`text-lg font-semibold ${quoteColorClass} mt-2 italic text-center font-hindi`}>&quot;{quote}&quot;</p>
          )}
        </>
      )}
    </div>
  );
}
