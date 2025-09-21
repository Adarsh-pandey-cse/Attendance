'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAttendance } from '@/hooks/use-attendance';
import { User, Check, Edit2, Camera, Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { ImageCropDialog } from './image-crop-dialog';

export function ProfileSection() {
  const { userName, setUserName, profilePicture, setProfilePicture } = useAttendance();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(userName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [managementDialogOpen, setManagementDialogOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setName(userName);
  }, [userName]);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  const handleSaveName = () => {
    if (name.trim()) {
      setUserName(name.trim());
    } else {
      setName(userName);
    }
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveName();
    }
    if (e.key === 'Escape') {
      setName(userName);
      setIsEditingName(false);
    }
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToCrop(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    // Close the management dialog if it's open
    setManagementDialogOpen(false);
  };

  const handleAvatarClick = () => {
    if (profilePicture) {
      setManagementDialogOpen(true);
    } else {
      fileInputRef.current?.click();
    }
  };
  
  const handleRemovePicture = () => {
    setProfilePicture(null);
    setManagementDialogOpen(false);
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative group">
          <Dialog open={managementDialogOpen} onOpenChange={setManagementDialogOpen}>
            <DialogTrigger asChild>
              <button onClick={handleAvatarClick}>
                <Avatar className="w-12 h-12 border-2 border-primary/50 cursor-pointer">
                  <AvatarImage src={profilePicture} alt={userName} />
                  <AvatarFallback className="bg-primary/20">
                    <User className="w-6 h-6 text-primary" />
                  </AvatarFallback>
                </Avatar>
                {!profilePicture && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                )}
              </button>
            </DialogTrigger>
            {profilePicture && (
              <DialogContent className="sm:max-w-xs glass-card">
                <DialogHeader>
                  <DialogTitle>Profile Photo</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-2">
                   <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="justify-start"><Eye className="mr-2"/> View Image</Button>
                        </DialogTrigger>
                        <DialogContent className="p-0 max-w-md glass-card border-0">
                            <img src={profilePicture} alt="Profile" className="rounded-lg w-full h-auto"/>
                        </DialogContent>
                    </Dialog>
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="justify-start"><Camera className="mr-2"/> Change Image</Button>
                  <Button variant="destructive" onClick={handleRemovePicture} className="justify-start"><Trash2 className="mr-2"/> Remove Image</Button>
                </div>
              </DialogContent>
            )}
          </Dialog>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePictureChange}
            className="hidden"
            accept="image/*"
          />
        </div>

        <div className="relative">
          {isEditingName ? (
            <div className="flex items-center">
              <Input
                ref={nameInputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleSaveName}
                className="h-8 w-32 pr-8"
              />
              <button onClick={handleSaveName} className="absolute right-1 p-1 rounded-full hover:bg-primary/20">
                <Check className="w-4 h-4 text-primary" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2" onClick={() => setIsEditingName(true)}>
              <span className="font-bold text-lg cursor-pointer hover:text-primary/80 transition-colors">
                {isClient ? userName : 'Student'}
              </span>
              <Edit2 className="w-4 h-4 text-muted-foreground cursor-pointer" />
            </div>
          )}
        </div>
      </div>
      
      {imageToCrop && (
        <ImageCropDialog
            imageSrc={imageToCrop}
            onCropComplete={(croppedImageUrl) => {
                setProfilePicture(croppedImageUrl);
                setImageToCrop(null);
            }}
            onClose={() => setImageToCrop(null)}
        />
      )}
    </>
  );
}
