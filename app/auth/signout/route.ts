import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  // Sign out the user
  await supabase.auth.signOut();

  // Get the origin for redirect
  const { origin } = new URL(request.url);

  // Redirect to home page
  return NextResponse.redirect(`${origin}/`, {
    status: 302,
  });
}
