
'use client';

import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bug } from 'lucide-react';
import Link from 'next/link';
import { submitBugReport } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TriangleAlert } from 'lucide-react';

function ErrorDisplay() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  let errorMessage = 'An unknown error occurred.';
  if (error === 'description_too_short') {
    errorMessage = 'The bug description must be at least 10 characters long.';
  } else if (error === 'submit_failed') {
    errorMessage = 'Failed to submit bug report to the database. Please try again.';
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <TriangleAlert className="h-4 w-4" />
      <AlertTitle>Submission Failed</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
}

export default function ReportBugPage() {
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
            <Suspense fallback={<div>Loading...</div>}>
              <ErrorDisplay />
            </Suspense>
            {/* This form uses a Server Action. When submitted, it will trigger the
                `submitBugReport` function on the server. */}
            <form action={submitBugReport} className="space-y-6">
              <div>
                <label htmlFor="description" className="font-semibold mb-2 block">Bug Description (Required)</label>
                <Textarea
                  id="description"
                  name="description" // The name attribute is crucial for server actions
                  placeholder="Please provide as much detail as possible about the bug... (min. 10 characters)"
                  rows={8}
                  required
                  minLength={10}
                  maxLength={5000}
                />
              </div>

              <Button type="submit" className="w-full font-bold h-12 text-lg">
                Submit Bug Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
