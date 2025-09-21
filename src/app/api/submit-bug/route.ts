
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { z } from 'zod';

const BugSchema = z.object({
  description: z.string().trim().min(1, { message: "Description cannot be empty." }),
});

export async function POST(req: Request) {
  try {
    // 1. Parse the request body
    const body = await req.json();

    // 2. Validate the data
    const validation = BugSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }
    
    const { description } = validation.data;

    // 3. Save to Firestore
    try {
      await addDoc(collection(db, 'bug-reports'), {
        description,
        timestamp: serverTimestamp(),
        status: 'new',
        userName: 'Anonymous', // Default value
      });
      
      // 4. Return success response
      return NextResponse.json({ message: 'Bug report submitted successfully!' }, { status: 200 });

    } catch (dbError) {
      console.error('Firestore Error:', dbError);
      return NextResponse.json({ message: 'Failed to save bug report to the database.' }, { status: 500 });
    }

  } catch (error) {
    console.error('API Error:', error);
    // This catches errors from req.json() if the body is malformed, or any other unexpected errors.
    return NextResponse.json({ message: 'An invalid request was sent.' }, { status: 400 });
  }
}
