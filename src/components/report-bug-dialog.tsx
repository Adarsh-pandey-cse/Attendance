'use client';

import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitBugReport } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareWarning, Send } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';

type ReportBugDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full font-bold" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Submitting...
        </>
      ) : (
        <>
          <Send /> Submit Report
        </>
      )}
    </Button>
  );
}

export function ReportBugDialog({ isOpen, onOpenChange }: ReportBugDialogProps) {
  const initialState = { message: '', success: false };
  const [state, dispatch] = useActionState(submitBugReport, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { userName } = useAttendance();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success!', description: state.message });
        formRef.current?.reset();
        onOpenChange(false);
      } else {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
      }
    }
  }, [state, toast, onOpenChange]);
  
  // Reset form state when dialog is closed/opened
  useEffect(() => {
    if (!isOpen) {
        formRef.current?.reset();
        // A way to reset the form state action
        dispatch({
            type: '@@RESET',
        } as any);
    }
  }, [isOpen, dispatch]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold text-xl">
            <MessageSquareWarning className="text-primary" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Encountered an issue? Please describe it in detail below. Your feedback helps improve the app.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={dispatch} className="space-y-4">
           <input type="hidden" name="userName" value={userName} />
          <div>
            <Textarea
              name="description"
              placeholder="Please provide a detailed description of the bug, including steps to reproduce it if possible."
              rows={6}
              className="text-base"
              required
              autoFocus
            />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
