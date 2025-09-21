'use client';

import { Logo } from '@/components/logo';
import { ProfileSection } from '@/components/profile-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Info, Percent, CalendarClock, Shield, Moon, Sun, Palette, Star, Bug } from 'lucide-react';
import Link from 'next/link';
import { useAttendance } from '@/hooks/use-attendance';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { BugReportDialog } from './bug-report-dialog';

export function Header() {
  const { overallTarget, setOverallTarget } = useAttendance();
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isRadhaTheme = isClient && theme === 'radha-rani';

  return (
    <header className={cn("flex justify-between items-center py-2", isRadhaTheme && 'homepage-section rounded-2xl px-4')}>
      <Logo />
      <div className="flex items-center gap-4">
        <ProfileSection />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card w-56">
             <div className="p-2">
                <label htmlFor="overall-target" className="flex items-center justify-between text-sm font-bold mb-2 px-2">
                  <div className="flex items-center gap-2">
                     <Percent className="w-4 h-4" />
                    <span>Overall Target</span>
                  </div>
                  <span className="font-bold text-primary">{overallTarget}%</span>
                </label>
                <Slider
                  id="overall-target"
                  min={1}
                  max={100}
                  step={1}
                  value={[overallTarget]}
                  onValueChange={(value) => setOverallTarget(value[0])}
                />
            </div>
            <DropdownMenuSeparator />
             <div className='p-2'>
                <label className="flex items-center justify-between text-sm font-bold mb-2 px-2">
                    <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        <span>Theme</span>
                    </div>
                </label>
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light" className='font-semibold'>
                        <Sun className="mr-2" /> Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark" className='font-semibold'>
                        <Moon className="mr-2" /> Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="radha-rani" className='font-semibold'>
                        <Star className="mr-2 text-yellow-500" /> Radha Rani
                    </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
            </div>
             <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
              <Link href="/timetable" className="flex items-center gap-2 cursor-pointer font-semibold">
                <CalendarClock className="w-4 h-4" />
                <span>Timetable</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setIsBugReportOpen(true)} className="flex items-center gap-2 cursor-pointer font-semibold">
                <Bug className="w-4 h-4" />
                <span>Report a Bug</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2 cursor-pointer font-semibold">
                <Shield className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/developer-info" className="flex items-center gap-2 cursor-pointer font-semibold">
                <Info className="w-4 h-4" />
                <span>Developer Info</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <BugReportDialog isOpen={isBugReportOpen} setIsOpen={setIsBugReportOpen} />
    </header>
  );
}
