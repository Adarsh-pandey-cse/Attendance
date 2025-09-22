
'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bug, Loader2 } from 'lucide-react';
import { submitBugReport } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export function BugReportDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    
    // Optimistically close dialog and show toast
    setOpen(false);
    toast({
      title: 'Thank You!',
      description: 'Your bug report has been submitted.',
    });

    // Perform submission in the background
    const result = await submitBugReport(formData);

    setIsSubmitting(false);

    if (!result.success) {
      // If submission fails, show an error toast
      // We also need to re-open the dialog and restore the content
      // but for simplicity and a lighter UX, we just show an error.
       toast({
        title: 'Submission Failed',
        description: result.message,
        variant: 'destructive',
      });
      console.error("Bug report submission failed:", result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Bug className="text-primary" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Found an issue? Let us know! Please describe the bug in detail.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            name="report"
            placeholder="Describe the bug you encountered. For example: 'When I click on the history button, the app crashes.'"
            rows={6}
            required
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting} className="w-full font-bold">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bug className="mr-2 h-4 w-4" />
            )}
            Submit Report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
