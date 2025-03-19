// src/utils/passwordManager.js

const SALT = 'chalk-app-password-salt';

export const isPasswordProtected = () => {
  return localStorage.getItem('chalk-password-hash') !== null;
};

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export const verifyPassword = async (password) => {
  if (!isPasswordProtected()) return true;
  
  const storedHash = localStorage.getItem('chalk-password-hash');
  const inputHash = await hashPassword(password);
  return storedHash === inputHash;
};

export const setPassword = async (password) => {
  if (!password) {
    localStorage.removeItem('chalk-password-hash');
    return true;
  }
  
  const hash = await hashPassword(password);
  localStorage.setItem('chalk-password-hash', hash);
  return true;
};

async function getKeyFromPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw', 
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(SALT),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encryptData = async (data, password) => {
  if (!password) return data;
  
  const key = await getKeyFromPassword(password);
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(JSON.stringify(data));
  
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedContent = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  
  return {
    iv: Array.from(iv),
    encryptedData: Array.from(new Uint8Array(encryptedContent))
  };
};

export const decryptData = async (encryptedData, password) => {
  if (!password || !encryptedData.iv || !encryptedData.encryptedData) {
    return encryptedData;
  }
  
  try {
    const key = await getKeyFromPassword(password);
    const iv = new Uint8Array(encryptedData.iv);
    const encryptedContent = new Uint8Array(encryptedData.encryptedData);
    
    const decryptedContent = await crypto.subtle.decrypt(
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