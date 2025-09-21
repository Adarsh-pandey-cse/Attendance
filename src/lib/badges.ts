import { Badge, Subject } from '@/types';
import { Book, Target, TrendingUp, Award } from 'lucide-react';

export const BADGE_DEFINITIONS: Omit<Badge, 'achieved'>[] = [
    {
        id: 'perfect-start',
        name: 'Perfect Start',
        description: 'Achieve 100% attendance in any subject.',
        icon: Award,
    },
    {
        id: 'high-flyer-90',
        name: 'High-Flyer (90%)',
        description: 'Maintain 90% or higher attendance in a subject.',
        icon: Target,
    },
    {
        id: 'over-achiever-95',
        name: 'Over-Achiever (95%)',
        description: 'Maintain 95% or higher attendance in a subject.',
        icon: TrendingUp,
    },
    {
        id: 'first-subject',
        name: 'First Subject',
        description: 'You added your first subject to track!',
        icon: Book,
    }
];

export const checkBadges = (subjects: Subject[]): Badge[] => {
    const earnedBadges: Badge[] = [];

    if (subjects.length > 0 && !earnedBadges.some(b => b.id === 'first-subject')) {
        const badge = BADGE_DEFINITIONS.find(b => b.id === 'first-subject');
        if(badge) earnedBadges.push({ ...badge, achieved: true });
    }

    subjects.forEach(subject => {
        const percentage = subject.totalClasses > 0 ? (subject.attendedClasses / subject.totalClasses) * 100 : 0;

        if (percentage === 100 && !earnedBadges.some(b => b.id === 'perfect-start')) {
            const badge = BADGE_DEFINITIONS.find(b => b.id === 'perfect-start');
            if(badge) earnedBadges.push({ ...badge, achieved: true });
        }
        if (percentage >= 90 && !earnedBadges.some(b => b.id === 'high-flyer-90')) {
             const badge = BADGE_DEFINITIONS.find(b => b.id === 'high-flyer-90');
            if(badge) earnedBadges.push({ ...badge, achieved: true });
        }
        if (percentage >= 95 && !earnedBadges.some(b => b.id === 'over-achiever-95')) {
             const badge = BADGE_DEFINITIONS.find(b => b.id === 'over-achiever-95');
            if(badge) earnedBadges.push({ ...badge, achieved: true });
        }
    });

    return earnedBadges;
}
