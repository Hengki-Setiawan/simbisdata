/**
 * Password Hashing Utility using Web Crypto API
 * No external dependencies needed — works in Edge runtime
 */

const ITERATIONS = 100000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
    );

    return crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: new Uint8Array(salt).buffer,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        KEY_LENGTH * 8
    );
}

function toHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function fromHex(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

/**
 * Hash a password with a random salt
 * Returns format: "salt:hash" (both hex-encoded)
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const derivedKey = await deriveKey(password, salt);
    return `${toHex(salt.buffer as ArrayBuffer)}:${toHex(derivedKey)}`;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) return false;

    const salt = fromHex(saltHex);
    const derivedKey = await deriveKey(password, salt);
    const derivedHex = toHex(derivedKey);

    // Timing-safe comparison
    if (derivedHex.length !== hashHex.length) return false;
    let result = 0;
    for (let i = 0; i < derivedHex.length; i++) {
        result |= derivedHex.charCodeAt(i) ^ hashHex.charCodeAt(i);
    }
    return result === 0;
}
