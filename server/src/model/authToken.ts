import * as crypto from "crypto";

if (!process.env.AUTH_SECRET) {
  throw Error("AUTH_SECRET not defined");
}
const key = Buffer.from(process.env.AUTH_SECRET, "hex");
if (key.length !== 32) {
  throw Error(`AUTH_SECRET must 256 bits. Got ${key.length * 8}`);
}

const algorithm = "aes256";
const ivLength = 16;

export function makeToken<T>(obj: T) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = [
    iv.toString("hex"),
    cipher.update(JSON.stringify(obj), "utf8", "hex"),
    cipher.final("hex"),
  ];
  return encrypted.join("");
}

export function decryptToken<T>(token: string): T | undefined {
  if (token.length <= ivLength * 2) {
    return undefined;
  }
  const iv = Buffer.from(token.slice(0, ivLength * 2), "hex");
  const secretPart = Buffer.from(token.slice(ivLength * 2), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  try {
    const decrypted =
      decipher.update(secretPart, "hex", "utf8") + decipher.final("utf8");
    return JSON.parse(decrypted);
  } catch (error) {
    return undefined;
  }
}
