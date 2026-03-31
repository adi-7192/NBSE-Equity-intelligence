export type IntegrationProvider = "zerodha" | "openai" | "gemini" | "anthropic"

export type IntegrationField = {
  name: string
  label: string
  placeholder: string
  type?: "text" | "password"
  helper?: string
}

export type IntegrationDefinition = {
  provider: IntegrationProvider
  title: string
  eyebrow: string
  description: string
  fields: IntegrationField[]
}

export const integrationDefinitions: IntegrationDefinition[] = [
  {
    provider: "zerodha",
    title: "Zerodha",
    eyebrow: "Broker connection",
    description:
      "Store the durable credentials the app needs to support your personalized Zerodha-connected workflows.",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "Enter your Zerodha API key",
        type: "password",
      },
      {
        name: "apiSecret",
        label: "API Secret",
        placeholder: "Enter your Zerodha API secret",
        type: "password",
      },
    ],
  },
  {
    provider: "openai",
    title: "OpenAI",
    eyebrow: "AI provider",
    description: "Use your OpenAI key for personal intelligence and future AI workflows.",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "sk-...",
        type: "password",
      },
    ],
  },
  {
    provider: "gemini",
    title: "Gemini",
    eyebrow: "AI provider",
    description: "Store your Gemini key so the workspace can use your personal Google AI access.",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "AIza...",
        type: "password",
      },
    ],
  },
  {
    provider: "anthropic",
    title: "Anthropic",
    eyebrow: "AI provider",
    description: "Save your Anthropic key for personal Claude-powered workflows.",
    fields: [
      {
        name: "apiKey",
        label: "API Key",
        placeholder: "sk-ant-...",
        type: "password",
      },
    ],
  },
]

export function getIntegrationDefinition(provider: IntegrationProvider) {
  const definition = integrationDefinitions.find((item) => item.provider === provider)

  if (!definition) {
    throw new Error(`Unknown integration provider: ${provider}`)
  }

  return definition
}
