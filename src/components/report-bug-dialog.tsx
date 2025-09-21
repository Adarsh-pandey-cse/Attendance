
'use client';

import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bug, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAttendance } from '@/hooks/use-attendance';
import { sendBugReport } from '@/ai/flows/bug-report-flow';

type ReportBugDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function ReportBugDialog({ children, isOpen, setIsOpen }: ReportBugDialogProps) {
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { userName } = useAttendance();
  const [deviceInfo, setDeviceInfo] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceInfo(`${navigator.userAgent}`);
    }
  }, []);

  const handleSubmit = async () => {
    if (description.trim() === '') {
      toast({
        title: "Error",
        description: "Please describe the bug before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const result = await sendBugReport({
        userName: userName || 'Not provided',
        description,
        steps: steps || 'Not provided',
        severity,
        deviceInfo,
      });

      if (result.success) {
        toast({
          title: "Report Sent!",
          description: "Thank you for your report! Our team will review it and get back to you shortly.",
        });
        setDescription('');
        setSteps('');
        setSeverity('Medium');
        setIsOpen(false);
      } else {
        throw new Error(result.message || 'Unknown error');
      }
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
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-bold">
            <Bug className="text-destructive" /> Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve AttendX by describing the issue you've encountered. Your feedback is valuable!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="space-y-2">
                <Label htmlFor="bug-description" className="font-semibold">Bug Description (Required)</Label>
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
             <div className="space-y-2">
                <Label htmlFor="bug-steps" className="font-semibold">Steps to Reproduce</Label>
                <Textarea
                    id="bug-steps"
                    placeholder="e.g., 1. Go to Timetable page. 2. Click 'Add Class'. 3. See error."
                    value={steps}
                    onChange={(e) => setSteps(e.target.value)}
                    rows={3}
                    className="resize-none"
                    disabled={isSending}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="bug-severity" className="font-semibold">Severity Level</Label>
                 <Select value={severity} onValueChange={setSeverity} disabled={isSending}>
                    <SelectTrigger id="bug-severity">
                        <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="bug-device" className="font-semibold">Device/App Info</Label>
                <Input id="bug-device" value={deviceInfo} readOnly disabled className="bg-muted/50"/>
            </div>
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
