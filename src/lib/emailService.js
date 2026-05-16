// =============================================
// ADMIN EMAIL NOTIFICATION SERVICE
// =============================================
// Sends branded HTML email to site admin when events are published.
// Uses Resend API (free tier: 100 emails/day).
// For production, move this to a Supabase Edge Function.

const ADMIN_EMAIL = 'ev3nthub@gmail.com';
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY || '';

function buildEmailHTML(eventData, organizerData) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background: #0f0a1e; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
    .header { text-align: center; padding: 32px 0; border-bottom: 1px solid rgba(139,92,246,0.3); }
    .logo { font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; padding: 6px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #a855f7; background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.3); border-radius: 100px; margin-top: 12px; }
    .section { margin: 28px 0; padding: 24px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #a855f7; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .row:last-child { border-bottom: none; }
    .label { font-size: 13px; color: #94a3b8; }
    .value { font-size: 13px; font-weight: 600; color: #f1f5f9; text-align: right; max-width: 60%; word-break: break-word; }
    .footer { text-align: center; padding: 24px 0; margin-top: 16px; border-top: 1px solid rgba(139,92,246,0.2); font-size: 12px; color: #64748b; }
    .highlight { color: #c084fc; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚡ EventHub</div>
      <div class="badge">New Event Published</div>
    </div>

    <div class="section">
      <div class="section-title">🔐 Account Details</div>
      <div class="row"><span class="label">Account Email</span><span class="value">${organizerData.accountEmail || 'N/A'}</span></div>
      <div class="row"><span class="label">User ID</span><span class="value" style="font-size:11px;font-family:monospace;">${organizerData.userId || 'N/A'}</span></div>
    </div>

    <div class="section">
      <div class="section-title">👤 Organizer Details</div>
      <div class="row"><span class="label">Full Name</span><span class="value highlight">${organizerData.fullName || 'N/A'}</span></div>
      <div class="row"><span class="label">Contact Email</span><span class="value">${organizerData.contactEmail || 'N/A'}</span></div>
      <div class="row"><span class="label">Phone (Verified)</span><span class="value">${organizerData.phone || 'N/A'}</span></div>
      <div class="row"><span class="label">Organization</span><span class="value">${organizerData.organizationType || 'N/A'}${organizerData.organizationName ? ' — ' + organizerData.organizationName : ''}</span></div>
    </div>

    <div class="section">
      <div class="section-title">🎪 Event Details</div>
      <div class="row"><span class="label">Event Title</span><span class="value highlight">${eventData.title || 'N/A'}</span></div>
      <div class="row"><span class="label">Category</span><span class="value">${eventData.category || 'N/A'}</span></div>
      <div class="row"><span class="label">Event Type</span><span class="value">${eventData.eventType || 'N/A'}</span></div>
      <div class="row"><span class="label">Date & Time</span><span class="value">${eventData.dateTime || 'N/A'}</span></div>
      <div class="row"><span class="label">Event ID</span><span class="value" style="font-size:11px;font-family:monospace;">${eventData.eventId || 'N/A'}</span></div>
      <div class="row"><span class="label">Created At</span><span class="value">${eventData.createdAt || new Date().toISOString()}</span></div>
    </div>

    <div class="footer">
      <p>This is an automated notification from <strong>EventHub</strong></p>
      <p style="margin-top:8px;">© ${new Date().getFullYear()} EventHub. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
}

export async function sendEventPublishedEmail(eventData, organizerData) {
  if (!RESEND_API_KEY) {
    console.warn('[EmailService] No RESEND_API_KEY found. Skipping admin email. Set VITE_RESEND_API_KEY in .env to enable.');
    console.log('[EmailService] Would have sent email with data:', { eventData, organizerData });
    return { success: false, reason: 'no_api_key' };
  }

  try {
    const response = await fetch('/api/resend/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'EventHub <onboarding@resend.dev>',
        to: [ADMIN_EMAIL, organizerData.contactEmail].filter(Boolean),
        subject: 'New Event Published on EventHub',
        html: buildEmailHTML(eventData, organizerData),
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('[EmailService] Admin notification sent successfully:', result.id);
      return { success: true, emailId: result.id, timestamp: new Date().toISOString() };
    } else {
      console.error('[EmailService] Failed to send email:', result);
      return { success: false, error: result, timestamp: new Date().toISOString() };
    }
  } catch (err) {
    console.error('[EmailService] Email send error:', err);
    return { success: false, error: err.message, timestamp: new Date().toISOString() };
  }
}

export async function sendOtpEmail(email, otpCode) {
  try {
    // EmailJS Configuration — loaded from environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

    // Calculate expiry time (15 mins from now)
    const expiryTime = new Date(Date.now() + 15 * 60000);
    const timeString = expiryTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          email: email,
          otpCode: otpCode,
          time: timeString
        }
      }),
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error('[EmailService] Failed to send OTP via EmailJS:', errorText);
      return { success: false, error: errorText };
    }
  } catch (err) {
    console.error('[EmailService] OTP email error:', err);
    return { success: false, error: err.message };
  }
}
