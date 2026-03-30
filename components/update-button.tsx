"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { RefreshCw, CheckCircle, AlertCircle, Archive, Loader2 } from "lucide-react"

type UpdateStatus = "idle" | "updating" | "success" | "error"

interface UpdateResult {
  success: boolean
  message?: string
  error?: string
  archived?: string
  updatedAt?: string
  summary?: {
    nifty50: number
    alertsCount: number
    date: string
  }
}

export function UpdateButton({
  label = "Update Data",
}: {
  label?: string
}) {
  const [status, setStatus] = useState<UpdateStatus>("idle")
  const [result, setResult] = useState<UpdateResult | null>(null)
  const [open, setOpen] = useState(false)

  const handleUpdate = async () => {
    setStatus("updating")
    setResult(null)

    try {
      const response = await fetch("/api/update-data", {
        method: "POST",
      })

      const data: UpdateResult = await response.json()

      if (data.success) {
        setStatus("success")
        setResult(data)
      } else {
        setStatus("error")
        setResult(data)
      }
    } catch (err) {
      setStatus("error")
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Network error",
      })
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (status === "success") {
      // Reload the page to show fresh data
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <RefreshCw className="h-5 w-5 text-primary" />
            Update Market Intelligence
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            This will use AI agents to search the web for fresh market data,
            archive the current data, and update the dashboard with new information.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {status === "idle" && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Archive className="mt-0.5 h-4 w-4 text-primary" />
                <span>Current data will be archived with today&apos;s date</span>
              </div>
              <div className="flex items-start gap-3">
                <RefreshCw className="mt-0.5 h-4 w-4 text-primary" />
                <span>
                  AI agents will search for latest NSE/BSE indices, macro
                  indicators, and market-moving events
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 text-bullish" />
                <span>
                  Dashboard will refresh with new alerts, sector rankings, and
                  watch items
                </span>
              </div>
            </div>
          )}

          {status === "updating" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-center">
                <p className="font-medium text-foreground">
                  Updating Market Data...
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI agents are searching the web and analysing market conditions
                </p>
              </div>
            </div>
          )}

          {status === "success" && result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-bullish/10 p-4">
                <CheckCircle className="h-6 w-6 text-bullish" />
                <div>
                  <p className="font-medium text-foreground">Update Complete</p>
                  <p className="text-sm text-muted-foreground">
                    Market data has been refreshed
                  </p>
                </div>
              </div>

              {result.summary && (
                <div className="rounded-lg border border-border bg-secondary/30 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Summary
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-mono font-medium text-foreground">
                        {result.summary.date}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Nifty 50</p>
                      <p className="font-mono font-medium text-foreground">
                        {result.summary.nifty50.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Alerts</p>
                      <p className="font-mono font-medium text-foreground">
                        {result.summary.alertsCount}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {result.archived && (
                <p className="text-xs text-muted-foreground">
                  Previous data archived as:{" "}
                  <code className="rounded bg-secondary px-1 font-mono">
                    {result.archived}
                  </code>
                </p>
              )}
            </div>
          )}

          {status === "error" && result && (
            <div className="flex items-center gap-3 rounded-lg bg-bearish/10 p-4">
              <AlertCircle className="h-6 w-6 text-bearish" />
              <div>
                <p className="font-medium text-foreground">Update Failed</p>
                <p className="text-sm text-muted-foreground">
                  {result.error || "An unexpected error occurred"}
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {status === "idle" && (
            <>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                Start Update
              </Button>
            </>
          )}

          {status === "updating" && (
            <Button disabled className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Updating...
            </Button>
          )}

          {(status === "success" || status === "error") && (
            <Button onClick={handleClose}>
              {status === "success" ? "Refresh Dashboard" : "Close"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
