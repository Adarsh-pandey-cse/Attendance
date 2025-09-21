'use client';

import { Logo } from '@/components/logo';
import { ProfileSection } from '@/components/profile-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Info } from 'lucide-react';
import Link from 'next/link';

export function Header() {
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
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem asChild>
              <Link href="/developer-info" className="flex items-center gap-2 cursor-pointer">
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
