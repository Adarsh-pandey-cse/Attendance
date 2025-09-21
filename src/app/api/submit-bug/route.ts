
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description } = body;

    if (!description || typeof description !== 'string' || description.trim() === '') {
      return NextResponse.json({ message: 'Description is required and cannot be empty.' }, { status: 400 });
    }

    // This is the database operation
    await addDoc(collection(db, 'bug-reports'), {
      description: description.trim(),
      timestamp: serverTimestamp(),
      status: 'new',
      userName: 'Anonymous', // In a real app, you'd get this from session/auth
    });

    // If it gets here, the save was successful
    return NextResponse.json({ message: 'Bug report submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    // This generic catch block ensures that if anything fails (parsing JSON, DB error, etc.),
    // we always return a valid JSON response, preventing the HTML error.
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
