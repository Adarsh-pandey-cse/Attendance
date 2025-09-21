
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bug, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { saveBugReport } from '@/lib/actions';

export default function ReportBugPage() {
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() === '') {
      toast({ title: 'Error', description: 'Please describe the bug.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    
    try {
      const result = await saveBugReport(description);

      if (result.success) {
        toast({
          title: 'Report Sent!',
          description: 'Thank you for your feedback!',
        });
        router.push('/');
      } else {
        throw new Error(result.message || 'Failed to submit bug report.');
      }
    } catch (error: any) {
      console.error('Error submitting bug report:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex justify-center min-h-screen bg-gradient-to-b from-background to-slate-900/50">
      <div className="w-full max-w-2xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Report a Bug</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bug className="w-6 h-6 text-destructive" />
              <span>Submit a New Bug Report</span>
            </CardTitle>
            <CardDescription>
              Help us improve AttendX by describing the issue you've encountered.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="font-semibold mb-2 block">Bug Description (Required)</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible about the bug..."
                  rows={8}
                  required
                  disabled={isSending}
                />
              </div>

              <Button type="submit" disabled={isSending || !description.trim()} className="w-full font-bold h-12 text-lg">
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  'Submit Bug Report'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
