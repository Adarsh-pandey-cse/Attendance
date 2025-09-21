
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAttendance } from '@/hooks/use-attendance';
import { DayOfWeek, TimetableEntry } from '@/types';
import { Plus } from 'lucide-react';
import { doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  subjectId: z.string().min(1, 'Please select a subject.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm).'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm).'),
}).refine(data => data.startTime < data.endTime, {
  message: 'End time must be after start time.',
  path: ['endTime'],
});

type ScheduleDialogProps = {
  children: React.ReactNode;
  day: DayOfWeek;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  entry: TimetableEntry | null;
};

export function ScheduleDialog({ children, day, isOpen, setIsOpen, entry }: ScheduleDialogProps) {
  const { subjects, timetable, updateTimetable } = useAttendance();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: entry?.subjectId || '',
      startTime: entry?.startTime || '',
      endTime: entry?.endTime || '',
    },
  });
  
  useEffect(() => {
    form.reset({
      subjectId: entry?.subjectId || '',
      startTime: entry?.startTime || '',
      endTime: entry?.endTime || '',
    });
  }, [entry, isOpen, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const updatedTimetable = { ...timetable };
    const daySchedule = updatedTimetable[day] || [];

    if (entry) { // Editing existing entry
      const entryIndex = daySchedule.findIndex(e => e.id === entry.id);
      if (entryIndex > -1) {
        daySchedule[entryIndex] = { ...entry, ...values };
      }
    } else { // Adding new entry
      const newEntry: TimetableEntry = {
        id: doc(collection(db, 'dummy')).id, // Firestore client-side ID generation
        ...values,
      };
      daySchedule.push(newEntry);
    }

    updatedTimetable[day] = daySchedule;
    updateTimetable(updatedTimetable);
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Plus className="text-primary" /> {entry ? 'Edit Class' : 'Add Class'} to {day.charAt(0).toUpperCase() + day.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Select a subject and set the start and end times for the class.
          </DialogDescription>
        </DialogHeader>
        {subjects.length === 0 ? (
            <p className='text-center text-red-400 font-semibold py-8'>Please add a subject on the main page before creating a timetable.</p>
        ): (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Subject</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='font-semibold'>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-primary to-green-500 text-white w-full font-bold">
                {entry ? 'Save Changes' : 'Add to Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
