import crypto from 'node:crypto';
import config from '../../config.js';
import CryptoJS from 'crypto-js'

const key = CryptoJS.enc.Hex.parse(config.crypto.encryption_key);
const iv = CryptoJS.enc.Hex.parse(config.crypto.iv);

function encrypt_message(message) {
    const encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

function decrypt_message(cipherText) {
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
}

const hash_it = (plaintext) => {
    const hash = crypto
        .createHash('sha512')
        .update(plaintext)
        .digest('hex');
    return hash;
};

const compare_hash = (plaintext, hash) => {
    return hash_it(plaintext) === hash;
};

export {
    encrypt_message, decrypt_message, hash_it, compare_hash
};

