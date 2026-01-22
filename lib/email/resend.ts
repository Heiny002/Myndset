/**
 * Resend email integration for transactional emails
 */

import { Resend } from 'resend';

/**
 * Initialize Resend client
 */
export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  return new Resend(apiKey);
}

/**
 * Send email notification when meditation is ready
 */
export async function sendMeditationReadyEmail({
  to,
  userName,
  meditationId,
  meditationTitle,
}: {
  to: string;
  userName?: string;
  meditationId: string;
  meditationTitle: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  // Direct link to meditation in dashboard
  const meditationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?meditation=${meditationId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Myndset <notifications@trymyndset.com>',
      to: [to],
      subject: `Your personalized meditation is ready 🎯`,
      html: generateMeditationReadyHTML({
        userName,
        meditationTitle,
        meditationUrl,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`,
      }),
      text: generateMeditationReadyText({
        userName,
        meditationTitle,
        meditationUrl,
        unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Generate HTML email template for meditation ready notification
 */
function generateMeditationReadyHTML({
  userName,
  meditationTitle,
  meditationUrl,
  unsubscribeUrl,
}: {
  userName?: string;
  meditationTitle: string;
  meditationUrl: string;
  unsubscribeUrl: string;
}): string {
  const greeting = userName ? `Hi ${userName}` : 'Hi';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Meditation is Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #121212; border: 1px solid #262626; border-radius: 8px;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #00ff88;">Myndset</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #737373;">Meditation for boardrooms, not yoga studios</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #ffffff;">${greeting} 👋</h2>
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #d4d4d4;">
                Your personalized meditation is ready to sharpen your performance edge.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #d4d4d4;">
                <strong style="color: #00ff88;">${meditationTitle}</strong> has been crafted specifically for your goals and challenges.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="border-radius: 6px; background-color: #00ff88;">
                    <a href="${meditationUrl}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #0a0a0a; text-decoration: none;">
                      Listen Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 8px 0; font-size: 14px; color: #737373;">
                This meditation was designed using AI-driven personalization based on your psychological assessment. Use it before high-stakes moments to optimize your mental state for peak performance.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #262626;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #737373; text-align: center;">
                Questions? Reply to this email or visit <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #00ff88; text-decoration: none;">trymyndset.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #525252; text-align: center;">
                <a href="${unsubscribeUrl}" style="color: #525252; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email for meditation ready notification
 */
function generateMeditationReadyText({
  userName,
  meditationTitle,
  meditationUrl,
  unsubscribeUrl,
}: {
  userName?: string;
  meditationTitle: string;
  meditationUrl: string;
  unsubscribeUrl: string;
}): string {
  const greeting = userName ? `Hi ${userName}` : 'Hi';

  return `
${greeting},

Your personalized meditation is ready to sharpen your performance edge.

"${meditationTitle}" has been crafted specifically for your goals and challenges.

Listen now: ${meditationUrl}

This meditation was designed using AI-driven personalization based on your psychological assessment. Use it before high-stakes moments to optimize your mental state for peak performance.

---

Questions? Reply to this email or visit ${process.env.NEXT_PUBLIC_APP_URL}

Unsubscribe: ${unsubscribeUrl}

Myndset - Meditation for boardrooms, not yoga studios
  `.trim();
}

/**
 * Custom error class for email errors
 */
export class EmailError extends Error {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'EmailError';
    this.originalError = originalError;
  }
}
