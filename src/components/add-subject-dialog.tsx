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
import { Plus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  name: z.string().min(1, 'Subject name is required.'),
  attendedClasses: z.coerce.number().min(0, 'Cannot be negative.').default(0),
  totalClasses: z.coerce.number().min(0, 'Cannot be negative.').default(0),
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
  const { theme } = useTheme();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      attendedClasses: 0,
      totalClasses: 0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        attendedClasses: 0,
        totalClasses: 0,
      });
    }
  }, [open, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addSubject({name: values.name, attendedClasses: values.attendedClasses, totalClasses: values.totalClasses});
    form.reset();
    setOpen(false);
  };
  
  const isRadhaTheme = theme === 'radha-rani';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2 font-bold", isRadhaTheme && "text-transparent bg-clip-text bg-gradient-to-r from-pink-900 to-amber-600")}>
            <Plus className={cn("text-primary", isRadhaTheme && "text-pink-500")} /> Add New Subject
          </DialogTitle>
          <DialogDescription className={cn(isRadhaTheme && "text-muted-foreground")}>
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
                  <FormLabel className={cn('font-semibold', isRadhaTheme && "text-card-foreground")}>Subject Name</FormLabel>
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
                    <FormLabel className={cn('font-semibold', isRadhaTheme && "text-card-foreground")}>Classes Attended</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onFocus={(e) => e.target.select()} />
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
                    <FormLabel className={cn('font-semibold', isRadhaTheme && "text-card-foreground")}>Total Classes</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onFocus={(e) => e.target.select()} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full font-bold">Add Subject</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
