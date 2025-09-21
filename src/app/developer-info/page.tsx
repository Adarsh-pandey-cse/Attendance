
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Code, Mail, User, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeveloperInfo } from '@/types';

export default function DeveloperInfoPage() {
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const devInfoDocRef = doc(db, 'settings', 'developerInfo');
    const unsubscribe = onSnapshot(devInfoDocRef, (doc) => {
      if (doc.exists()) {
        setDevInfo(doc.data() as DeveloperInfo);
      } else {
        // Set default info if not found
        setDevInfo({
          name: 'Adarsh Pandey',
          email: 'adarshpandey880079@gmail.com',
          bio: 'This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.',
          profilePicture: null,
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching developer info:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-lg p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Developer Info</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-2 border-primary">
                <AvatarImage src={devInfo?.profilePicture || ''} alt={devInfo?.name} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  <Code className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-bold">{devInfo?.name}</CardTitle>
                <p className="font-semibold text-accent hover:underline">
                    {devInfo?.email}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <p className="text-sm text-muted-foreground">
              {devInfo?.bio}
            </p>
            <Separator />
             <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-lg">{devInfo?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <a href={`mailto:${devInfo?.email}`} className="font-semibold text-lg text-accent hover:underline">
                {devInfo?.email}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
