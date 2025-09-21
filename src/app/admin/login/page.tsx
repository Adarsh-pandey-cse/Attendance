
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, KeyRound, LogIn, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminLoginPage() {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (adminId === 'Admin@pandeyji' && password === 'harekrishna') {
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      router.push('/admin');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-background to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-sm glass-card shadow-2xl shadow-primary/20 border-primary/20">
          <CardHeader className="text-center">
            <motion.div
                initial={{scale:0}}
                animate={{scale:1}}
                transition={{delay:0.2, duration:0.3}}
                className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4 border-2 border-primary/30"
            >
                <Shield className="w-10 h-10 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">Admin Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your credentials to manage the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="adminId" className="font-semibold flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Admin ID
                </Label>
                <Input
                  id="adminId"
                  type="text"
                  placeholder="Enter your Admin ID"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  required
                  className="h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold flex items-center gap-2">
                  <KeyRound className="w-4 h-4" /> Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-base"
                />
              </div>

              {error && (
                <motion.div
                  initial={{opacity:0, y:-10}}
                  animate={{opacity:1, y:0}}
                  className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-lg flex items-center gap-3 text-sm font-semibold"
                >
                  <TriangleAlert className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full h-12 text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg">
                  <LogIn className="mr-2" /> Secure Login
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </main>
  );
}
