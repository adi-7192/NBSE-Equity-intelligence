import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { sql, eq } from "drizzle-orm"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware, isAPIError } from "better-auth/api"
import { betterAuth } from "better-auth"
import { toNextJsHandler, nextCookies } from "better-auth/next-js"
import { admin } from "better-auth/plugins"
import { requireDatabase } from "@/lib/db"
import { accounts, sessions, users, verifications } from "@/lib/db/schema"

const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET
const BOOTSTRAP_ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL
const BOOTSTRAP_ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD

const database = requireDatabase()

async function getUserCount() {
  const [result] = await database.select({
    count: sql<number>`count(*)::int`,
  })
  .from(users)

  return Number(result?.count ?? 0)
}

export function hasAdminRole(role?: string | null) {
  if (!role) {
    return false
  }

  return role
    .split(",")
    .map((value) => value.trim())
    .includes("admin")
}

export const auth = betterAuth({
  appName: "Equity Intelligence",
  baseURL: BETTER_AUTH_URL,
  secret: BETTER_AUTH_SECRET,
  database: drizzleAdapter(database, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    admin(),
    nextCookies(),
  ],
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return
      }

      const totalUsers = await getUserCount()
      const email = typeof ctx.body?.email === "string" ? ctx.body.email : null
      const password = typeof ctx.body?.password === "string" ? ctx.body.password : null
      const name = typeof ctx.body?.name === "string" && ctx.body.name.trim().length > 0
        ? ctx.body.name
        : "Workspace Admin"

      if (totalUsers > 0) {
        throw new APIError("FORBIDDEN", {
          message: "Account creation is admin-managed. Ask the admin to create your account.",
        })
      }

      if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
        throw new APIError("FORBIDDEN", {
          message: "Bootstrap admin credentials are not configured.",
        })
      }

      if (email !== BOOTSTRAP_ADMIN_EMAIL || password !== BOOTSTRAP_ADMIN_PASSWORD) {
        throw new APIError("FORBIDDEN", {
          message: "Use the configured bootstrap admin credentials for first-time setup.",
        })
      }

      return {
        context: {
          ...ctx,
          body: {
            ...ctx.body,
            name,
          },
        },
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return
      }

      const newSession = ctx.context.newSession
      if (!newSession || newSession.user.email !== BOOTSTRAP_ADMIN_EMAIL) {
        return
      }

      await database
        .update(users)
        .set({
          role: "admin",
          updatedAt: new Date(),
        })
        .where(eq(users.id, newSession.user.id))
    }),
  },
})

export const { GET, POST } = toNextJsHandler(auth)

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function getSessionFromHeaders(requestHeaders: Headers) {
  return auth.api.getSession({
    headers: requestHeaders,
  })
}

export async function getRequiredSession() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

export async function getBootstrapStatus() {
  return {
    canBootstrapAdmin: (await getUserCount()) === 0,
    bootstrapEmail: BOOTSTRAP_ADMIN_EMAIL ?? null,
  }
}

export function getAuthErrorMessage(error: unknown) {
  if (isAPIError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Something went wrong."
}
