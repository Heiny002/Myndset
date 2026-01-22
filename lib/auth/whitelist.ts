/**
 * Whitelisted Accounts Configuration
 *
 * These accounts have password-based authentication and bypass magic link flow.
 */

export interface WhitelistedAccount {
  email: string;
  role: 'user' | 'admin';
  password: string; // Stored as plain text only for development - DO NOT use in production
}

export const WHITELISTED_ACCOUNTS: WhitelistedAccount[] = [
  {
    email: 'jimheiniger@yahoo.com',
    role: 'user',
    password: 'Mynds3t-5816!',
  },
  {
    email: 'jimheiniger@gmail.com',
    role: 'admin',
    password: 'Mynds3t-5816!',
  },
];

/**
 * Check if an email is whitelisted
 */
export function isWhitelisted(email: string): boolean {
  return WHITELISTED_ACCOUNTS.some(
    (account) => account.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Get whitelisted account by email
 */
export function getWhitelistedAccount(email: string): WhitelistedAccount | null {
  return (
    WHITELISTED_ACCOUNTS.find(
      (account) => account.email.toLowerCase() === email.toLowerCase()
    ) || null
  );
}

/**
 * Verify password for whitelisted account
 */
export function verifyWhitelistedPassword(email: string, password: string): boolean {
  const account = getWhitelistedAccount(email);
  if (!account) return false;
  return account.password === password;
}
