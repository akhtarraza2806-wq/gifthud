/**
 * Giftlove Atelier - Time-based One-Time Password (TOTP) RFC 6238 Engine
 * Secure client-side implementation of HMAC-SHA1 TOTP generation & verification
 * Supports standard Authenticator apps (Google Authenticator, Microsoft Authenticator, 1Password, Authy)
 */

// Base32 Alphabet (RFC 4648)
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Generates a random Base32 TOTP secret key
 */
export function generateTotpSecret(length = 16): string {
  let secret = '';
  const cryptoObj = window.crypto || (window as any).msCrypto;
  const randomBytes = new Uint8Array(length);
  
  if (cryptoObj && cryptoObj.getRandomValues) {
    cryptoObj.getRandomValues(randomBytes);
    for (let i = 0; i < length; i++) {
      secret += BASE32_CHARS[randomBytes[i] % BASE32_CHARS.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      secret += BASE32_CHARS[Math.floor(Math.random() * BASE32_CHARS.length)];
    }
  }
  return secret;
}

/**
 * Decodes a Base32 string into Uint8Array
 */
function base32ToUint8Array(base32: string): Uint8Array {
  const cleanBase32 = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = '';
  
  for (let i = 0; i < cleanBase32.length; i++) {
    const val = BASE32_CHARS.indexOf(cleanBase32.charAt(i));
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
}

/**
 * Generates otpauth:// URL for scanning into Google Authenticator or any TOTP app
 */
export function generateOtpAuthUrl(
  secret: string,
  accountName: string = 'admin@giftlove.luxury',
  issuer: string = 'Giftlove Atelier'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Compute HMAC-SHA1 using Web Cryptography API
 */
async function hmacSha1(keyBytes: Uint8Array, messageBytes: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  );
  
  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, messageBytes.buffer as ArrayBuffer);
  return new Uint8Array(signature);
}

/**
 * Generates 6-digit TOTP code for a specific time step (default 30s)
 */
export async function generateTotpCode(
  secret: string,
  timeWindowOffset: number = 0,
  timeStepSeconds: number = 30,
  epochMs: number = Date.now()
): Promise<string> {
  try {
    const counter = Math.floor(epochMs / 1000 / timeStepSeconds) + timeWindowOffset;
    const counterBytes = new Uint8Array(8);
    let tempCounter = counter;
    for (let i = 7; i >= 0; i--) {
      counterBytes[i] = tempCounter & 0xff;
      tempCounter = Math.floor(tempCounter / 256);
    }

    const keyBytes = base32ToUint8Array(secret);
    if (keyBytes.length === 0) return '000000';

    const hmacResult = await hmacSha1(keyBytes, counterBytes);
    
    // Dynamic Truncation (RFC 4226)
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const binary =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString().padStart(6, '0');
    return otp;
  } catch (err) {
    console.error('Error generating TOTP token:', err);
    return '000000';
  }
}

/**
 * Verifies user-entered 6-digit TOTP code with time drift window tolerance (±1 step = ±30s)
 */
export async function verifyTotpCode(
  userCode: string,
  secret: string,
  toleranceSteps: number = 1
): Promise<{ valid: boolean; reason?: string }> {
  const cleanCode = userCode.trim().replace(/\D/g, '');
  if (cleanCode.length !== 6) {
    return { valid: false, reason: 'Please enter a 6-digit numeric authentication code.' };
  }

  // Check tolerance window (previous, current, next step)
  for (let offset = -toleranceSteps; offset <= toleranceSteps; offset++) {
    const expected = await generateTotpCode(secret, offset);
    if (expected === cleanCode) {
      return { valid: true };
    }
  }

  return { valid: false, reason: 'Invalid or expired 2FA security code. Please try again.' };
}

/**
 * Calculates remaining seconds in the current 30s TOTP cycle
 */
export function getTotpRemainingSeconds(timeStepSeconds: number = 30): number {
  const currentSeconds = Math.floor(Date.now() / 1000) % timeStepSeconds;
  return timeStepSeconds - currentSeconds;
}

/**
 * Generates formatted emergency backup recovery codes
 */
export function generateBackupCodes(count = 6): string[] {
  const chars = '0123456789ABCDEF';
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    let part1 = '';
    let part2 = '';
    for (let j = 0; j < 4; j++) {
      part1 += chars[Math.floor(Math.random() * chars.length)];
      part2 += chars[Math.floor(Math.random() * chars.length)];
    }
    codes.push(`${part1}-${part2}`);
  }
  return codes;
}

/* ======================================================================
   LOCAL STORAGE PERSISTENCE HELPERS FOR 2FA CONFIGURATION
   ====================================================================== */

export interface Admin2FaConfig {
  isEnabled: boolean;
  secret: string;
  enrolledAt: string | null;
  backupCodes: string[];
  usedBackupCodes: string[];
  requireForSensitiveActions: boolean;
}

const STORAGE_KEY_2FA = 'giftlove_admin_2fa_config';
const STORAGE_KEY_SESSION = 'giftlove_admin_2fa_session';

export const DEFAULT_ADMIN_SECRET = 'JBSWY3DPEHPK3PXP'; // Standard testing secret base32

export function loadAdmin2FaConfig(): Admin2FaConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_2FA);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load 2FA config from storage', e);
  }

  // Default initial configuration
  return {
    isEnabled: true,
    secret: DEFAULT_ADMIN_SECRET,
    enrolledAt: '2026-01-01T00:00:00.000Z',
    backupCodes: ['8F92-4A1C', 'E29B-77CD', '51AA-990F', '44D8-19B3', '7CE3-882A', '9A01-3F72'],
    usedBackupCodes: [],
    requireForSensitiveActions: true,
  };
}

export function saveAdmin2FaConfig(config: Admin2FaConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_2FA, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save 2FA config', e);
  }
}

export interface AdminAuthSession {
  isAuthenticated: boolean;
  is2FaVerified: boolean;
  adminEmail: string;
  adminName: string;
  verifiedAt: number | null;
  expiresAt: number | null;
}

export function loadAdminAuthSession(): AdminAuthSession | null {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (saved) {
      const session: AdminAuthSession = JSON.parse(saved);
      if (session.expiresAt && Date.now() < session.expiresAt && session.is2FaVerified) {
        return session;
      }
    }
  } catch (e) {
    console.warn('Failed to read session', e);
  }
  return null;
}

export function saveAdminAuthSession(session: AdminAuthSession | null): void {
  try {
    if (!session) {
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
    } else {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    }
  } catch (e) {
    console.error('Failed to write session', e);
  }
}
