"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Archive, Calendar, FileJson } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ArchiveItem {
  filename: string
  date: string
}

export default function ArchivesPage() {
  const [archives, setArchives] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/archives")
      .then((res) => res.json())
      .then((data) => {
        setArchives(data.archives || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            <h1 className="font-mono text-lg font-bold">Data Archives</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-primary" />
              Historical Market Data
            </CardTitle>
            <CardDescription>
              Previous market intelligence snapshots archived by date. Each archive
              contains the full dashboard data at the time of the update.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}

            {error && (
              <p className="py-6 text-center font-mono text-sm text-bearish">{error}</p>
            )}

            {!loading && !error && archives.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Archive className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No archives yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Archives are created each time you click &ldquo;Update Data&rdquo; on the dashboard.
                </p>
              </div>
            )}

            {!loading && archives.length > 0 && (
              <div className="divide-y divide-border">
                {archives.map((archive) => (
                  <div
                    key={archive.filename}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-mono text-sm font-semibold text-foreground">
                          {archive.date}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground break-all">
                          {archive.filename}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
