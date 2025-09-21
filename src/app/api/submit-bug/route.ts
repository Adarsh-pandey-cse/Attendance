
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

  // 1. Validate Input
  if (!bugDescription || typeof bugDescription !== 'string' || bugDescription.trim() === '') {
    return NextResponse.json({ error: 'Bug description is required and must be a string.' }, { status: 400 });
  }

  // 2. Sanitize and Trim
  const sanitizedDescription = bugDescription.trim();
  if (sanitizedDescription.length > 5000) {
      return NextResponse.json({ error: 'Description is too long. Max 5000 characters.' }, { status: 400 });
  }

  try {
    // 3. Save to Firestore
    await addDoc(collection(db, 'bug-reports'), {
      description: sanitizedDescription,
      userName: 'Anonymous', // Simplified for now for maximum reliability
      deviceInfo: 'Not provided',
      timestamp: serverTimestamp(),
      status: 'new',
    });

    // 4. Respond with Success
    return NextResponse.json({ message: 'Bug submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Firestore Error:', error);
    // 5. Generic Error for database issues or other unexpected problems
    return NextResponse.json({ error: 'An internal server error occurred while saving the report.' }, { status: 500 });
  }
}
