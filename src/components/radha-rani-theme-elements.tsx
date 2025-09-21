
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

  const beadContent = Array(50).fill('राधा').map((text, index) => (
    <span key={index} className="bead">{text}</span>
  ));

  return (
    <>
      <div className="radha-rani-background"></div>

      {/* Left and Right Bead Columns */}
      <div className="bead-container left-beads">
          <div className="bead-column-up">
              {beadContent}
              {beadContent}
          </div>
      </div>
       <div className="bead-container right-beads">
          <div className="bead-column-down">
              {beadContent}
              {beadContent}
          </div>
      </div>

    </>
  );
}
