'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAttendance } from '@/hooks/use-attendance';
import { User, Check } from 'lucide-react';

export function ProfileSection() {
  const { userName, setUserName } = useAttendance();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(userName);
  }, [userName]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (name.trim()) {
      setUserName(name.trim());
    } else {
      setName(userName); // Reset if input is empty
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
    if (e.key === 'Escape') {
      setName(userName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10 border-2 border-primary/50">
        <AvatarFallback className="bg-primary/20">
          <User className="w-5 h-5 text-primary" />
        </AvatarFallback>
      </Avatar>
      <div className="relative" onClick={() => !isEditing && setIsEditing(true)}>
        {isEditing ? (
          <div className="flex items-center">
            <Input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="h-8 w-32 pr-8"
            />
            <button onClick={handleSave} className="absolute right-1 p-1 rounded-full hover:bg-primary/20">
              <Check className="w-4 h-4 text-primary" />
            </button>
          </div>
        ) : (
          <span className="font-semibold text-lg cursor-pointer hover:text-primary/80 transition-colors">
            {userName}
          </span>
        )}
      </div>
    </div>
  );
}
