
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BugReport } from '@/types';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bug } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getBugReports(): Promise<BugReport[]> {
  try {
    const bugReportsColRef = collection(db, 'bugReports');
    const q = query(bugReportsColRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        report: data.report,
        // Firestore Timestamps need to be converted to JS Dates for serialization
        createdAt: data.createdAt.toDate(), 
        status: data.status,
      } as BugReport;
    });
  } catch (error) {
    console.error("Error fetching bug reports:", error);
    return [];
  }
}

export default async function BugReportsPage() {
  const reports = await getBugReports();

  const formatDate = (date: Date) => {
    if (!date) return 'Date not available';
    // format expects a Date object, which we've already converted to.
    return format(date, "PPP 'at' p"); // e.g., Jun 9, 2024 at 5:03 PM
  };

  const statusVariant = (status: BugReport['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'new': return 'destructive';
        case 'in-progress': return 'default';
        case 'resolved': return 'secondary';
        default: return 'secondary';
    }
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-4xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
                <Link href="/admin">
                    <ArrowLeft />
                </Link>
            </Button>
            <div className="flex items-center gap-3">
                <Bug className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Bug Reports</h1>
            </div>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Submitted Reports</CardTitle>
            <CardDescription>
                Here are the bug reports submitted by users, sorted by most recent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Bug className="w-16 h-16 mx-auto text-primary/70 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">
                  No Bug Reports Yet!
                </h3>
                <p className="text-muted-foreground mt-2">
                  When users submit bug reports, they will appear here.
                </p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="w-full space-y-2">
                {reports.map(report => (
                  <AccordionItem value={report.id} key={report.id} className="bg-secondary/30 rounded-lg border-b-0 px-4">
                    <AccordionTrigger className="font-semibold text-base hover:no-underline">
                        <div className="flex items-center gap-4 flex-1 text-left">
                            <Badge variant={statusVariant(report.status)} className="capitalize">{report.status}</Badge>
                            <span className="truncate flex-1">{report.report}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">Submitted on: {formatDate(report.createdAt)}</p>
                      <div className="bg-background/50 p-4 rounded-md">
                        <p className="whitespace-pre-wrap">{report.report}</p>
                      </div>
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
