import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('Code exchange error:', error);
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  // Handle magic link flow (token_hash)
  // Valid EmailOtpType values: 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'
  if (token_hash && type) {
    const validTypes = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const;
    type EmailOtpType = (typeof validTypes)[number];

    if (validTypes.includes(type as EmailOtpType)) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as EmailOtpType,
      });
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('OTP verification error:', error);
      return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
    }
  }

  // No valid auth params
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('Invalid authentication link')}`);
}
