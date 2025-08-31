import {
  AES_ENCRYPTION_IV_KEY,
  AES_ENCRYPTION_KEY,
  CURRENCY_CODE,
} from "configs/AppConfig";
import CryptoJS from "crypto-js";

const SECRET_KEY = AES_ENCRYPTION_KEY; // 32-byte key
const SECRET_IV = AES_ENCRYPTION_IV_KEY; // 16-byte iv

// Helper function to get crypto config
const getCryptoConfig = () => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.enc.Utf8.parse(SECRET_IV);

  return {
    key,
    iv,
    config: {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    },
  };
};

export const setCurrencyCode = (currencyCode) => {
  const { key, config } = getCryptoConfig(); // use parsed key + iv
  const encrypted = CryptoJS.AES.encrypt(currencyCode, key, config).toString();
  localStorage.setItem(CURRENCY_CODE, encrypted);
};

export const getCurrencyWithAmount = (amount) => {
  const encrypted = localStorage.getItem(CURRENCY_CODE);
  if (!encrypted) return "";

  const { key, config } = getCryptoConfig(); // same key + iv
  const bytes = CryptoJS.AES.decrypt(encrypted, key, config);
  const currencyCode = bytes.toString(CryptoJS.enc.Utf8);

  if (!currencyCode) return "";
  return `${currencyCode} ${Number(amount).toFixed(2)}`;
};
export const getCurrencyWithOutAmount = () => {
  const encrypted = localStorage.getItem(CURRENCY_CODE);
  if (!encrypted) return "";

  const { key, config } = getCryptoConfig(); // same key + iv
  const bytes = CryptoJS.AES.decrypt(encrypted, key, config);
  const currencyCode = bytes.toString(CryptoJS.enc.Utf8);

  if (!currencyCode) return "";
  return `${currencyCode} `;
};
