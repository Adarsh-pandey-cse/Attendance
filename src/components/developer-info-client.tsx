
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mail, User, Briefcase, Code, Copy, Building } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DeveloperInfo } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function DeveloperInfoClient({ devInfo }: { devInfo: DeveloperInfo }) {
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

  return (
    <Card className="glass-card w-full shadow-2xl shadow-primary/10">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
          <div className="relative">
             <div className="glowing-border-wrapper p-1.5">
                <Avatar className="w-24 h-24 md:w-40 md:h-40 border-4 border-background">
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
            <div className="flex items-center justify-center md:justify-start gap-1">
                <a href={`mailto:${devInfo?.email}`} className="font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm md:text-base break-all">
                    <Mail className='w-4 h-4' />
                    {devInfo?.email}
                </a>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground shrink-0" onClick={handleCopyEmail}>
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
  );
}


