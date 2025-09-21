
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

    try {
      await addDoc(collection(db, 'bug-reports'), {
        description: description.trim(),
        timestamp: serverTimestamp(),
        status: 'new',
        userName: 'Anonymous', // In a real app, you'd get this from session/auth
      });

      return NextResponse.json({ message: 'Bug report submitted successfully!' }, { status: 200 });

    } catch (dbError) {
      console.error('Firestore Error:', dbError);
      return NextResponse.json({ message: 'Could not submit bug report to the database.' }, { status: 500 });
    }

  } catch (error) {
    console.error('API Error:', error);
    // This catches errors like invalid JSON in the request body
    return NextResponse.json({ message: 'An invalid request was sent.' }, { status: 400 });
  }
}
