
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Bug, Loader2, Paperclip, UploadCloud, X, File as FileIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAttendance } from '@/hooks/use-attendance';
import { saveBugReport } from '@/lib/actions';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'video/mp4': ['.mp4'],
};

export default function ReportBugPage() {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('');
  const { toast } = useToast();
  const { userName } = useAttendance();
  const router = useRouter();

  useEffect(() => {
    // Auto-fetch device info
    setDeviceInfo(navigator.userAgent);
  }, []);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    
    fileRejections.forEach((rejection: any) => {
      toast({
        title: "File Rejected",
        description: `${rejection.file.name}: ${rejection.errors[0].message}`,
        variant: "destructive",
      });
    });
  }, [files, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: ACCEPTED_FILE_TYPES,
  });

  const removeFile = (fileName: string) => {
    setFiles(files.filter(file => file.name !== fileName));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() === '') {
      toast({ title: 'Error', description: 'Please describe the bug.', variant: 'destructive' });
      return;
    }

    setIsSending(true);
    
    const formData = new FormData();
    formData.append('userName', userName);
    formData.append('description', description);
    formData.append('deviceInfo', deviceInfo);
    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const result = await saveBugReport(formData);

      if (result.success) {
        toast({
          title: 'Report Sent!',
          description: 'Thank you for your feedback! The admin will review it shortly.',
        });
        router.push('/');
      } else {
        throw new Error(result.message || 'Failed to submit bug report.');
      }
    } catch (error: any) {
      console.error('Error submitting bug report:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="flex justify-center min-h-screen bg-gradient-to-b from-background to-slate-900/50">
      <div className="w-full max-w-2xl p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Report a Bug</h1>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bug className="w-6 h-6 text-destructive" />
              <span>Submit a New Bug Report</span>
            </CardTitle>
            <CardDescription>
              Help us improve AttendX by describing the issue you've encountered. Your report will be sent to the admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="font-semibold mb-2 block">Bug Description (Required)</label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide as much detail as possible about the bug..."
                  rows={6}
                  required
                  disabled={isSending}
                />
              </div>

              <div>
                <label className="font-semibold mb-2 block">Attach Files (Screenshots, Logs, etc.)</label>
                <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-lg cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}>
                  <input {...getInputProps()} />
                  <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  {isDragActive ? (
                    <p className="font-semibold text-primary">Drop the files here ...</p>
                  ) : (
                    <p className="text-muted-foreground">Drag 'n' drop files here, or click to select files</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB per file. Supports PNG, JPG, TXT, PDF, MP4.</p>
                </div>
                 {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Selected files:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {files.map(file => (
                            <div key={file.name} className="relative group glass-card p-2 rounded-lg flex items-center gap-2 overflow-hidden">
                                {file.type.startsWith('image/') ? (
                                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-10 h-10 object-cover rounded-md" />
                                ) : (
                                    <FileIcon className="w-10 h-10 text-primary" />
                                )}
                                <span className="text-sm truncate flex-1">{file.name}</span>
                                <button type="button" onClick={() => removeFile(file.name)} className="absolute top-1 right-1 p-0.5 bg-destructive/80 rounded-full text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="font-semibold mb-2 block">Device Information (Auto-detected)</label>
                <p className="text-sm p-3 bg-slate-900 rounded-md font-mono whitespace-normal break-words">{deviceInfo}</p>
              </div>

              <Button type="submit" disabled={isSending || !description.trim()} className="w-full font-bold h-12 text-lg">
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Paperclip className="mr-2 h-5 w-5" />
                    Submit Bug Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
