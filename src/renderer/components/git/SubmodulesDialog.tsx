import { useState } from 'react'
import { Folder, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSubmodules, useSubmoduleMutations } from '@/hooks/useRepo'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function SubmodulesDialog({ open, onOpenChange, repoPath }: Props) {
  const [adding, setAdding] = useState(false)
  const [url, setUrl] = useState('')
  const [path, setPath] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: submodules = [], isLoading } = useSubmodules(repoPath)
  const { add, update, remove } = useSubmoduleMutations(repoPath)

  async function handleAdd() {
    if (!url || !path) return
    setError(null)
    try {
      await add.mutateAsync({ url, path })
      setUrl('')
      setPath('')
      setAdding(false)
    } catch (e: any) { setError(e?.message) }
  }

  async function handleUpdate() {
    setError(null)
    try { await update.mutateAsync() } catch (e: any) { setError(e?.message) }
  }

  async function handleRemove(p: string) {
    setError(null)
    try { await remove.mutateAsync(p) } catch (e: any) { setError(e?.message) }
  }

  const STATUS_COLOR: Record<string, string> = {
    clean: 'text-graph-2',
    modified: 'text-graph-3',
    uninitialized: 'text-muted-foreground',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="size-4" />
            Submodules
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAdding((a) => !a)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-border text-[12px] hover:bg-muted transition-colors"
            >
              <Plus className="size-3.5" />
              Add
            </button>
            <button
              onClick={handleUpdate}
              disabled={update.isPending}
              className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-border text-[12px] hover:bg-muted transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`size-3.5 ${update.isPending ? 'animate-spin' : ''}`} />
              Update all
            </button>
          </div>

          {adding && (
            <div className="border border-border rounded-md p-3 flex flex-col gap-2 bg-muted/20">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Repository URL"
                className="h-8 rounded-md border border-border bg-background px-3 text-[12.5px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
              />
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="Local path (e.g. vendor/lib)"
                className="h-8 rounded-md border border-border bg-background px-3 text-[12.5px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!url || !path || add.isPending}
                  className="h-7 px-3 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-40"
                >
                  {add.isPending ? 'Adding…' : 'Add submodule'}
                </button>
                <button onClick={() => setAdding(false)} className="h-7 px-3 rounded-md text-[12px] text-muted-foreground hover:bg-muted">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {isLoading && <p className="text-[12px] text-muted-foreground">Loading…</p>}

          {!isLoading && submodules.length === 0 && (
            <p className="text-[12px] text-muted-foreground py-2">No submodules</p>
          )}

          <div className="space-y-1 max-h-[280px] overflow-y-auto">
            {submodules.map((s) => (
              <div key={s.path} className="flex items-start gap-3 p-2.5 rounded-md border border-border/60 hover:bg-muted/30 transition-colors">
                <Folder className="size-4 text-graph-3 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-medium font-mono">{s.path}</span>
                    <span className={`text-[10.5px] ${STATUS_COLOR[s.status] ?? 'text-muted-foreground'}`}>
                      {s.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate mt-0.5">{s.url}</div>
                  {s.hash && <div className="text-[10.5px] font-mono text-muted-foreground mt-0.5">{s.hash.slice(0, 8)}</div>}
                </div>
                <button
                  onClick={() => handleRemove(s.path)}
                  disabled={remove.isPending}
                  className="shrink-0 p-1.5 rounded-md text-destructive/60 hover:text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
