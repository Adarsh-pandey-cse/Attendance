
'use client';

import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Save, User, Mail, FileText, Camera, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { DeveloperInfo } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { saveDeveloperInfo } from '@/lib/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { ImageCropDialog } from '@/components/image-crop-dialog';

export default function EditDeveloperInfoPage() {
  const [devInfo, setDevInfo] = useState<Partial<DeveloperInfo>>({
    name: '',
    email: '',
    bio: '',
    profilePicture: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);


  useEffect(() => {
    const devInfoDocRef = doc(db, 'settings', 'developerInfo');
    const unsubscribe = onSnapshot(devInfoDocRef, (doc) => {
      if (doc.exists()) {
        setDevInfo(doc.data() as DeveloperInfo);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDevInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToCrop(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
       e.target.value = ''; // Reset file input
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveDeveloperInfo(devInfo);
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
    <main className="flex justify-center min-h-screen">
      <div className="w-full max-w-2xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Developer Info</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Developer Profile</CardTitle>
            <CardDescription>Update your public developer information. This will be visible on the "Developer Info" page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className='flex items-center gap-6'>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="w-24 h-24 border-4 border-primary/30">
                    <AvatarImage src={devInfo.profilePicture || ''} alt={devInfo.name} />
                    <AvatarFallback className="bg-primary/10">
                        <User className="w-10 h-10 text-primary" />
                    </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-8 h-8 text-white" />
                    </div>
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePictureChange} className="hidden" accept="image/*" />
                
                <div className='flex-1 space-y-2'>
                    <Button onClick={() => fileInputRef.current?.click()}><Camera className="mr-2" /> Change Picture</Button>
                    <Button variant="destructive" onClick={() => setDevInfo(prev => ({...prev, profilePicture: null}))}><Trash2 className="mr-2" /> Remove Picture</Button>
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className='font-semibold flex items-center gap-2'><User className='w-4 h-4' />Name</Label>
              <Input id="name" name="name" value={devInfo.name || ''} onChange={handleInputChange} placeholder="Your Name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className='font-semibold flex items-center gap-2'><Mail className='w-4 h-4' />Email</Label>
              <Input id="email" name="email" type="email" value={devInfo.email || ''} onChange={handleInputChange} placeholder="your.email@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio" className='font-semibold flex items-center gap-2'><FileText className='w-4 h-4' />Bio / About</Label>
              <Textarea id="bio" name="bio" value={devInfo.bio || ''} onChange={handleInputChange} placeholder="Tell us a bit about yourself or the app." rows={4} />
            </div>
            
            <Button onClick={handleSave} disabled={saving || loading} className="w-full font-bold">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
    
    {imageToCrop && (
        <ImageCropDialog
            imageSrc={imageToCrop}
            onCropComplete={(croppedImageUrl) => {
                setDevInfo(prev => ({ ...prev, profilePicture: croppedImageUrl}));
                setImageToCrop(null);
            }}
            onClose={() => setImageToCrop(null)}
        />
      )}
    </>
  );
}
