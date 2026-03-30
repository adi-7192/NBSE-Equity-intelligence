import { listArchives, getArchive } from "@/lib/archive"
import { getSessionFromHeaders } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getSessionFromHeaders(request.headers)
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const filename = searchParams.get("filename")

    if (filename) {
      const archive = await getArchive(filename, session.user.id)
      if (!archive) {
        return Response.json({ error: "Archive not found" }, { status: 404 })
      }
      return Response.json(archive)
    }

    const archives = await listArchives(session.user.id)
    return Response.json({ archives })
  } catch (error) {
    console.error("[archives] Error:", error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to load archives",
      },
      { status: 500 }
    )
  }
}
