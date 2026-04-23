import { useState } from 'react'
import { Trash2, Eye } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useCleanDryRun, useCleanMutation } from '@/hooks/useRepo'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function CleanDialog({ open, onOpenChange, repoPath }: Props) {
  const [previewed, setPreviewed] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const { data: entries = [], isFetching, refetch } = useCleanDryRun(repoPath, previewed)
  const cleanMutation = useCleanMutation(repoPath)

  function handleOpen(o: boolean) {
    if (!o) { setPreviewed(false); setDone(false); setError(null) }
    onOpenChange(o)
  }

  async function handlePreview() {
    setPreviewed(true)
    await refetch()
  }

  async function handleClean() {
    setError(null)
    try {
      await cleanMutation.mutateAsync()
      setDone(true)
      setPreviewed(false)
    } catch (e: any) { setError(e?.message) }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trash2 className="size-4" />
            Clean Working Directory
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          {!previewed && !done && (
            <p className="text-[12.5px] text-muted-foreground">
              Preview untracked files and directories that would be removed, then confirm.
            </p>
          )}

          {done && (
            <p className="text-[12.5px] text-graph-2">Working directory cleaned successfully.</p>
          )}

          {previewed && !done && (
            <>
              {isFetching && <p className="text-[12px] text-muted-foreground">Scanning…</p>}
              {!isFetching && entries.length === 0 && (
                <p className="text-[12px] text-muted-foreground">Nothing to clean.</p>
              )}
              {entries.length > 0 && (
                <div className="border border-border rounded-md overflow-hidden max-h-[240px] overflow-y-auto">
                  <div className="px-3 py-1.5 bg-muted/60 border-b border-border text-[11px] text-muted-foreground">
                    {entries.length} item{entries.length !== 1 ? 's' : ''} would be removed
                  </div>
                  {entries.map((e, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 last:border-0">
                      <span className={`text-[10.5px] shrink-0 ${e.isDir ? 'text-graph-3' : 'text-destructive'}`}>
                        {e.isDir ? 'dir' : 'file'}
                      </span>
                      <span className="text-[12px] font-mono truncate">{e.path}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>

        <DialogFooter className="pt-1">
          <button
            type="button"
            onClick={() => handleOpen(false)}
            className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors"
          >
            {done ? 'Close' : 'Cancel'}
          </button>
          {!done && !previewed && (
            <button
              onClick={handlePreview}
              disabled={isFetching}
              className="h-8 px-4 rounded-md border border-border text-[12px] hover:bg-muted transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Eye className="size-3.5" />
              Preview
            </button>
          )}
          {previewed && !done && entries.length > 0 && (
            <button
              onClick={handleClean}
              disabled={cleanMutation.isPending}
              className="h-8 px-4 rounded-md bg-destructive text-destructive-foreground text-[12px] font-medium hover:bg-destructive/90 disabled:opacity-40"
            >
              {cleanMutation.isPending ? 'Cleaning…' : `Remove ${entries.length} item${entries.length !== 1 ? 's' : ''}`}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
