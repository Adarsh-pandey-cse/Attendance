
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { motion } from 'framer-motion';
import { calculateClassesToAttend, calculateClassesToBunk } from '@/lib/utils';
import { useTheme } from '@/hooks/use-theme';

const OverallCircularProgress = ({ percentage, target }: { percentage: number, target: number }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    let colorClass = 'text-yellow-400';
    if (percentage >= target) {
        colorClass = 'text-green-400';
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
                    className={`${colorClass} transition-colors duration-300`}
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
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const { totalAttended, totalClasses, overallPercentage, needed, bunkable } = useMemo(() => {
        const totalAttended = subjects.reduce((acc, subject) => acc + subject.attendedClasses, 0);
        const totalClasses = subjects.reduce((acc, subject) => acc + subject.totalClasses, 0);
        const overallPercentage = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;
        const needed = calculateClassesToAttend(totalAttended, totalClasses, overallTarget);
        const bunkable = calculateClassesToBunk(totalAttended, totalClasses, overallTarget);
        return { totalAttended, totalClasses, overallPercentage, needed, bunkable };
    }, [subjects, overallTarget]);

    let statusText, statusColor;
    if (overallPercentage < overallTarget) {
        statusText = `Attend the next ${needed} class${needed !== 1 ? 'es' : ''} to reach your target.`;
        statusColor = "text-red-400";
    } else {
        statusText = `You can safely miss the next ${bunkable} class${bunkable !== 1 ? 'es' : ''}.`;
        statusColor = "text-cyan-400";
    }
     if (needed === Infinity) {
        statusText = "Target is unreachable. You may need to edit your attendance data.";
        statusColor = "text-red-500 font-bold";
    }


    if (subjects.length === 0) {
        return null;
    }

    const containerClasses = isClient && theme === 'radha-rani'
        ? "p-6 flex flex-col md:flex-row items-center justify-around gap-6"
        : "glass-card p-6 flex flex-col md:flex-row items-center justify-around gap-6";

    return (
        <motion.div
            className={containerClasses}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <OverallCircularProgress percentage={overallPercentage} target={overallTarget} />
            <motion.div 
                className="text-center md:text-left"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <h2 className="text-2xl font-bold tracking-tight">Your Progress</h2>
                <p className="text-muted-foreground font-semibold">A summary of all your subjects.</p>
                 <p className={`text-base font-semibold mt-3 ${statusColor}`}>
                    {statusText}
                </p>
                <div className="mt-4 flex gap-6 justify-center md:justify-start">
                    <div>
                        <p className="text-3xl font-extrabold text-green-400">{totalAttended}</p>
                        <p className="text-sm font-semibold text-muted-foreground">Classes Attended</p>
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold">{totalClasses}</p>
                        <p className="text-sm font-semibold text-muted-foreground">Total Classes</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
