'use client';

import { useTheme } from '@/hooks/use-theme';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useEffect, useState } from 'react';

const DivineImage = ({ imageId, className, alt }: { imageId: string; className?: string, alt: string }) => {
  const image = PlaceHolderImages.find(img => img.id === imageId);

  if (!image) return null;

  return (
    <div className={`relative group ${className}`}>
      <div 
        className="absolute -inset-1 rounded-full bg-gradient-to-r from-yellow-400 via-red-500 to-orange-500 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200 animate-tilt"
        style={{ animation: 'glow 4s linear infinite' }}
      ></div>
      <Image
        src={image.imageUrl}
        alt={alt}
        width={100}
        height={100}
        data-ai-hint={image.imageHint}
        className="relative rounded-full border-4 border-white/50 shadow-xl"
      />
      <style jsx>{`
        @keyframes glow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const Marquee = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-primary/80 backdrop-blur-sm overflow-hidden whitespace-nowrap h-8 flex items-center z-50">
            <div className="inline-block animate-marquee text-primary-foreground font-hindi text-lg font-bold">
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
            </div>
             <div className="inline-block animate-marquee text-primary-foreground font-hindi text-lg font-bold">
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
                <span className='mx-8'>राधा राधा</span>
            </div>
            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    )
}

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
        <div className="fixed top-4 right-4 z-50">
            <DivineImage imageId="premanand-maharaj" alt="Premanand ji Maharaj" />
        </div>
        <Marquee />
    </>
  );
}
