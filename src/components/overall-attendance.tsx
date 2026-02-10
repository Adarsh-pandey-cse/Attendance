
'use client';

import { useMemo } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/use-theme';
import { cn, calculateClassesToAttend, calculateClassesToBunk } from '@/lib/utils';
import { StreakDisplay } from './streak-display';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, TrendingDown } from 'lucide-react';

const OverallCircularProgress = ({ percentage, target }: { percentage: number, target: number }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-yellow-400';
    if (percentage >= target) {
        colorClass = 'text-primary';
    } else if (percentage < target * 0.75) {
        colorClass = 'text-red-500';
    }

    return (
        <div className="relative w-36 h-36">
            <svg className="w-full h-full" viewBox="0 0 140 140">
                <circle
                    className="text-gray-600/30"
                    strokeWidth="12"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="70"
                    cy="70"
                />
                <motion.circle
                    className={cn(colorClass, "transition-colors duration-300")}
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="70"
                    cy="70"
                    transform="rotate(-90 70 70)"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1, ease: "circOut" }}
                />
            </svg>
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
            >
                <span className="text-2xl font-bold">{percentage.toFixed(1)}%</span>
                <span className="text-sm font-semibold text-muted-foreground mt-1">Overall</span>
            </motion.div>
        </div>
    );
};

export function OverallAttendance() {
    const { subjects, overallTarget } = useAttendance();
    const { theme } = useTheme();

    const { overallPercentage, totalAttended, totalClasses } = useMemo(() => {
        const totalAttended = subjects.reduce((acc, subject) => acc + subject.attendedClasses, 0);
        const totalClasses = subjects.reduce((acc, subject) => acc + subject.totalClasses, 0);
        const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
        return { overallPercentage, totalAttended, totalClasses };
    }, [subjects]);

    const target = overallTarget || 75;
    const classesToAttend = calculateClassesToAttend(totalAttended, totalClasses, target);
    const classesToBunk = calculateClassesToBunk(totalAttended, totalClasses, target);

    const isLightTheme = theme === 'light';

    if (subjects.length === 0) {
        return null;
    }

    return (
        <motion.div
            className={cn("p-4 md:p-6 flex flex-col items-center justify-around gap-4 rounded-xl", isLightTheme ? 'bg-white shadow' : 'glass-card')}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="flex flex-col md:flex-row items-center justify-around w-full gap-4">
                <div className="flex flex-col items-center">
                    <OverallCircularProgress percentage={overallPercentage} target={target} />
                    <p className="text-lg font-bold mt-2 text-foreground">{totalAttended} <span className="font-semibold text-muted-foreground">/ {totalClasses} classes</span></p>
                </div>
                <div className="flex flex-col items-center">
                     <h2 className="text-xl font-bold tracking-tight mb-2">Weekly Streak</h2>
                     <StreakDisplay />
                </div>
            </div>

            {totalClasses > 0 && (
                <>
                    <Separator className="my-2 bg-border/40" />
                    <div className="text-center text-sm font-semibold text-muted-foreground w-full">
                        {overallPercentage < target ? (
                            <p className="flex items-center justify-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-accent" />
                                Attend the next <span className="text-foreground font-bold">{classesToAttend}</span> class{classesToAttend !== 1 ? 'es' : ''} to reach {target}%.
                            </p>
                        ) : (
                            <p className="flex items-center justify-center gap-1.5">
                                <TrendingDown className="w-4 h-4 text-primary" />
                                You can miss <span className="text-foreground font-bold">{classesToBunk}</span> more class{classesToBunk !== 1 ? 'es' : ''} and stay above {target}%.
                            </p>
                        )}
                    </div>
                </>
            )}
        </motion.div>
    );
}
