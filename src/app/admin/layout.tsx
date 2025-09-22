
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // If we're on the login page, don't check for auth status
    if (pathname === '/admin/login') {
      setIsVerifying(false);
      return;
    }

    // Check session storage for the auth flag
    const isAdminAuthenticated = sessionStorage.getItem('isAdminAuthenticated');

    if (isAdminAuthenticated !== 'true') {
      router.replace('/admin/login');
    } else {
      setIsVerifying(false);
    }
  }, [pathname, router]);

  if (isVerifying && pathname !== '/admin/login') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
