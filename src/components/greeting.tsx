'use client';

import { useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { getDailyQuote } from '@/ai/flows/daily-quote-flow';

const PeacockFeather = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-10 h-10 text-cyan-400 -translate-y-2"
  >
    <path d="M12.5 13.2a5.5 5.5 0 0 1-5.08 5.4 5.5 5.5 0 0 1-5.4-5.08A5.5 5.5 0 0 1 7.5 7.9a5.5 5.5 0 0 1 5.31.25" />
    <path d="M8.5 13.5a2.5 2.5 0 0 1-2.26 2.49 2.5 2.5 0 0 1-2.49-2.26A2.5 2.5 0 0 1 6.24 11a2.5 2.5 0 0 1 2.49.23" />
    <path d="M13.5 14.2a2 2 0 1 1-3.26-2.08" />
    <path d="M14 8.5c2.3-1.4 4.1-3.3 5-5.5" />
    <path d="M16 10c2.3-1.4 4.1-3.3 5-5.5" />
    <path d="M18 11.5c2.3-1.4 4.1-3.3 5-5.5" />
  </svg>
);


export function Greeting() {
  const { userName } = useAttendance();
  const [quote, setQuote] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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
      <div className="flex items-center">
        <h2 className="text-3xl font-bold font-hindi" style={{fontFamily: "'Tiro Devanagari Hindi', serif"}}>
          राधे राधे,
        </h2>
        <span className="text-2xl font-bold ml-2">{isClient ? userName : 'Student'}!</span>
        <PeacockFeather />
      </div>

      {quoteLoading ? (
         <p className="text-lg font-semibold text-cyan-400/80 mt-2 italic">Loading quote...</p>
      ) : (
        <p className="text-lg font-semibold text-cyan-400/80 mt-2 italic">&quot;{quote}&quot;</p>
      )}
    </div>
  );
}
