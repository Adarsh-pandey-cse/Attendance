import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Code, Mail, User } from 'lucide-react';
import Link from 'next/link';

export default function DeveloperInfoPage() {
  return (
    <main className="flex justify-center min-h-screen bg-gradient-to-b from-background to-slate-900/50">
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
            <CardTitle className="flex items-center gap-3">
              <Code className="w-8 h-8 text-primary" />
              <span>Developed By</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="font-semibold text-lg">Adarsh Pandey</span>
            </div>
            <Separator />
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <a href="mailto:adarshpandey880079@gmail.com" className="font-semibold text-lg text-accent hover:underline">
                adarshpandey880079@gmail.com
              </a>
            </div>
             <p className="text-sm text-muted-foreground pt-4">
              This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
