import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Hex.parse(process.env.REACT_APP_ENC_KEY);
const iv = CryptoJS.enc.Hex.parse(process.env.REACT_APP_ENC_IV);

function encrypt_message(message) {
    const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

function decrypt_message(cipherText) {
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

export {
    encrypt_message, decrypt_message
};
