'use client';

import { useTheme } from '@/hooks/use-theme';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export function RadhaRaniThemeElements() {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || theme !== 'radha-rani') {
    return null;
  }

  return (
    <>
        <div className="radha-rani-background"></div>
        <div className="fixed bottom-0 left-0 w-full h-16 overflow-hidden z-50 pointer-events-none">
            <div className="absolute top-0 w-full h-full bg-gradient-to-t from-background via-background/70 to-transparent"></div>
            <motion.div 
              className="absolute whitespace-nowrap"
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
                <p className="font-hindi text-3xl bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 bg-clip-text text-transparent" style={{fontFamily: "'Tiro Devanagari Hindi', serif"}}>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                </p>
            </motion.div>
             <div className="absolute bottom-0 w-full h-full bg-gradient-to-b from-background via-background/70 to-transparent"></div>
        </div>
    </>
  );
}
