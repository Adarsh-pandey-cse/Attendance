
'use client';
import { useAttendance } from '@/hooks/use-attendance';
import { Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export function StreakDisplay() {
    const { currentStreak, longestStreak } = useAttendance();

    if (currentStreak === undefined || longestStreak === undefined) {
        return null; // or a loading skeleton
    }

    return (
        <div className="flex gap-4 md:gap-6 justify-center">
            <motion.div
                key={currentStreak}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="flex flex-col items-center p-2 rounded-lg"
            >
                <div className="flex items-center gap-2">
                    <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}/>
                    <span className="text-2xl font-bold">{currentStreak}</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Current Streak</p>
            </motion.div>

            <motion.div 
                className="flex flex-col items-center p-2 rounded-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 15 }}
            >
                 <div className="flex items-center gap-2">
                    <Star className={`w-6 h-6 ${longestStreak > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`}/>
                    <span className="text-2xl font-bold">{longestStreak}</span>
                </div>
                <p className="text-xs font-semibold text-muted-foreground">Longest Streak</p>
            </motion.div>
        </div>
    );
}
