
'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bug, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { submitBugReport } from '@/lib/actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full font-bold h-12 text-lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
        </>
      ) : (
        'Submit Bug Report'
      )}
    </Button>
  );
}

export default function ReportBugPage() {
  const { toast } = useToast();
  const initialState = { message: '', errors: {}, success: false };
  const [state, dispatch] = useFormState(submitBugReport, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

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
            <form action={dispatch} className="space-y-6">
              <div>
                <label htmlFor="description" className="font-semibold mb-2 block">Bug Description (Required)</label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Please provide as much detail as possible about the bug..."
                  rows={8}
                  required
                />
                 {state.errors?.description &&
                    state.errors.description.map((error: string) => (
                    <p className="mt-2 text-sm text-destructive" key={error}>
                        {error}
                    </p>
                 ))}
              </div>
             <SubmitButton />
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
