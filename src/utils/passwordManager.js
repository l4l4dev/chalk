// src/utils/passwordManager.js - Improved version

const ENCRYPTION_CONFIG = {
  iterations: 100000,  
  hashLength: 32,     
  digest: 'SHA-256'
};

const getDeviceSalt = () => {
  let deviceSalt = localStorage.getItem('chalk-device-salt');
  if (!deviceSalt) {
    const randomBytes = new Uint8Array(16);
    window.crypto.getRandomValues(randomBytes);
    deviceSalt = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem('chalk-device-salt', deviceSalt);
  }
  return deviceSalt;
};

export const isPasswordProtected = () => {
  return localStorage.getItem('chalk-password-hash') !== null;
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const salt = getDeviceSalt();
  const passwordData = encoder.encode(password + salt);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const hashBuffer = await window.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: ENCRYPTION_CONFIG.digest
    },
    keyMaterial,
    ENCRYPTION_CONFIG.hashLength * 8
  );
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const verifyPassword = async (password) => {
  if (!isPasswordProtected()) return true;
  
  try {
    const storedHash = localStorage.getItem('chalk-password-hash');
    const inputHash = await hashPassword(password);
    return storedHash === inputHash;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

export const setPassword = async (password) => {
  try {
    if (!password) {
      localStorage.removeItem('chalk-password-hash');
      return true;
    }
    
    const hash = await hashPassword(password);
    localStorage.setItem('chalk-password-hash', hash);
    return true;
  } catch (error) {
    console.error('Error setting password:', error);
    return false;
  }
};

async function getEncryptionKey(password) {
  const encoder = new TextEncoder();
  const salt = getDeviceSalt();
  const passwordData = encoder.encode(password + salt);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw', 
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: ENCRYPTION_CONFIG.iterations,
      hash: ENCRYPTION_CONFIG.digest
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encryptData = async (data, password) => {
  if (!password) return data;
  
  try {
    const key = await getEncryptionKey(password);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(iv);
    
    const encryptedContent = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    return {
      iv: Array.from(iv),
      encryptedData: Array.from(new Uint8Array(encryptedContent))
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

export const decryptData = async (encryptedData, password) => {
  if (!password || !encryptedData?.iv || !encryptedData?.encryptedData) {
    return encryptedData;
  }
  
  try {
    const key = await getEncryptionKey(password);
    const iv = new Uint8Array(encryptedData.iv);
    const encryptedContent = new Uint8Array(encryptedData.encryptedData);
    
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedContent
    );
    
    const decoder = new TextDecoder();
    const decodedData = decoder.decode(decryptedContent);
    return JSON.parse(decodedData);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Invalid password or corrupted data');
  }
};

export const lockApp = () => {
  sessionStorage.removeItem('chalk-app-unlocked');
};

export const unlockApp = () => {
  sessionStorage.setItem('chalk-app-unlocked', 'true');
};

export const isAppUnlocked = () => {
  return sessionStorage.getItem('chalk-app-unlocked') === 'true' || !isPasswordProtected();
};