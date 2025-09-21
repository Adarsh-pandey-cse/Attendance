'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAttendance } from '@/hooks/use-attendance';
import { User, Check, Edit2 } from 'lucide-react';

export function ProfileSection() {
  const { userName, setUserName, profilePicture, setProfilePicture } = useAttendance();
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(userName);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setName(userName); // Reset if input is empty
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
        setProfilePicture(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative group">
        <Avatar className="w-12 h-12 border-2 border-primary/50">
          <AvatarImage src={profilePicture} alt={userName} />
          <AvatarFallback className="bg-primary/20">
            <User className="w-6 h-6 text-primary" />
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="w-5 h-5 text-white" />
        </button>
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
            <span className="font-semibold text-lg cursor-pointer hover:text-primary/80 transition-colors">
              {userName}
            </span>
             <Edit2 className="w-4 h-4 text-muted-foreground cursor-pointer" />
          </div>
        )}
      </div>
    </div>
  );
}
