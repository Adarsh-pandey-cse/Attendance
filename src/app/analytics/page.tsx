import { AnalyticsClientPage } from '@/components/analytics-client-page';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
         <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
                <Link href="/">
                <ArrowLeft />
                </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Attendance Analytics</h1>
        </div>
        <AnalyticsClientPage />
      </div>
    </main>
  );
}
