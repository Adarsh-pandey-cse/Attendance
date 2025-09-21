import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bugDescription } = body;

    // 1. Validate Input
    if (!bugDescription || typeof bugDescription !== 'string' || bugDescription.trim() === '') {
      return NextResponse.json({ error: 'Bug description is required and must be a string.' }, { status: 400 });
    }

    // 2. Sanitize and Trim
    const sanitizedDescription = bugDescription.trim();
    if (sanitizedDescription.length > 5000) {
        return NextResponse.json({ error: 'Description is too long.' }, { status: 400 });
    }

    // 3. Save to Firestore - AWAIT was missing here
    await addDoc(collection(db, 'bug-reports'), {
      description: sanitizedDescription,
      userName: 'Anonymous', // Simplified for reliability
      deviceInfo: 'Not provided', // Simplified for reliability
      timestamp: serverTimestamp(),
      status: 'new',
      attachments: [], // No attachments in this simplified version
    });

    // 4. Respond with Success
    return NextResponse.json({ message: 'Bug submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Bug Submission API Error:', error);
    
    // Check for specific JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 });
    }

    // 5. Generic Error for everything else
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
