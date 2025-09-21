'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { submitBugReport } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageSquareWarning, Send } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';

type ReportBugDialogProps = {
  children: React.ReactNode;
};

function BugReportForm({ setDialogOpen }: { setDialogOpen: (open: boolean) => void }) {
  const { userName } = useAttendance();
  const { toast } = useToast();
  const [description, setDescription] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (description.trim().length < 10) {
      toast({
        title: 'Error',
        description: 'Description must be at least 10 characters long.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      const result = await submitBugReport(userName, description);
      if (result.success) {
        toast({ title: 'Success!', description: result.message });
        setDialogOpen(false);
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Textarea
          name="description"
          placeholder="Please provide a detailed description of the bug, including steps to reproduce it if possible."
          rows={6}
          className="text-base"
          required
          autoFocus
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={10}
        />
      </div>
      <DialogFooter>
        <Button onClick={handleSubmit} className="w-full font-bold gap-2" disabled={isPending || description.trim().length < 10}>
          {isPending ? (
            <>
              <Loader2 className="animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send /> Submit Report
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  );
}

export function ReportBugDialog({ children }: ReportBugDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  // By giving the form a new key each time the dialog opens,
  // we ensure it remounts with a fresh state.
  const [formKey, setFormKey] = useState(() => Date.now().toString());

  useEffect(() => {
    if (isOpen) {
      setFormKey(Date.now().toString());
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="glass-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold text-xl">
            <MessageSquareWarning className="text-primary" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Encountered an issue? Please describe it in detail below. Your feedback helps improve the app.
          </DialogDescription>
        </DialogHeader>
        {isOpen && <BugReportForm key={formKey} setDialogOpen={setIsOpen} />}
      </DialogContent>
    </Dialog>
  );
}
