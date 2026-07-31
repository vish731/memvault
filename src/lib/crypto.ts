import crypto from "node:crypto";

export interface EncryptedPayload {
  iv: string;
  authTag: string;
  ciphertext: string;
}

const ALGO = "aes-256-gcm";

export function generateMemoryKey(): string {
  return crypto.randomBytes(32).toString("base64");
}

export function encryptMemory(plaintext: string, base64Key: string): EncryptedPayload {
  const key = Buffer.from(base64Key, "base64");
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
}

export function decryptMemory(payload: EncryptedPayload, base64Key: string): string {
  const key = Buffer.from(base64Key, "base64");
  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}
