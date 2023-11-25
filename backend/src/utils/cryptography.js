import crypto from 'node:crypto';
import config from '../../config.js';

function hexStringToUint8Array(hexString) {
    const arrayBuffer = new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16))).buffer;
    return new Uint8Array(arrayBuffer);
}

function arrayBufferToHexString(arrayBuffer) {
    const uint8Array = new Uint8Array(arrayBuffer);
    return Array.from(uint8Array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const iv = hexStringToUint8Array(config.crypto.iv); //typed array / buffer.

const importKey = async (hexKey) => {
    const keyData = hexStringToUint8Array(hexKey);

    return await crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: 'AES-CBC',
            length: 256,
        },
        false,
        ['encrypt', 'decrypt']
    );
};

const key = await importKey(config.crypto.encryption_key);

const encrypt_message = async (message) => {
    const ec = new TextEncoder();

    const ciphertext = await crypto.subtle.encrypt({
        name: 'AES-CBC',
        iv,
    }, key, ec.encode(message));

    return arrayBufferToHexString(ciphertext);
};

const decrypt_message = async (cipher) => {
    if(typeof(cipher) === 'string'){
        cipher = hexStringToUint8Array(cipher).buffer;
    };
    const dec = new TextDecoder();
    const plaintext = await crypto.subtle.decrypt({
        name: 'AES-CBC',
        iv,
    }, key, cipher);

    return dec.decode(plaintext);
}

export  {
    encrypt_message, decrypt_message
};

