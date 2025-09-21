
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bug, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { submitBugReport } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';

export default function ReportBugPage() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (description.trim().length === 0) {
      toast({
        title: 'Error',
        description: 'Bug description cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await submitBugReport(description);

    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      setDescription(''); // Clear the textarea on success
    } else {
      toast({
        title: 'Submission Failed',
        description: result.message,
        variant: 'destructive',
      });
    }

    setLoading(false);
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
              Help us improve the app by describing the issue you've encountered. Your feedback is valuable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="font-semibold mb-2 block">Bug Description (Required)</label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide as much detail as possible about the bug..."
                  rows={8}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full font-bold h-12 text-lg" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
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
