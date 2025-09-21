
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (error) {
    console.error('Error parsing JSON from request:', error);
    return NextResponse.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 });
  }

  const { bugDescription } = body;

  if (!bugDescription || typeof bugDescription !== 'string' || bugDescription.trim() === '') {
    return NextResponse.json({ error: 'Bug description is required and must be a non-empty string.' }, { status: 400 });
  }

  if (bugDescription.length > 5000) {
      return NextResponse.json({ error: 'Description is too long. Max 5000 characters.' }, { status: 400 });
  }
  
  const sanitizedDescription = bugDescription.trim();

  try {
    await addDoc(collection(db, 'bug-reports'), {
      description: sanitizedDescription,
      userName: 'Anonymous',
      timestamp: serverTimestamp(),
      status: 'new',
    });

    return NextResponse.json({ message: 'Bug submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Firestore Error:', error);
    return NextResponse.json({ error: 'An internal server error occurred while saving the report.' }, { status: 500 });
  }
}
