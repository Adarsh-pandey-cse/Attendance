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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Bug, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { saveBugReport } from '@/lib/actions';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100),
  description: z.string().min(10, 'Please provide a detailed description.').max(5000),
});

type BugReportDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function BugReportDialog({ isOpen, setIsOpen }: BugReportDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setIsSubmitting(false);
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const result = await saveBugReport(values);
    if (result.success) {
      toast({
        title: 'Report Submitted!',
        description: result.message,
      });
      setIsOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Bug className="text-primary" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Found an issue? Please let us know. Your feedback helps improve the app.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Bug Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Attendance button not working" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the bug in detail. What did you do? What did you expect to happen? What actually happened?"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-primary to-accent text-white w-full font-bold">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
