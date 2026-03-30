import { getSessionFromHeaders } from "@/lib/auth"
import { listSharedWatchlistItems } from "@/lib/db/queries/shared-watchlist"
import { buildDisconnectedMarketSnapshot } from "@/lib/live-market/instruments"
import { fetchRelaySnapshot, isRelayConfigured, syncRelaySubscriptions } from "@/lib/live-market/relay-client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return "Live relay unavailable"
}

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers)
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const watchlist = await listSharedWatchlistItems()

  if (!isRelayConfigured()) {
    return Response.json(buildDisconnectedMarketSnapshot({
      watchlist,
      reason: "Live relay is not configured.",
    }), {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    })
  }

  try {
    await syncRelaySubscriptions(watchlist)
    const snapshot = await fetchRelaySnapshot()

    return Response.json(snapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return Response.json(buildDisconnectedMarketSnapshot({
      watchlist,
      reason: getErrorMessage(error),
    }), {
      status: 503,
      headers: {
        "Cache-Control": "no-store",
      },
    })
  }
}
