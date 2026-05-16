// =============================================
// EMAIL DOMAIN VALIDATION — ALLOWLIST ONLY
// Only pre-approved trusted domains are accepted.
// Everything else is blocked by default.
// =============================================

const ALLOWED_DOMAINS = new Set([
  // Google
  'gmail.com', 'googlemail.com',

  // Yahoo
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk', 'yahoo.ca',
  'yahoo.com.au', 'yahoo.fr', 'yahoo.de', 'yahoo.es', 'yahoo.it',
  'yahoo.co.jp', 'yahoo.gr', 'yahoo.com.ar', 'yahoo.com.br',
  'yahoo.com.mx', 'yahoo.com.sg', 'yahoo.com.ph', 'yahoo.com.hk',

  // Microsoft / Outlook / Hotmail / Live
  'outlook.com', 'outlook.in', 'outlook.co.in', 'outlook.de',
  'outlook.fr', 'outlook.es', 'outlook.it', 'outlook.jp',
  'hotmail.com', 'hotmail.in', 'hotmail.co.uk', 'hotmail.fr',
  'hotmail.de', 'hotmail.es', 'hotmail.it',
  'live.com', 'live.in', 'live.co.uk', 'live.fr', 'live.de',
  'msn.com',

  // ProtonMail
  'protonmail.com', 'proton.me', 'pm.me',

  // Apple iCloud
  'icloud.com', 'me.com', 'mac.com',

  // AOL
  'aol.com', 'aol.in', 'aol.co.uk', 'aol.de', 'aol.fr',

  // Zoho (professional)
  'zoho.com', 'zohomail.com',

  // India-specific
  'rediffmail.com',

  // Privacy/secure
  'tutanota.com', 'tutamail.com', 'tuta.io',
  'fastmail.com', 'fastmail.fm',
  'hushmail.com',
  'runbox.com',
  'mailfence.com',
  'startmail.com',
  'posteo.de', 'posteo.net',
]);

const ALLOWED_EDU_TLDS = [
  '.edu',       // US universities
  '.ac.in',     // Indian universities
  '.edu.in',
  '.ac.uk',     // UK universities
  '.ac.nz',     // New Zealand
  '.ac.za',     // South Africa
  '.edu.au',    // Australia
  '.edu.sg',    // Singapore
  '.edu.pk',    // Pakistan
  '.edu.bd',    // Bangladesh
  '.edu.np',    // Nepal
  '.gov',       // US government
  '.gov.in',    // Indian government
  '.nic.in',    // National Informatics Centre India
  '.gov.uk',    // UK government
];

const BLOCKED_ERROR = 'Temporary or disposable email addresses are not allowed. Please use a trusted email (Gmail, Yahoo, Outlook, iCloud, ProtonMail) or your official university/organization email.';

/**
 * Validate an organizer contact email using ALLOWLIST-only approach.
 * Returns { valid: boolean, reason: string, trust: 'high' | 'standard' | 'blocked' }
 */
export function validateOrganizerEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, reason: 'Email is required.', trust: 'blocked' };
  }

  const emailLower = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(emailLower)) {
    return { valid: false, reason: 'Please enter a valid email address.', trust: 'blocked' };
  }

  const domain = emailLower.split('@')[1];

  // 1. Check trusted personal/professional domains
  if (ALLOWED_DOMAINS.has(domain)) {
    return { valid: true, reason: '', trust: 'high' };
  }

  // 2. Check educational / government TLDs
  const isEduOrGov = ALLOWED_EDU_TLDS.some(tld => domain.endsWith(tld));
  if (isEduOrGov) {
    return { valid: true, reason: '', trust: 'high' };
  }

  // 3. Everything else is blocked
  return {
    valid: false,
    reason: BLOCKED_ERROR,
    trust: 'blocked',
  };
}
