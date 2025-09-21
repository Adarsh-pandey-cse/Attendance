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
        <div className="fixed bottom-2 left-0 w-full h-12 overflow-hidden z-50 pointer-events-none yellow-stripped-background py-1">
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
                <p className="font-hindi text-2xl font-bold bg-gradient-to-r from-pink-500 to-black bg-clip-text text-transparent" style={{fontFamily: "'Tiro Devanagari Hindi', serif"}}>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                    <span className='mx-8'>राधा राधा</span>
                </p>
            </motion.div>
        </div>
    </>
  );
}
