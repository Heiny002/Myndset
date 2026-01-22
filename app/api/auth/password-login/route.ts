import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyWhitelistedPassword, getWhitelistedAccount } from '@/lib/auth/whitelist';

/**
 * Password-based login for whitelisted accounts
 *
 * IMPORTANT: This is a development/convenience feature.
 * In production, you should use proper password hashing (bcrypt, argon2, etc.)
 * or rely solely on Supabase's built-in authentication.
 */

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify whitelisted account credentials
    if (!verifyWhitelistedPassword(email, password)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const account = getWhitelistedAccount(email);

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    const supabase = await createClient();

    // Check if user already exists in Supabase Auth
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const user = existingUser?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (user) {
      // User exists - sign them in
      userId = user.id;

      // Create session by updating user
      const { error: signInError } = await supabase.auth.admin.updateUserById(user.id, {
        email_confirm: true,
      });

      if (signInError) {
        console.error('Error confirming user:', signInError);
      }

      // Sign in with password (create a temporary password if needed)
      // Since Supabase requires a password, we'll use the admin API to create a session
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (sessionError) {
        // If password sign-in fails, user may not have a password set
        // In this case, we need to update the user with a password
        const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
          password: password,
          email_confirm: true,
        });

        if (updateError) {
          console.error('Error updating user password:', updateError);
          return NextResponse.json(
            { error: 'Failed to set up authentication' },
            { status: 500 }
          );
        }

        // Try signing in again
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

        if (retryError) {
          console.error('Error signing in after password update:', retryError);
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
          );
        }
      }
    } else {
      // User doesn't exist - create them
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email.toLowerCase(),
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: account.role === 'admin' ? 'Jim (Admin)' : 'Jim',
        },
      });

      if (createError || !newUser.user) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      userId = newUser.user.id;

      // Sign in the newly created user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (signInError) {
        console.error('Error signing in new user:', signInError);
        return NextResponse.json(
          { error: 'Failed to sign in' },
          { status: 500 }
        );
      }

      // If admin, add to admin_users table
      if (account.role === 'admin') {
        const { error: adminError } = await supabase
          .from('admin_users')
          .insert({
            user_id: userId,
            role: 'admin',
          })
          .select()
          .single();

        if (adminError) {
          console.error('Error adding admin user:', adminError);
          // Don't fail the request, admin status can be added later
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      role: account.role,
    });
  } catch (error) {
    console.error('Password login error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
