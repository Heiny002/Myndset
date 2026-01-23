/**
 * Payment Notification Emails
 *
 * Sends transactional emails for payment-related events
 */

import { getResendClient, EmailError } from './resend';

interface PaymentFailedEmailParams {
  to: string;
  invoiceUrl?: string;
  amountDue: number;
  nextRetryDate?: string;
}

/**
 * Send email notification when a payment fails
 */
export async function sendPaymentFailedEmail({
  to,
  invoiceUrl,
  amountDue,
  nextRetryDate,
}: PaymentFailedEmailParams): Promise<void> {
  const resend = getResendClient();

  const subject = 'Payment Issue with Your Myndset Subscription';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #121212; border-radius: 8px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                Payment Issue
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                We had trouble processing your recent payment of <strong style="color: #ffffff;">$${amountDue.toFixed(2)}</strong> for your Myndset subscription.
              </p>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                This could happen for a variety of reasons, such as:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                <li style="margin-bottom: 8px;">Insufficient funds</li>
                <li style="margin-bottom: 8px;">Expired card</li>
                <li style="margin-bottom: 8px;">Card security settings</li>
                <li>Incorrect billing information</li>
              </ul>

              ${nextRetryDate ? `
              <div style="background-color: #1a1a1a; border-left: 3px solid #00ff88; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #a3a3a3;">
                  <strong style="color: #ffffff;">Next retry:</strong> ${nextRetryDate}
                </p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #a3a3a3;">
                  We'll automatically retry the payment. You don't need to do anything if your payment method is valid.
                </p>
              </div>
              ` : ''}

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                To keep your subscription active and avoid any interruption to your meditations, please update your payment method.
              </p>

              <!-- CTA Button -->
              ${invoiceUrl ? `
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${invoiceUrl}" style="display: inline-block; padding: 14px 32px; background-color: #00ff88; color: #0a0a0a; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                      Update Payment Method
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                If you continue to experience issues or have questions, please reply to this email or contact us at <a href="mailto:hello@trymyndset.com" style="color: #00ff88; text-decoration: none;">hello@trymyndset.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0a0a0a; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #ffffff;">
                Myndset
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #737373; line-height: 1.5;">
                Meditation for boardrooms, not yoga studios
              </p>
              <p style="margin: 0; font-size: 11px; color: #525252;">
                <a href="https://trymyndset.com/settings/notifications" style="color: #525252; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Payment Issue with Your Myndset Subscription

We had trouble processing your recent payment of $${amountDue.toFixed(2)} for your Myndset subscription.

This could happen for a variety of reasons, such as:
- Insufficient funds
- Expired card
- Card security settings
- Incorrect billing information

${nextRetryDate ? `Next retry: ${nextRetryDate}\nWe'll automatically retry the payment. You don't need to do anything if your payment method is valid.\n` : ''}

To keep your subscription active and avoid any interruption to your meditations, please update your payment method.

${invoiceUrl ? `Update Payment Method: ${invoiceUrl}\n` : ''}

If you continue to experience issues or have questions, please contact us at hello@trymyndset.com.

---
Myndset - Meditation for boardrooms, not yoga studios
Unsubscribe: https://trymyndset.com/settings/notifications
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: 'Myndset <notifications@trymyndset.com>',
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw new EmailError('Failed to send payment failed email', error);
    }

    console.log('Payment failed email sent:', data?.id);
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw error;
  }
}

interface SubscriptionCanceledEmailParams {
  to: string;
  userName?: string;
  cancellationDate: string;
}

/**
 * Send email notification when a subscription is canceled
 */
export async function sendSubscriptionCanceledEmail({
  to,
  userName,
  cancellationDate,
}: SubscriptionCanceledEmailParams): Promise<void> {
  const resend = getResendClient();

  const subject = 'Your Myndset Subscription Has Been Canceled';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a; color: #e5e5e5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #121212; border-radius: 8px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #2a2a2a;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">
                Subscription Canceled
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              ${userName ? `<p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">Hi ${userName},</p>` : ''}

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                Your Myndset subscription has been canceled as of <strong style="color: #ffffff;">${cancellationDate}</strong>.
              </p>

              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                Your account has been downgraded to the Free tier, which includes:
              </p>

              <ul style="margin: 0 0 24px; padding-left: 24px; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                <li style="margin-bottom: 8px;">1 personalized meditation per month</li>
                <li>2 script remixes per month</li>
              </ul>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #e5e5e5;">
                We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime from your dashboard.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="https://trymyndset.com/pricing" style="display: inline-block; padding: 14px 32px; background-color: #00ff88; color: #0a0a0a; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 6px;">
                      View Plans
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #a3a3a3;">
                If you have feedback about your experience or questions, we'd love to hear from you at <a href="mailto:hello@trymyndset.com" style="color: #00ff88; text-decoration: none;">hello@trymyndset.com</a>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0a0a0a; border-top: 1px solid #2a2a2a;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #ffffff;">
                Myndset
              </p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #737373; line-height: 1.5;">
                Meditation for boardrooms, not yoga studios
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Your Myndset Subscription Has Been Canceled

${userName ? `Hi ${userName},\n\n` : ''}Your Myndset subscription has been canceled as of ${cancellationDate}.

Your account has been downgraded to the Free tier, which includes:
- 1 personalized meditation per month
- 2 script remixes per month

We're sorry to see you go! If you change your mind, you can reactivate your subscription anytime from your dashboard.

View Plans: https://trymyndset.com/pricing

If you have feedback about your experience or questions, we'd love to hear from you at hello@trymyndset.com.

---
Myndset - Meditation for boardrooms, not yoga studios
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: 'Myndset <notifications@trymyndset.com>',
      to,
      subject,
      html,
      text,
    });

    if (error) {
      throw new EmailError('Failed to send subscription canceled email', error);
    }

    console.log('Subscription canceled email sent:', data?.id);
  } catch (error) {
    console.error('Error sending subscription canceled email:', error);
    throw error;
  }
}
