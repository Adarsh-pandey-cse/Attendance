
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DeveloperInfo } from '@/types';
import { DeveloperInfoClient } from '@/components/developer-info-client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getDeveloperInfo(): Promise<DeveloperInfo> {
  const devInfoDocRef = doc(db, 'settings', 'developerInfo');
  try {
    const docSnap = await getDoc(devInfoDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as DeveloperInfo;
      // Ensure defaults are applied if fields are missing
      return {
        name: data.name || 'Adarsh Pandey',
        email: data.email || 'adarshpandey880079@gmail.com',
        bio: data.bio || 'This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.',
        profilePicture: data.profilePicture || 'https://i.postimg.cc/TwDqn8Gn/cropped-image.png',
      };
    }
  } catch (error) {
    console.error("Error fetching developer info:", error);
  }
  // Return default info if doc doesn't exist or on error
  return {
    name: 'Adarsh Pandey',
    email: 'adarshpandey880079@gmail.com',
    bio: 'This application was built with modern web technologies, showcasing a professional and intuitive user experience for students.',
    profilePicture: 'https://i.postimg.cc/TwDqn8Gn/cropped-image.png',
  };
}

export default async function DeveloperInfoPage() {
  const devInfo = await getDeveloperInfo();

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
        <DeveloperInfoClient devInfo={devInfo} />
      </div>
    </main>
  );
}
