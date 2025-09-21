
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Bug, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { BugReport } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"


export default function BugReportsPage() {
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reportsColRef = collection(db, 'bugReports');
    const q = query(reportsColRef, orderBy('submittedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as BugReport));
      setBugReports(reports);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bug reports:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-4xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Bug Reports</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bug className="w-6 h-6 text-primary"/>Incoming Feedback</CardTitle>
            <CardDescription>Review and manage user-submitted bug reports here.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : bugReports.length === 0 ? (
              <div className="text-center py-16">
                <Bug className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Bug Reports Yet</h3>
                <p className="text-muted-foreground">When users submit bugs, they will appear here.</p>
              </div>
            ) : (
                <Accordion type="single" collapsible className="w-full space-y-2">
                    {bugReports.map((report, index) => (
                        <AccordionItem key={report.id} value={`item-${index}`} className="bg-secondary/30 rounded-lg border-b-0 px-4">
                            <AccordionTrigger className="font-bold hover:no-underline">
                                <div className="flex-1 text-left">
                                    <p className="truncate">{report.title}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal mt-1">
                                        <Clock className="w-3 h-3" />
                                        <span>Submitted {formatDistanceToNow(report.submittedAt.toDate(), { addSuffix: true })}</span>
                                        <span className='capitalize'>- Status: {report.status}</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-base pt-2">
                               {report.description}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
