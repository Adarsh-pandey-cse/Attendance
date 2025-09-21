
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
import { Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type ReportBugDialogProps = {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function ReportBugDialog({ children, isOpen, setIsOpen }: ReportBugDialogProps) {
  const [bugDescription, setBugDescription] = useState('');
  const { toast } = useToast();
  
  const recipientEmail = 'pandeyji5544@gmail.com';

  const handleSubmit = () => {
    if (bugDescription.trim() === '') {
      toast({
        title: "Error",
        description: "Please describe the bug before submitting.",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent('Bug Report from AttendX App');
    const body = encodeURIComponent(`Bug Description:\n----------------\n\n${bugDescription}`);
    
    // Create a mailto link
    window.location.href = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

    setBugDescription('');
    setIsOpen(false);
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
            />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} className="bg-destructive hover:bg-destructive/80 text-white font-bold">
            Send Report via Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
