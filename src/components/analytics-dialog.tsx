
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Subject, AnalyticsData } from '@/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type AnalyticsDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  subject: Subject;
};

export function AnalyticsDialog({ isOpen, setIsOpen, subject }: AnalyticsDialogProps) {
    const attended = subject.attendedClasses;
    const total = subject.totalClasses;
    const absent = total - attended;

    const data: AnalyticsData[] = [
        { name: 'Present', value: attended, fill: '#3CB371' }, // Emerald Green
        { name: 'Absent', value: absent, fill: '#FF6347' }, // Tomato Red
    ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="font-bold">Analytics for {subject.name}</DialogTitle>
        </DialogHeader>
        
        {total > 0 ? (
            <div className='w-full h-64 mt-4'>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        ) : (
            <div className='text-center py-12'>
                <p className='text-muted-foreground'>No attendance data available to display analytics.</p>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
