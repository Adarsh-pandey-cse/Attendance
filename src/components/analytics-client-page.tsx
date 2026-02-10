
'use client';

import { useAttendance } from '@/hooks/use-attendance';
import { Loader2, PieChart as PieChartIcon, BarChart, Check, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalyticsData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const COLORS = {
  present: '#22c55e',
  absent: '#FACC15'
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 glass-card border-border rounded-lg shadow-lg">
          <p className="font-bold">{`${data.name}: ${data.value}`}</p>
        </div>
      );
    }
  
    return null;
};

export function AnalyticsClientPage() {
  const { subjects, loading, overallTarget } = useAttendance();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const analyticsData = useMemo(() => {
    if (!subjects.length) {
      return { totalAttended: 0, totalClasses: 0, totalAbsent: 0, chartData: [], subjectBreakdown: [] };
    }
    let totalAttended = 0;
    let totalClasses = 0;
    subjects.forEach(subject => {
      totalAttended += subject.attendedClasses;
      totalClasses += subject.totalClasses;
    });
    const totalAbsent = totalClasses - totalAttended;
    const overallChartData: AnalyticsData[] = [
      { name: 'Present', value: totalAttended, fill: COLORS.present },
      { name: 'Absent', value: totalAbsent, fill: COLORS.absent },
    ];
    const subjectBreakdown = subjects.map(s => ({
        id: s.id,
        name: s.name,
        percentage: s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0
    })).sort((a,b) => b.percentage - a.percentage);
    return { totalAttended, totalClasses, totalAbsent, chartData: overallChartData, subjectBreakdown };
  }, [subjects]);

  const currentViewData = useMemo(() => {
    if (selectedSubjectId) {
      const subject = subjects.find(s => s.id === selectedSubjectId);
      if (subject) {
        const absent = subject.totalClasses - subject.attendedClasses;
        return {
            title: subject.name,
            chartData: [
                { name: 'Present', value: subject.attendedClasses, fill: COLORS.present },
                { name: 'Absent', value: absent, fill: COLORS.absent },
            ],
            attended: subject.attendedClasses,
            missed: absent,
            total: subject.totalClasses
        };
      }
    }
    return {
        title: 'Overall Attendance',
        chartData: analyticsData.chartData,
        attended: analyticsData.totalAttended,
        missed: analyticsData.totalAbsent,
        total: analyticsData.totalClasses,
    };
  }, [selectedSubjectId, subjects, analyticsData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 glass-card">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-4 text-lg font-semibold">Loading Analytics...</p>
      </div>
    );
  }
  
  if (subjects.length === 0) {
      return (
          <Card className="glass-card text-center">
               <CardContent className="py-16 px-4">
                <BarChart className="w-16 h-16 mx-auto text-primary/70 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No Data Available</h3>
                <p className="text-muted-foreground mt-2">Add subjects and mark attendance to see your analytics.</p>
               </CardContent>
          </Card>
      );
  }

  const percentage = currentViewData.total > 0 ? (currentViewData.attended / currentViewData.total) * 100 : 0;

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
    >
        <Card className="glass-card overflow-hidden">
            <CardHeader>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentViewData.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className='flex items-center justify-between'
                    >
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="text-primary" />
                            <span className='truncate'>{currentViewData.title}</span>
                        </CardTitle>
                        {selectedSubjectId && (
                            <Button variant="outline" size="sm" onClick={() => setSelectedSubjectId(null)}>
                                Back to Overall
                            </Button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                 {currentViewData.total > 0 ? (
                    <div className='w-full h-52 md:h-60 relative'>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={currentViewData.chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    innerRadius="60%"
                                    outerRadius="80%"
                                    dataKey="value"
                                    isAnimationActive={true}
                                    animationDuration={800}
                                >
                                    {currentViewData.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} className="focus:outline-none ring-0 border-0 focus:ring-0" />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                        <motion.div
                            key={currentViewData.title + '-percentage'}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        >
                            <span className="text-4xl font-bold">{percentage.toFixed(1)}%</span>
                            <span className="text-sm font-semibold text-muted-foreground">Attendance</span>
                        </motion.div>
                    </div>
                ) : (
                    <div className='text-center py-12'>
                        <p className='text-muted-foreground'>No attendance data for this subject.</p>
                    </div>
                )}
                <AnimatePresence mode="wait">
                <motion.div
                    key={currentViewData.title + '-stats'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid grid-cols-2 gap-4 mt-6 w-full"
                >
                    <Card className="bg-secondary/30">
                        <CardHeader className="p-4 flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Attended</CardTitle>
                            <Check className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{currentViewData.attended}</div>
                            <p className="text-xs text-muted-foreground">Classes</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-secondary/30">
                        <CardHeader className="p-4 flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Missed</CardTitle>
                            <X className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{currentViewData.missed}</div>
                            <p className="text-xs text-muted-foreground">Classes</p>
                        </CardContent>
                    </Card>
                </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>

        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="text-base">Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {analyticsData.subjectBreakdown.map(subject => {
                       const target = overallTarget || 75;
                       let progressColor = 'bg-yellow-400';
                       if (subject.percentage >= target) {
                           progressColor = 'bg-green-500';
                       } else if (subject.percentage < target * 0.75) {
                           progressColor = 'bg-red-400';
                       }
                       return (
                        <button
                            key={subject.id}
                            onClick={() => setSelectedSubjectId(subject.id)}
                            className={cn(
                                'w-full text-left p-3 rounded-lg transition-all',
                                selectedSubjectId === subject.id ? 'bg-primary/20 scale-[1.02]' : 'hover:bg-secondary/50'
                            )}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-semibold">{subject.name}</span>
                                <span className="font-bold">{subject.percentage.toFixed(1)}%</span>
                            </div>
                             <Progress value={subject.percentage} className="h-1.5" indicatorClassName={progressColor} />
                        </button>
                    )})}
                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
}
