import { and, desc, eq } from "drizzle-orm"
import { requireDatabase } from "@/lib/db"
import { userIntegrations } from "@/lib/db/schema"
import {
  getIntegrationDefinition,
  integrationDefinitions,
  type IntegrationProvider,
} from "@/lib/integrations/catalog"
import { decryptJson, encryptJson, maskSecretValue } from "@/lib/security/encryption"

const database = requireDatabase()

type SecretPayload = Record<string, string>

export type UserIntegrationSummary = {
  provider: IntegrationProvider
  title: string
  eyebrow: string
  description: string
  configured: boolean
  maskedSummary: Record<string, string>
  connectionState: string
  updatedAt: Date | null
  lastValidatedAt: Date | null
  lastError: string | null
}

function maskProviderPayload(provider: IntegrationProvider, payload: SecretPayload) {
  const definition = getIntegrationDefinition(provider)

  return definition.fields.reduce<Record<string, string>>((summary, field) => {
    const value = payload[field.name]

    if (value) {
      summary[field.label] = maskSecretValue(value)
    }

    return summary
  }, {})
}

export async function listUserIntegrations(ownerUserId: string): Promise<UserIntegrationSummary[]> {
  const rows = await database.query.userIntegrations.findMany({
    where: eq(userIntegrations.ownerUserId, ownerUserId),
    orderBy: desc(userIntegrations.updatedAt),
  })

  const byProvider = new Map(rows.map((row) => [row.provider as IntegrationProvider, row]))

  return integrationDefinitions.map((definition) => {
    const row = byProvider.get(definition.provider)

    return {
      provider: definition.provider,
      title: definition.title,
      eyebrow: definition.eyebrow,
      description: definition.description,
      configured: Boolean(row),
      maskedSummary: row?.maskedSummary ?? {},
      connectionState: row?.connectionState ?? "missing",
      updatedAt: row?.updatedAt ?? null,
      lastValidatedAt: row?.lastValidatedAt ?? null,
      lastError: row?.lastError ?? null,
    }
  })
}

export async function saveUserIntegration(input: {
  ownerUserId: string
  provider: IntegrationProvider
  payload: SecretPayload
}) {
  const encrypted = encryptJson(input.payload)
  const maskedSummary = maskProviderPayload(input.provider, input.payload)
  const now = new Date()

  await database
    .insert(userIntegrations)
    .values({
      ownerUserId: input.ownerUserId,
      provider: input.provider,
      encryptedConfig: encrypted.ciphertext,
      encryptionIv: encrypted.iv,
      encryptionAuthTag: encrypted.authTag,
      maskedSummary,
      connectionState: "saved",
      lastValidatedAt: null,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [userIntegrations.ownerUserId, userIntegrations.provider],
      set: {
        encryptedConfig: encrypted.ciphertext,
        encryptionIv: encrypted.iv,
        encryptionAuthTag: encrypted.authTag,
        maskedSummary,
        connectionState: "saved",
        lastValidatedAt: null,
        lastError: null,
        updatedAt: now,
      },
    })
}

export async function removeUserIntegration(ownerUserId: string, provider: IntegrationProvider) {
  await database
    .delete(userIntegrations)
    .where(
      and(
        eq(userIntegrations.ownerUserId, ownerUserId),
        eq(userIntegrations.provider, provider)
      )
    )
}

export async function getDecryptedUserIntegration<T extends SecretPayload>(
  ownerUserId: string,
  provider: IntegrationProvider
) {
  const row = await database.query.userIntegrations.findFirst({
    where: and(
      eq(userIntegrations.ownerUserId, ownerUserId),
      eq(userIntegrations.provider, provider)
    ),
  })

  if (!row) {
    return null
  }

  return {
    provider,
    payload: decryptJson<T>({
      ciphertext: row.encryptedConfig,
      iv: row.encryptionIv,
      authTag: row.encryptionAuthTag,
    }),
    updatedAt: row.updatedAt,
    lastValidatedAt: row.lastValidatedAt,
  }
}
