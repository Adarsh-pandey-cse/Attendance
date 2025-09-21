
'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { getDailyQuote } from '@/ai/flows/daily-quote-flow';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';

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

  useEffect(() => {
    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const response = await getDailyQuote(theme);
        setQuote(response.quote);
      } catch (error) {
        console.error("Failed to fetch daily quote", error);
        setQuote("The best way to predict the future is to create it.");
      } finally {
        setQuoteLoading(false);
      }
    };
    fetchQuote();
  }, [theme]);
  
  const greetingText = isClient && theme === 'radha-rani' ? 'राधा वल्लभ श्री हरिवंश,' : 'Hello,';
  
  let quoteColorClass = 'text-yellow-300';
  if (isClient && theme === 'radha-rani') {
    quoteColorClass = 'text-orange-700';
  }

  if (isClient && theme === 'radha-rani') {
    return (
      <div>
        <h2 className="text-3xl font-bold font-hindi text-center" style={{fontFamily: "'Tiro Devanagari Hindi', serif"}}>
          {greetingText}
        </h2>
        <div className="text-center">
            <span className="text-2xl font-bold ml-2">{isClient ? userName : 'Student'}!</span>
        </div>
        {isClient && <p className="text-muted-foreground font-semibold mt-1 text-center">{currentDate}</p>}

        {quoteLoading ? (
            <p className="text-lg font-semibold text-yellow-300/80 mt-2 italic text-center">Loading quote...</p>
        ) : (
            <p className={`text-lg font-semibold ${quoteColorClass} mt-2 italic text-center`}>&quot;{quote}&quot;</p>
        )}
      </div>
    )
  }


  return (
    <div className="glass-card p-6">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold font-hindi" style={{fontFamily: "'Tiro Devanagari Hindi', serif"}}>
          {greetingText}
        </h2>
        <span className="text-2xl font-bold ml-2">{isClient ? userName : 'Student'}!</span>
      </div>
       {isClient && <p className="text-muted-foreground font-semibold mt-1">{currentDate}</p>}

      {quoteLoading ? (
         <p className="text-lg font-semibold text-yellow-300/80 mt-2 italic">Loading quote...</p>
      ) : (
        <p className={`text-lg font-semibold ${quoteColorClass} mt-2 italic`}>&quot;{quote}&quot;</p>
      )}
    </div>
  );
}
