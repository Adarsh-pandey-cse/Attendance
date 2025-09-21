
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, User, Calendar, Smartphone, Paperclip, FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BugReport } from '@/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function BugDetailPage() {
  const params = useParams();
  const bugId = params.bugId as string;
  const [bugReport, setBugReport] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!bugId) return;
    const bugDocRef = doc(db, 'bug-reports', bugId);
    const unsubscribe = onSnapshot(bugDocRef, (doc) => {
      if (doc.exists()) {
        setBugReport({ id: doc.id, ...doc.data() } as BugReport);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [bugId]);

  const updateStatus = async (status: BugReport['status']) => {
    if (!bugId) return;
    const bugDocRef = doc(db, 'bug-reports', bugId);
    try {
      await updateDoc(bugDocRef, { status });
      toast({ title: 'Status Updated', description: `Bug status changed to ${status}.` });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Could not update status.', variant: 'destructive' });
    }
  };

   const getStatusVariant = (status: BugReport['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'new':
            return 'destructive';
        case 'in-progress':
            return 'secondary';
        case 'resolved':
            return 'default';
        default:
            return 'default';
    }
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!bugReport) {
      return (
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <p className="text-lg font-bold">Bug report not found.</p>
            <Button asChild variant="link" className="mt-4">
            <Link href="/admin">Go Back to Admin Dashboard</Link>
            </Button>
        </div>
      )
  }

  return (
    <main className="flex justify-center min-h-screen bg-gradient-to-b from-background to-slate-900/50">
      <div className="w-full max-w-2xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Bug Report Details</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className='flex justify-between items-start'>
                <div>
                    <CardTitle>Issue Details</CardTitle>
                    <CardDescription>Submitted by {bugReport.userName || 'Anonymous'}</CardDescription>
                </div>
                 <div className='flex items-center gap-2'>
                    <Badge variant={getStatusVariant(bugReport.status)} className="capitalize">{bugReport.status}</Badge>
                    <Select onValueChange={(value) => updateStatus(value as BugReport['status'])} defaultValue={bugReport.status}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                 </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><User className='w-4 h-4' /> Submitter</h3>
              <p>{bugReport.userName || 'Anonymous'}</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Calendar className='w-4 h-4' /> Submitted At</h3>
              <p>{bugReport.timestamp ? format(new Date(bugReport.timestamp.seconds * 1000), 'PPPpp') : 'No timestamp'}</p>
            </div>
             <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Smartphone className='w-4 h-4' /> Device Info</h3>
              <p className='text-sm p-3 bg-slate-900 rounded-md font-mono'>{bugReport.deviceInfo || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-muted-foreground flex items-center gap-2"><FileText className='w-4 h-4' />Description</h3>
              <p className="whitespace-pre-wrap p-3 bg-slate-900/50 rounded-md">{bugReport.description}</p>
            </div>

            {bugReport.attachments && bugReport.attachments.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><Paperclip className='w-4 h-4' /> Attachments</h3>
                <div className='space-y-2'>
                  {bugReport.attachments.map(file => (
                    <div key={file.url} className='flex items-center justify-between p-2 glass-card rounded-md'>
                        <div className='flex items-center gap-2'>
                            <FileText className='w-5 h-5 text-primary' />
                            <span className='font-semibold truncate max-w-xs'>{file.name}</span>
                        </div>
                        <Button asChild size='sm' variant='outline'>
                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                <Download className='mr-2' /> View/Download
                            </a>
                        </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
