'use client';

import { useState, useMemo } from 'react';
import { useAttendance } from '@/hooks/use-attendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, TrendingDown, ShieldQuestion, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

export function AttendanceImpactCalculator() {
  const { subjects, overallTarget, loading } = useAttendance();
  const [missCount, setMissCount] = useState(0);
  const [mode, setMode] = useState<'overall' | 'subject'>('overall');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  const { currentPresent, currentTotal, name } = useMemo(() => {
    if (mode === 'subject' && selectedSubjectId) {
      const subject = subjects.find(s => s.id === selectedSubjectId);
      return {
        currentPresent: subject?.attendedClasses || 0,
        currentTotal: subject?.totalClasses || 0,
        name: subject?.name || 'Selected Subject',
      };
    }
    // Overall
    const totalAttended = subjects.reduce((acc, s) => acc + s.attendedClasses, 0);
    const totalClasses = subjects.reduce((acc, s) => acc + s.totalClasses, 0);
    return {
      currentPresent: totalAttended,
      currentTotal: totalClasses,
      name: 'Overall',
    };
  }, [subjects, mode, selectedSubjectId]);

  const currentPercentage = currentTotal > 0 ? (currentPresent / currentTotal) * 100 : 0;

  const projectedPercentage = useMemo(() => {
    const newTotal = currentTotal + missCount;
    if (newTotal === 0) return 0;
    return (currentPresent / newTotal) * 100;
  }, [currentPresent, currentTotal, missCount]);

  const safeMissLimit = useMemo(() => {
    if (loading || !overallTarget) return 0;
    if (currentPercentage < overallTarget) return 0;
    const bunkable = Math.floor((100 * currentPresent - overallTarget * currentTotal) / overallTarget);
    return bunkable > 0 ? bunkable : 0;
  }, [currentPresent, currentTotal, overallTarget, currentPercentage, loading]);

  const { riskStatus, riskColor, RiskIcon, riskBorderColor } = useMemo(() => {
    if (loading || !overallTarget) return { riskStatus: '', riskColor: '', RiskIcon: ShieldQuestion, riskBorderColor: ''};
    if (projectedPercentage >= overallTarget + 5) {
      return { riskStatus: 'Safe', riskColor: 'text-primary', RiskIcon: ShieldCheck, riskBorderColor: 'border-primary' };
    } else if (projectedPercentage >= overallTarget) {
      return { riskStatus: 'Warning', riskColor: 'text-yellow-400', RiskIcon: ShieldAlert, riskBorderColor: 'border-yellow-400' };
    } else {
      return { riskStatus: 'Critical', riskColor: 'text-red-500', RiskIcon: AlertTriangle, riskBorderColor: 'border-red-500' };
    }
  }, [projectedPercentage, overallTarget, loading]);

  const handleMissCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setMissCount(isNaN(value) || value < 0 ? 0 : Math.min(value, 999));
  };
  
  if (loading) {
      return null; // Or a skeleton loader
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="text-primary" /> Attendance Impact Calculator
        </CardTitle>
        <CardDescription>
          Simulate how missing future classes will affect your attendance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="subject" disabled={subjects.length === 0}>Subject</TabsTrigger>
          </TabsList>
          <TabsContent value="overall" />
          <TabsContent value="subject">
             {subjects.length > 0 && (
                 <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId || ''}>
                    <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select a subject to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>
                                {subject.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             )}
          </TabsContent>
        </Tabs>
        
        {currentTotal === 0 && mode === 'overall' && (
             <div className="text-center py-8">
                <Calculator className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="mt-4 font-semibold text-muted-foreground">Add subjects to start calculating.</p>
            </div>
        )}

        {(currentTotal > 0 || (mode === 'subject' && selectedSubjectId)) && (
          <div className="space-y-6">
            <div className='text-center'>
              <p className='text-sm font-semibold text-muted-foreground'>{name} Current Attendance</p>
              <p className='text-3xl font-bold'>{currentPercentage.toFixed(1)}%</p>
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="miss-count-input" className="font-semibold">How many classes do you plan to miss?</Label>
              <Input
                id="miss-count-input"
                type="number"
                value={missCount}
                onChange={handleMissCountChange}
                onFocus={(e) => e.target.select()}
                className="text-center text-lg font-bold h-12"
              />
            </div>
            
            <AnimatePresence mode="wait">
            <motion.div
                key={name + missCount}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={cn("glass-card p-4 rounded-lg border-l-4", riskBorderColor)}
            >
                <div className='flex items-center justify-between'>
                    <div>
                        <p className='text-sm font-semibold text-muted-foreground'>Projected Attendance</p>
                        <p className='text-4xl font-extrabold'>{projectedPercentage.toFixed(1)}%</p>
                    </div>
                     <div className={cn('flex flex-col items-center gap-1 font-bold p-2 rounded-md', riskColor)}>
                        <RiskIcon className="w-8 h-8"/>
                        <span>{riskStatus}</span>
                    </div>
                </div>

                <div className="mt-4 text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <ShieldQuestion className="w-5 h-5 text-sky-400" />
                    {currentPercentage < overallTarget! ? (
                        <span className='text-yellow-400'>You are already below the {overallTarget}% target.</span>
                    ) : (
                        <span>You can safely miss <span className='font-bold text-foreground'>{safeMissLimit}</span> more class{safeMissLimit !== 1 ? 'es' : ''}.</span>
                    )}
                </div>
            </motion.div>
             </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
