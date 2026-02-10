'use client';

import { useTheme } from '@/hooks/use-theme';
import { useEffect, useState } from 'react';

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
    </>
  );
}
