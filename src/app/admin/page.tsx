
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, LogOut, Wrench, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/admin/login');
  };

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
      </div>
    </main>
  );
}
