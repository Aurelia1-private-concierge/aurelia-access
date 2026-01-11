/**
 * Encryption utilities for sensitive data storage
 * Uses AES-GCM for authenticated encryption
 */

// Get encryption key from environment
function getEncryptionKey(): ArrayBuffer {
  const keyBase64 = Deno.env.get('TOKEN_ENCRYPTION_KEY');
  if (!keyBase64) {
    throw new Error('TOKEN_ENCRYPTION_KEY not configured');
  }
  const keyBytes = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return keyBytes.buffer as ArrayBuffer;
}

/**
 * Encrypt a string value using AES-GCM
 * Returns base64-encoded string: iv + ciphertext
 */
export async function encrypt(plaintext: string): Promise<string> {
  const keyBuffer = getEncryptionKey();
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Import key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  // Combine IV and ciphertext, encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a value encrypted with encrypt()
 * Expects base64-encoded string with IV prepended
 */
export async function decrypt(encryptedBase64: string): Promise<string> {
  const keyBuffer = getEncryptionKey();
  
  // Decode base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and ciphertext
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  // Import key for AES-GCM
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    ciphertext
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Check if a value appears to be encrypted (base64 with proper length)
 */
export function isEncrypted(value: string): boolean {
  try {
    const decoded = atob(value);
    // Encrypted values should be at least IV (12 bytes) + some ciphertext + tag (16 bytes)
    return decoded.length > 30;
  } catch {
    return false;
  }
}

/**
 * Safely encrypt - returns original if encryption fails (for migration)
 */
export async function safeEncrypt(plaintext: string): Promise<string> {
  try {
    return await encrypt(plaintext);
  } catch (error) {
    console.error('[Crypto] Encryption failed:', error);
    return plaintext;
  }
}

/**
 * Safely decrypt - returns original if decryption fails (for migration)
 */
export async function safeDecrypt(encrypted: string): Promise<string> {
  try {
    // Check if it looks encrypted first
    if (!isEncrypted(encrypted)) {
      return encrypted; // Return as-is if not encrypted (legacy data)
    }
    return await decrypt(encrypted);
  } catch (error) {
    console.error('[Crypto] Decryption failed, returning original:', error);
    return encrypted; // Return as-is if decryption fails
  }
}
