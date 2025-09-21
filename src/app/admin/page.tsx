'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, Wrench, ShieldCheck, FileText, MessageSquareWarning, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { BugReport } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { updateBugStatus } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

function BugReportCard({ bug, onUpdateStatus, isUpdating }: { bug: BugReport, onUpdateStatus: (id: string, status: 'open' | 'closed') => void, isUpdating: boolean }) {
  const isClosed = bug.status === 'closed';

  return (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`p-4 rounded-lg glass-card flex justify-between items-start gap-4 border-l-4 ${isClosed ? 'border-green-500/70' : 'border-yellow-500/70'}`}
    >
      <div className="flex-1 space-y-2">
        <p className="text-foreground">{bug.description}</p>
        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-4">
          <span>Reported by: <span className="text-accent">{bug.userName}</span></span>
          <span>{formatDistanceToNow(new Date(bug.timestamp), { addSuffix: true })}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Button
            size="sm"
            variant={isClosed ? 'outline' : 'secondary'}
            onClick={() => onUpdateStatus(bug.id, isClosed ? 'open' : 'closed')}
            disabled={isUpdating}
            className="w-24 font-bold"
        >
          {isUpdating ? <Loader2 className="animate-spin" /> : (
            isClosed ? <><X className='w-4 h-4 mr-2' /> Re-open</> : <><Check className='w-4 h-4 mr-2' /> Close</>
          )}
        </Button>
      </div>
    </motion.div>
  );
}


export default function AdminPage() {
  const router = useRouter();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loadingBugs, setLoadingBugs] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'bug-reports'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const bugs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BugReport));
      setBugReports(bugs);
      setLoadingBugs(false);
    }, (error) => {
        console.error("Error fetching bug reports:", error);
        toast({ title: "Error", description: "Could not fetch bug reports.", variant: "destructive" });
        setLoadingBugs(false);
    });
    return () => unsubscribe();
  }, [toast]);
  
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

  const handleUpdateStatus = async (id: string, status: 'open' | 'closed') => {
    setUpdatingId(id);
    const result = await updateBugStatus(id, status);
    if (result.success) {
        toast({ title: "Success", description: result.message });
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
    setUpdatingId(null);
  }

  const { openBugs, closedBugs } = useMemo(() => {
    return bugReports.reduce((acc, bug) => {
      if (bug.status === 'open') {
        acc.openBugs.push(bug);
      } else {
        acc.closedBugs.push(bug);
      }
      return acc;
    }, { openBugs: [] as BugReport[], closedBugs: [] as BugReport[] });
  }, [bugReports]);

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
                    <MessageSquareWarning className="w-6 h-6 text-primary" />
                    <span>Bug Reports</span>
                </CardTitle>
                <CardDescription>
                    Review and manage user-submitted bug reports in real-time.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loadingBugs ? (
                    <div className="flex justify-center items-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="ml-4 text-lg">Loading Bug Reports...</p>
                    </div>
                ) : bugReports.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No bug reports submitted yet.</p>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-lg mb-2 text-yellow-400">Open Reports ({openBugs.length})</h3>
                            <div className="space-y-3">
                               <AnimatePresence>
                                {openBugs.length > 0 ? openBugs.map(bug => (
                                    <BugReportCard key={bug.id} bug={bug} onUpdateStatus={handleUpdateStatus} isUpdating={updatingId === bug.id} />
                                )) : <p className="text-sm text-muted-foreground">No open reports.</p>}
                                </AnimatePresence>
                            </div>
                        </div>
                        <div>
                             <h3 className="font-bold text-lg mb-2 text-green-400">Closed Reports ({closedBugs.length})</h3>
                            <div className="space-y-3">
                                <AnimatePresence>
                                {closedBugs.length > 0 ? closedBugs.map(bug => (
                                    <BugReportCard key={bug.id} bug={bug} onUpdateStatus={handleUpdateStatus} isUpdating={updatingId === bug.id} />
                                )) : <p className="text-sm text-muted-foreground">No closed reports.</p>}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
