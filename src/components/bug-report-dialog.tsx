
'use client';

import { useState, useEffect, useRef } from 'react';
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
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitBugReport } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full font-bold">
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bug className="mr-2 h-4 w-4" />
      )}
      Submit Report
    </Button>
  );
}

export function BugReportDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(submitBugReport, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: 'Success!',
          description: state.message,
        });
        setOpen(false); // Close dialog on success
      } else {
        toast({
          title: 'Error',
          description: state.message,
          variant: 'destructive',
        });
      }
    }
  }, [state, toast]);

  useEffect(() => {
    if (!open) {
      formRef.current?.reset();
    }
  }, [open]);

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
        <form ref={formRef} action={formAction} className="space-y-4">
          <Textarea
            name="report"
            placeholder="Describe the bug you encountered. For example: 'When I click on the history button, the app crashes.'"
            rows={6}
            required
          />
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
