// utils/aesDecrypt.js - Enhanced with parameter encryption

/**
 * Encrypts data using AES-CBC encryption
 * @param {Object|String} data - Data to encrypt
 * @param {String} keyStr - 32-byte encryption key
 * @returns {String} Base64 encoded encrypted data (IV + encrypted data)
 */
export async function encryptAES(data, keyStr) {
  try {
    const keyBytes = new TextEncoder().encode(keyStr);
    
    // Generate random IV
    const iv = crypto.getRandomValues(new Uint8Array(16));
    
    // Convert data to string if it's an object
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(dataString);
    
    // Import crypto key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    
    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "AES-CBC",
        iv,
      },
      cryptoKey,
      dataBytes
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);
    
    // Convert to base64
    const binaryString = Array.from(combined, byte => String.fromCharCode(byte)).join('');
    return btoa(binaryString);
  } catch (error) {
    console.error('[ENCRYPTION ERROR]', error);
    throw new Error('Failed to encrypt data: ' + error.message);
  }
}

/**
 * Decrypts AES-CBC encrypted data
 * @param {String} encryptedBase64 - Base64 encoded encrypted data (IV + encrypted data)
 * @param {String} keyStr - 32-byte encryption key
 * @returns {Object|String} Decrypted data (parsed as JSON if possible, otherwise string)
 */
export async function decryptAES(encryptedBase64, keyStr) {
  try {
    const keyBytes = new TextEncoder().encode(keyStr);

    // Decode base64
    const binary = atob(encryptedBase64);
    const binaryBytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    // Extract IV and encrypted data
    const iv = binaryBytes.slice(0, 16);
    const encryptedData = binaryBytes.slice(16);

    // Import crypto key
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv,
      },
      cryptoKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    const decryptedString = decoder.decode(decryptedBuffer);
    
    // Try to parse as JSON, if it fails return as string
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    console.error('[DECRYPTION ERROR]', error);
    throw new Error('Failed to decrypt data: ' + error.message);
  }
}

/**
 * Encrypts URL parameters
 * @param {Object} params - Parameters object to encrypt
 * @param {String} keyStr - 32-byte encryption key
 * @returns {Object} Object with encrypted params as single parameter
 */
export async function encryptParams(params, keyStr) {
  try {
    if (!params || Object.keys(params).length === 0) {
      return {};
    }

    console.log('[PARAMS ENCRYPTION] Original params:', params);
    
    // Filter out null/undefined values
    const filteredParams = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        filteredParams[key] = params[key];
      }
    });

    if (Object.keys(filteredParams).length === 0) {
      return {};
    }

    const encryptedParams = await encryptAES(filteredParams, keyStr);
    console.log('[PARAMS ENCRYPTION] Encrypted successfully');
    
    return { enc_params: encryptedParams };
  } catch (error) {
    console.error('[PARAMS ENCRYPTION ERROR]', error);
    // Return original params if encryption fails
    return params;
  }
}

/**
 * Decrypts URL parameters
 * @param {String} encryptedParams - Encrypted parameters string
 * @param {String} keyStr - 32-byte encryption key
 * @returns {Object} Decrypted parameters object
 */
export async function decryptParams(encryptedParams, keyStr) {
  try {
    console.log('[PARAMS DECRYPTION] Decrypting params...');
    const decrypted = await decryptAES(encryptedParams, keyStr);
    console.log('[PARAMS DECRYPTION] Decrypted params:', decrypted);
    return decrypted;
  } catch (error) {
    console.error('[PARAMS DECRYPTION ERROR]', error);
    throw new Error('Failed to decrypt parameters: ' + error.message);
  }
}

/**
 * Validates if a string is a valid 32-byte AES key
 * @param {String} keyStr - Key string to validate
 * @returns {Boolean} True if valid, false otherwise
 */
export function validateAESKey(keyStr) {
  return typeof keyStr === 'string' && keyStr.length === 32;
}

/**
 * Checks if data appears to be encrypted (has encrypted field)
 * @param {Object} data - Data to check
 * @returns {Boolean} True if data appears encrypted
 */
export function isEncryptedData(data) {
  return data && typeof data === 'object' && 'encrypted' in data;
}

/**
 * Checks if params are encrypted
 * @param {Object} params - Parameters to check
 * @returns {Boolean} True if params appear encrypted
 */
export function isEncryptedParams(params) {
  return params && typeof params === 'object' && 'encrypted_params' in params;
}