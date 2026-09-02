import crypto from 'crypto';

// Encryption Secret Key (32 bytes / 256 bits) from environment or deterministic fallback for local dev
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'a6f9c2d1e4b8a3f7c1d9e2b4f6a8c0d2e4f6a8c0d2e4f6a8c0d2e4f6a8c0d2e4';

// Algorithm & IV length
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Encrypts sensitive plain text string at rest using AES-256-CBC.
 */
export function encryptText(text: string | null | undefined): string | null {
  if (!text || text.trim() === '') return null;

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = crypto.scryptSync(ENCRYPTION_SECRET, 'salt-acme-engine', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return IV + Encrypted Data string format
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err: any) {
    console.error('[Crypto] Encryption error:', err.message);
    throw new Error('Failed to encrypt secret credential');
  }
}

/**
 * Decrypts AES-256-CBC encrypted cipher text back to plain text.
 */
export function decryptText(encryptedText: string | null | undefined): string | null {
  if (!encryptedText || encryptedText.trim() === '') return null;

  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return encryptedText; // Fallback if plain text was previously stored

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const key = crypto.scryptSync(ENCRYPTION_SECRET, 'salt-acme-engine', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err: any) {
    console.error('[Crypto] Decryption error:', err.message);
    return null;
  }
}

/**
 * Utility to mask sensitive tokens for UI display (e.g., "https://hooks.slack.com/.../XXXX" or "••••••••sk_1234")
 */
export function maskSecret(secret: string | null | undefined): string {
  if (!secret) return '';
  if (secret.length <= 8) return '••••••••';
  return `••••••••${secret.substring(secret.length - 6)}`;
}
