
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, Bug, Wrench, Trash2, Check, User, Calendar, Loader2, ShieldCheck, FileText, Paperclip, ChevronRight } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { BugReport } from '@/types';
import { motion } from 'framer-motion';


export default function AdminPage() {
  const router = useRouter();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Query sorted by timestamp descending, so newest reports are first
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
        toast({
          title: "Error",
          description: "Could not fetch bug reports.",
          variant: "destructive"
        });
        setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

  const deleteBugReport = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent link navigation
    const bugDocRef = doc(db, 'bug-reports', id);
    try {
      await deleteDoc(bugDocRef);
      toast({
        title: "Report Deleted",
        description: "The bug report has been permanently deleted."
      });
    } catch (error) {
      console.error("Error deleting bug report:", error);
       toast({
        title: "Error",
        description: "Could not delete bug report.",
        variant: "destructive"
      });
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
            <Link href="/admin/developer-info/edit">
                 <Button className="font-bold text-base">
                    <FileText className="mr-2 h-5 w-5" /> Edit Developer Info
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
              Review and manage user-submitted bug reports. New reports appear here instantly.
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
                {bugReports.map((report, index) => (
                    <motion.div
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                    <Link href={`/admin/bugs/${report.id}`} className="block group">
                      <div className="glass-card p-4 rounded-lg hover:border-primary/50 border-2 border-transparent transition-all">
                        <div className="flex justify-between items-start">
                            <div className='flex-1 overflow-hidden'>
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="font-bold text-primary">{report.userName || 'Anonymous'}</span>
                                    <Badge variant={getStatusVariant(report.status)} className="capitalize">{report.status}</Badge>
                                </div>
                                <p className="text-foreground truncate">{report.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {report.attachments && report.attachments.length > 0 && <Paperclip className="w-4 h-4 text-muted-foreground" />}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-destructive w-8 h-8">
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
                                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={(e) => deleteBugReport(report.id, e)} className="bg-destructive hover:bg-destructive/80 font-bold">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground font-semibold">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {report.timestamp ? 
                                    `${formatDistanceToNow(new Date(report.timestamp.seconds * 1000), { addSuffix: true })}` 
                                    : 'Awaiting timestamp...'
                                }
                              </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                    </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
