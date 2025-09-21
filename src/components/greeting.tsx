'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export function Greeting() {
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');

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

  return (
    <div className="p-6 glass-card">
      <h2 className="text-2xl font-bold">{greeting}</h2>
      <p className="text-muted-foreground">{currentDate}</p>
      <p className="text-sm text-cyan-400/80 mt-2 italic">&quot;The best way to predict the future is to create it.&quot;</p>
    </div>
  );
}
