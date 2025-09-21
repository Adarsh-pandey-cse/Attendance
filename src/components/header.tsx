
'use client';

import { Logo } from '@/components/logo';
import { ProfileSection } from '@/components/profile-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Info, Percent, CalendarClock, Bug, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAttendance } from '@/hooks/use-attendance';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

export function Header() {
  const { overallTarget, setOverallTarget } = useAttendance();

  return (
    <header className="flex justify-between items-center py-2">
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
             <DropdownMenuItem asChild>
              <Link href="/timetable" className="flex items-center gap-2 cursor-pointer font-semibold">
                <CalendarClock className="w-4 h-4" />
                <span>Timetable</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href="/report-bug" className="flex items-center gap-2 cursor-pointer font-semibold">
                <Bug className="w-4 h-4" />
                <span>Report a Bug</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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
    </header>
  );
}
