import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto"

const ENCRYPTION_ALGORITHM = "aes-256-gcm"
const APP_ENCRYPTION_KEY = process.env.APP_ENCRYPTION_KEY ?? process.env.BETTER_AUTH_SECRET

function getEncryptionKey() {
  if (!APP_ENCRYPTION_KEY) {
    throw new Error("APP_ENCRYPTION_KEY is not configured.")
  }

  return createHash("sha256").update(APP_ENCRYPTION_KEY).digest()
}

export function encryptJson(value: unknown) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv)
  const plaintext = JSON.stringify(value)
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    algorithm: ENCRYPTION_ALGORITHM,
  }
}

export function decryptJson<T>(payload: {
  ciphertext: string
  iv: string
  authTag: string
}): T {
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    getEncryptionKey(),
    Buffer.from(payload.iv, "base64")
  )

  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ])

  return JSON.parse(decrypted.toString("utf8")) as T
}

export function maskSecretValue(value: string) {
  if (value.length <= 8) {
    return "•".repeat(Math.max(6, value.length))
  }

  return `${value.slice(0, 4)}••••${value.slice(-4)}`
}
