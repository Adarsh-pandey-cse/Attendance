'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Bug, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAttendance } from '@/hooks/use-attendance';
import { saveBugReport } from '@/lib/actions';

type ReportBugDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function ReportBugDialog({ children, isOpen, setIsOpen }: ReportBugDialogProps) {
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { userName } = useAttendance();

  const handleSubmit = async () => {
    if (description.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please describe the bug before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);

    try {
      const result = await saveBugReport({
        userName: userName,
        description: description,
      });

      if (result.success) {
        toast({
          title: 'Report Sent!',
          description: 'Thank you for your bug report! The admin will review it shortly.',
        });
        setDescription('');
        setIsOpen(false);
      } else {
        toast({
          title: 'Submission Failed',
          description: result.message || 'Failed to submit bug report. Please try again later.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast({
        title: 'Submission Failed',
        description: 'An unexpected server error occurred. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {children}
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Bug className="text-destructive" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve AttendX by describing the issue you've encountered. Your report will be sent to the admin.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-2">
            <Label htmlFor="bug-description" className="font-semibold">
              Bug Description (Required)
            </Label>
            <Textarea
              id="bug-description"
              placeholder="Please provide as much detail as possible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
              disabled={isSending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-destructive hover:bg-destructive/80 text-white font-bold"
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
