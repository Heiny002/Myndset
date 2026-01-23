/**
 * Admin Authentication Utilities
 *
 * Helpers for checking if a user has admin privileges.
 * During MVP, admin access is determined by email match.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Check if the current user is an admin
 * For MVP: Jim's email is hardcoded as admin
 * For production: Should check admin_users table
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('[isAdmin] User check:', {
      hasUser: !!user,
      email: user?.email,
      error: error?.message
    });

    if (error || !user) {
      console.log('[isAdmin] No user found or error');
      return false;
    }

    // For MVP: Hardcode Jim's email as admin
    // TODO: In production, check admin_users table
    const adminEmails = [
      'jim@trymyndset.com',
      'heiny002@gmail.com',
      'jimheiniger@gmail.com',
      // Add other admin emails as needed
    ];

    const isAdminUser = adminEmails.includes(user.email?.toLowerCase() || '');
    console.log('[isAdmin] Result:', {
      userEmail: user.email,
      isAdmin: isAdminUser
    });

    return isAdminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin user data from database
 * Returns admin record if user is admin, null otherwise
 */
export async function getAdminUser() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Check if user exists in admin_users table
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (error || !adminUser) {
      return null;
    }

    return adminUser;
  } catch (error) {
    console.error('Error fetching admin user:', error);
    return null;
  }
}

/**
 * Require admin access - redirects if not admin
 * Use in server components and route handlers
 */
export async function requireAdmin() {
  const admin = await isAdmin();

  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }

  return true;
}
