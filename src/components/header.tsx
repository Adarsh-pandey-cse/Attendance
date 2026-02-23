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
import { MoreVertical, Info, Percent, CalendarClock, Shield, Moon, Sun, Palette, Star, AreaChart, Minus, Plus, FileDown, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { useAttendance } from '@/hooks/use-attendance';
import { Slider } from '@/components/ui/slider';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { generateOverallPdf } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { subjects, overallTarget, setOverallTarget, userName, profilePicture } = useAttendance();
  const { theme, setTheme } = useTheme();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isLightTheme = isClient && theme === 'light';
  
  const handleTargetChange = (value: number) => {
      if (value >= 1 && value <= 100) {
          setOverallTarget(value);
      }
  }

  const handleExportAll = () => {
    if (!subjects || subjects.length === 0) {
        toast({
            title: 'Export Failed',
            description: 'No subject data available to export.',
            variant: 'destructive'
        });
        return;
    }
    try {
        generateOverallPdf(subjects, userName || 'Student', profilePicture || null);
        toast({ title: 'PDF Exported', description: `Overall attendance report has been generated.` });
    } catch(e) {
        console.error(e);
        toast({ title: 'Export Failed', description: 'There was an error generating the PDF.', variant: 'destructive' });
    }
  }


  return (
    <header className="flex flex-col gap-4 items-center py-2">
        <Logo />
        <div className="flex justify-between items-center w-full">
            <ProfileSection />
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={cn(isLightTheme ? 'bg-white' : 'glass-card', "w-64")}>
                <div className="p-2 space-y-2">
                    <label htmlFor="overall-target-input" className="flex items-center text-sm font-bold px-2">
                        <Percent className="w-4 h-4 mr-2" />
                        <span>Overall Target</span>
                    </label>
                    <div className="flex items-center justify-center gap-2 px-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full"
                            onClick={() => handleTargetChange((overallTarget || 75) - 1)}
                            disabled={(overallTarget || 75) <= 1}
                        >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease target</span>
                        </Button>
                        <div className="relative w-full">
                            <Input
                                id="overall-target-input"
                                type="number"
                                className="h-8 w-full text-center font-bold pr-7"
                                value={overallTarget || ''}
                                onFocus={(e) => e.target.select()}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setOverallTarget(0); // Allow temporary empty state
                                    } else {
                                        const numValue = parseInt(value, 10);
                                        if (!isNaN(numValue) && numValue <= 100) {
                                            handleTargetChange(numValue);
                                        }
                                    }
                                }}
                                onBlur={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (isNaN(value) || value < 1) {
                                        setOverallTarget(75); // Reset to default if invalid
                                    }
                                }}
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground pointer-events-none">%</span>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-full"
                            onClick={() => handleTargetChange((overallTarget || 75) + 1)}
                            disabled={(overallTarget || 75) >= 100}
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase target</span>
                        </Button>
                    </div>
                    <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[overallTarget || 75]}
                        onValueChange={(value) => handleTargetChange(value[0])}
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
                <Link href="/analytics" className="flex items-center gap-2 cursor-pointer font-semibold">
                    <AreaChart className="w-4 h-4" />
                    <span>Analytics</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/history/daily" className="flex items-center gap-2 cursor-pointer font-semibold">
                        <CalendarDays className="w-4 h-4" />
                        <span>Daily History</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                <Link href="/timetable" className="flex items-center gap-2 cursor-pointer font-semibold">
                    <CalendarClock className="w-4 h-4" />
                    <span>Timetable</span>
                </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportAll} className="flex items-center gap-2 cursor-pointer font-semibold">
                    <FileDown className="w-4 h-4" />
                    <span>Export as PDF</span>
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
