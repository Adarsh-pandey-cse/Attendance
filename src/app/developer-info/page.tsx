
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, User, Loader2, Building, Briefcase, Code, Copy } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeveloperInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function DeveloperInfoPage() {
  const [devInfo, setDevInfo] = useState<DeveloperInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const handleCopyEmail = () => {
    if (devInfo?.email) {
      navigator.clipboard.writeText(devInfo.email);
      toast({
        title: 'Copied!',
        description: 'Email address copied to clipboard.',
      });
    }
  };

  useEffect(() => {
    const devInfoDocRef = doc(db, 'settings', 'developerInfo');
    const unsubscribe = onSnapshot(devInfoDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as DeveloperInfo;
        setDevInfo({
          name: data.name || 'Adarsh Pandey',
          email: data.email || 'adarshpandey880079@gmail.com',
          bio: data.bio || 'This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.',
          profilePicture: data.profilePicture || 'https://i.postimg.cc/TwDqn8Gn/cropped-image.png',
        });
      } else {
        setDevInfo({
          name: 'Adarsh Pandey',
          email: 'adarshpandey880079@gmail.com',
          bio: 'This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.',
          profilePicture: 'https://i.postimg.cc/TwDqn8Gn/cropped-image.png',
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching developer info:", error);
      setDevInfo({
        name: 'Adarsh Pandey',
        email: 'adarshpandey880079@gmail.com',
        bio: 'This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.',
        profilePicture: 'https://i.postimg.cc/TwDqn8Gn/cropped-image.png',
      });
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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-background to-slate-900 p-4">
      <div className="w-full max-w-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Developer Profile</h1>
        </div>

        <Card className="glass-card w-full shadow-2xl shadow-primary/10">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="relative">
                <div className="glowing-border-wrapper p-1.5">
                    <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background">
                        <AvatarImage src={devInfo?.profilePicture || ''} alt={devInfo?.name} />
                        <AvatarFallback className="bg-primary/20 text-primary text-5xl font-bold">
                        {devInfo?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                    </Avatar>
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  {devInfo?.name}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2">
                    <a href={`mailto:${devInfo?.email}`} className="font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Mail className='w-4 h-4' />
                        {devInfo?.email}
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleCopyEmail}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>

                <div className="mt-4 flex gap-2 justify-center md:justify-start flex-wrap">
                    <Badge variant="secondary" className="gap-1.5"><Code/> Next.js</Badge>
                    <Badge variant="secondary" className="gap-1.5"><Briefcase/> React</Badge>
                    <Badge variant="secondary" className="gap-1.5"><Building/> Firebase</Badge>
                </div>
              </div>
            </div>

            <Separator className="my-6 md:my-8" />

            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-2"><User className="text-primary"/> About Me</h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                {devInfo?.bio}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
