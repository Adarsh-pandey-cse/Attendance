'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAttendance } from '@/hooks/use-attendance';
import { getDailyQuote } from '@/ai/flows/daily-quote-flow';

export function Greeting() {
  const { userName } = useAttendance();
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [quote, setQuote] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(true);

  useEffect(() => {
    const updateDateTime = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning');
      } else if (hour < 18) {
        setGreeting('Good Afternoon');
      } else {
        setGreeting('Good Evening');
      }
      setCurrentDate(format(new Date(), 'EEEE, MMMM do'));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      setQuoteLoading(true);
      try {
        const response = await getDailyQuote();
        setQuote(response.quote);
      } catch (error) {
        console.error("Failed to fetch daily quote", error);
        setQuote("The best way to predict the future is to create it.");
      } finally {
        setQuoteLoading(false);
      }
    };
    fetchQuote();
  }, []);

  return (
    <div className="p-6 glass-card">
      <h2 className="text-2xl font-bold">{greeting}, {userName}!</h2>
      <p className="text-muted-foreground">{currentDate}</p>
      {quoteLoading ? (
         <p className="text-sm text-cyan-400/80 mt-2 italic">Loading quote...</p>
      ) : (
        <p className="text-sm text-cyan-400/80 mt-2 italic">&quot;{quote}&quot;</p>
      )}
    </div>
  );
}
