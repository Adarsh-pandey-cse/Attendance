'use client';

import { useState, useEffect } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAttendance } from '@/hooks/use-attendance';
import { Edit } from 'lucide-react';
import { Subject } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, 'Subject name is required.'),
  attendedClasses: z.coerce.number().min(0, 'Cannot be negative.'),
  totalClasses: z.coerce.number().min(0, 'Cannot be negative.'),
}).refine(data => data.attendedClasses <= data.totalClasses, {
  message: 'Attended classes cannot exceed total classes.',
  path: ['attendedClasses'],
});

type EditSubjectDialogProps = {
  children: React.ReactNode;
  subject: Subject;
};

export function EditSubjectDialog({ children, subject }: EditSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const { updateSubject } = useAttendance();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subject.name,
      attendedClasses: subject.attendedClasses,
      totalClasses: subject.totalClasses,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: subject.name,
        attendedClasses: subject.attendedClasses,
        totalClasses: subject.totalClasses,
      });
    }
  }, [open, subject, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateSubject({ ...subject, ...values });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Edit className="text-primary" /> Edit Subject
          </DialogTitle>
          <DialogDescription>
            Update the details for your subject below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-semibold'>Subject Name</FormLabel>
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
                    <FormLabel className='font-semibold'>Classes Attended</FormLabel>
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
                    <FormLabel className='font-semibold'>Total Classes</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="bg-gradient-to-r from-primary to-green-500 text-white w-full font-bold">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
