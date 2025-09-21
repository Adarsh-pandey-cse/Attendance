'use client';

import { useEffect, useRef, useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
    <Button type="submit" className="w-full font-bold gap-2" disabled={pending}>
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

function BugReportForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
  const { userName } = useAttendance();
  const initialState = { message: '', success: false };
  // Bind the userName to the server action
  const submitBugReportWithUser = submitBugReport.bind(null, userName);
  const [state, dispatch] = useActionState(submitBugReportWithUser, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: 'Success!', description: state.message });
        formRef.current?.reset();
        setDialogOpen(false);
      } else {
        toast({ title: 'Error', description: state.message, variant: 'destructive' });
      }
    }
  }, [state, toast, setDialogOpen]);

  return (
    <form ref={formRef} action={dispatch} className="space-y-4">
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
  );
}

export function ReportBugDialog({ isOpen, onOpenChange }: ReportBugDialogProps) {
  // By giving the form a new key each time the dialog opens,
  // we ensure it remounts with a fresh state, which is the correct
  // way to "reset" the useActionState hook.
  const [formKey, setFormKey] = useState(() => Date.now().toString());

  useEffect(() => {
    if (isOpen) {
      setFormKey(Date.now().toString());
    }
  }, [isOpen]);

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
        {isOpen && <BugReportForm key={formKey} setDialogOpen={onOpenChange} />}
      </DialogContent>
    </Dialog>
  );
}
