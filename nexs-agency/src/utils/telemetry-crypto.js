/**
 * CLIENT-SIDE Encryption (using Web Crypto API)
 * Works in all modern browsers.
 */
export async function encryptPayload(payload, secretHex) {
    if (typeof window === "undefined") return ""; // Should only be called on client

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));

    // Convert hex secret to CryptoKey
    const keyBuffer = Uint8Array.from(secretHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const key = await window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        "AES-GCM",
        false,
        ["encrypt"]
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        data
    );

    // Web Crypto GCM returns ciphertext + tag combined
    const combined = new Uint8Array(encrypted);
    const tagSize = 16;
    const ciphertext = combined.slice(0, combined.length - tagSize);
    const tag = combined.slice(combined.length - tagSize);

    // Helper to convert Uint8Array to base64
    const b64 = (buf) => window.btoa(String.fromCharCode(...buf));

    // Return base64 formatted string iv:tag:ciphertext
    return `${b64(iv)}:${b64(tag)}:${b64(ciphertext)}`;
}
