import { CheckCircle } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex justify-center items-center gap-2">
      <CheckCircle className="w-8 h-8 text-primary" />
      <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent glowing-text">
        AttendX
      </h1>
    </div>
  );
}
