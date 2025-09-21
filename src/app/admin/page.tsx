'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, Bug, Wrench, Trash2, Check, User, Calendar, Loader2, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type BugReport = {
  id: string;
  userName: string;
  description: string;
  timestamp: { seconds: number; nanoseconds: number };
  status: 'new' | 'in-progress' | 'resolved';
};

export default function AdminPage() {
  const router = useRouter();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'bug-reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reports: BugReport[] = [];
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as BugReport);
      });
      setBugReports(reports);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching bug reports:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

  const updateBugStatus = async (id: string, status: BugReport['status']) => {
    const bugDocRef = doc(db, 'bug-reports', id);
    await updateDoc(bugDocRef, { status });
  };

  const deleteBugReport = async (id: string) => {
    const bugDocRef = doc(db, 'bug-reports', id);
    await deleteDoc(bugDocRef);
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

  return (
    <main className="flex justify-center min-h-screen bg-gradient-to-b from-background to-slate-900/50">
      <div className="w-full max-w-4xl p-4 md:p-6 space-y-8">
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-2'>
                <Button asChild variant="ghost" size="icon">
                    <Link href="/">
                    <ArrowLeft />
                    </Link>
                </Button>
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="font-bold">
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>

        {/* App Customization Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-primary" />
              <span>App Customization</span>
            </CardTitle>
             <CardDescription>
              Manage application information and developer details.
            </CardDescription>
          </CardHeader>
          <CardContent className='text-center'>
            <Link href="/developer-info">
                 <Button className="font-bold text-base">
                    <FileText className="mr-2 h-5 w-5" /> Edit Developer Info Page
                </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Bug Reports Section */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bug className="w-6 h-6 text-destructive" />
              <span>Bug Reports</span>
            </CardTitle>
            <CardDescription>
              Review and manage user-submitted bug reports.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                 <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="ml-4 text-lg font-semibold">Loading Reports...</p>
                </div>
            ) : bugReports.length === 0 ? (
              <div className="text-center py-16">
                 <Bug className="w-12 h-12 mx-auto text-muted-foreground"/>
                 <h3 className="text-lg font-bold text-foreground mt-4">No Bug Reports</h3>
                 <p className="text-muted-foreground mt-2">
                  When users submit bugs, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {bugReports.map((report) => (
                  <div key={report.id} className="glass-card p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-bold text-primary">{report.userName || 'Anonymous'}</span>
                            </div>
                            <p className="text-foreground">{report.description}</p>
                        </div>
                         <div className="flex items-center gap-2">
                             <Badge variant={getStatusVariant(report.status)} className="capitalize">{report.status}</Badge>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive w-8 h-8">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        This will permanently delete this bug report. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteBugReport(report.id)} className="bg-destructive hover:bg-destructive/80 font-bold">Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(report.timestamp.seconds * 1000), { addSuffix: true })}
                            {' on '}
                            {format(new Date(report.timestamp.seconds * 1000), 'MMM d, yyyy')}
                          </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {report.status !== 'in-progress' && <Button size="sm" variant="secondary" onClick={() => updateBugStatus(report.id, 'in-progress')}>Start</Button>}
                        {report.status !== 'resolved' && <Button size="sm" variant="default" onClick={() => updateBugStatus(report.id, 'resolved')}><Check className='mr-1 w-4 h-4' />Resolve</Button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
