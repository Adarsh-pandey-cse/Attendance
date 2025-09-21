
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bug, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendBugReport } from '@/ai/flows/bug-report-flow';

type ReportBugDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function ReportBugDialog({ children, isOpen, setIsOpen }: ReportBugDialogProps) {
  const [bugDescription, setBugDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (bugDescription.trim() === '') {
      toast({
        title: "Error",
        description: "Please describe the bug before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      await sendBugReport(bugDescription);
      toast({
        title: "Report Sent!",
        description: "Thank you for your feedback. The developer has been notified.",
      });
      setBugDescription('');
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to send bug report", error);
      toast({
        title: "Submission Failed",
        description: "Could not send the bug report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Bug className="text-destructive" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve AttendX by describing the issue you've encountered. Your feedback is valuable!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <Textarea
                placeholder="Please provide as much detail as possible..."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                rows={5}
                className="resize-none"
                disabled={isSending}
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSending}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-destructive hover:bg-destructive/80 text-white font-bold" disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : "Send Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
