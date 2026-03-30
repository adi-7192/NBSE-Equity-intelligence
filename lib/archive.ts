import {
  archiveSnapshot,
  getArchiveSnapshot,
  listArchiveSnapshots,
  loadDashboardState,
  saveDashboardState,
} from "@/lib/db/queries/archive"

export async function getLiveData(ownerUserId?: string): Promise<unknown | null> {
  return loadDashboardState(ownerUserId)
}

export async function saveLiveData(data: unknown, ownerUserId?: string): Promise<void> {
  await saveDashboardState(data, ownerUserId ? { ownerUserId } : undefined)
}

export async function archiveCurrentData(
  data: unknown,
  ownerUserId?: string
): Promise<{ filename: string; dateStr: string }> {
  return archiveSnapshot(data, ownerUserId ? { ownerUserId } : undefined)
}

export async function listArchives(ownerUserId?: string): Promise<{ filename: string; date: string }[]> {
  return listArchiveSnapshots(ownerUserId)
}

export async function getArchive(
  filename: string,
  ownerUserId?: string
): Promise<{ data: unknown; date: string } | null> {
  return getArchiveSnapshot(filename, ownerUserId)
}
