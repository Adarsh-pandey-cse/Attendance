'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Slider } from '@/components/ui/slider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAttendance } from '@/hooks/use-attendance';
import { Plus } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Subject name is required.'),
  attendedClasses: z.coerce.number().min(0, 'Cannot be negative.').default(0),
  totalClasses: z.coerce.number().min(0, 'Cannot be negative.').default(0),
  target: z.number().min(1).max(100).default(75),
}).refine(data => data.attendedClasses <= data.totalClasses, {
  message: 'Attended classes cannot exceed total classes.',
  path: ['attendedClasses'],
});

type AddSubjectDialogProps = {
  children: React.ReactNode;
};

export function AddSubjectDialog({ children }: AddSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { addSubject } = useAttendance();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      attendedClasses: 0,
      totalClasses: 0,
      target: 75,
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addSubject(values);
    form.reset();
    setOpen(false);
  };
  
  const targetValue = form.watch('target');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="text-primary" /> Add New Subject
          </DialogTitle>
          <DialogDescription>
            Enter the details for your new subject below. You can mark attendance later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Quantum Physics" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="attendedClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classes Attended</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalClasses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Classes</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel>Attendance Target</FormLabel>
                      <span className="font-bold text-primary">{targetValue}%</span>
                    </div>
                    <FormControl>
                      <Slider
                        min={1}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-primary to-green-500 text-white w-full">Add Subject</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
