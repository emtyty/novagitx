import { useState } from 'react'
import { GitBranch, FolderOpen, Plus, Trash2, Lock } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useWorktrees, useWorktreeMutations } from '@/hooks/useRepo'
import { gitApi } from '@/api/git'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function WorktreesDialog({ open, onOpenChange, repoPath }: Props) {
  const { data: trees = [] } = useWorktrees(repoPath)
  const { add, remove, prune } = useWorktreeMutations(repoPath)
  const [adding, setAdding] = useState(false)
  const [path, setPath] = useState('')
  const [ref, setRef] = useState('HEAD')
  const [newBranch, setNewBranch] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function pickDir() {
    const p = await gitApi.openDirDialog()
    if (p) setPath(p)
  }

  async function handleAdd() {
    setError(null)
    try {
      await add.mutateAsync({ path, ref, newBranch: newBranch || undefined })
      setPath(''); setRef('HEAD'); setNewBranch(''); setAdding(false)
    } catch (e: any) { setError(e?.message) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><GitBranch className="size-4" />Worktrees</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          <div className="border border-border rounded-md overflow-hidden">
            {trees.length === 0 && <div className="px-3 py-3 text-[12px] text-muted-foreground">No worktrees.</div>}
            {trees.map((t) => (
              <div key={t.path} className="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-0">
                <FolderOpen className="size-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-mono truncate">{t.path}{t.isMain && <span className="ml-2 text-[10px] text-primary">(main)</span>}</div>
                  <div className="text-[10.5px] text-muted-foreground">
                    {t.branch ? `branch: ${t.branch}` : `detached @ ${t.hash.slice(0, 8)}`}
                    {t.isLocked && <span className="ml-2 inline-flex items-center gap-0.5 text-yellow-500"><Lock className="size-2.5" />locked</span>}
                    {t.isPrunable && <span className="ml-2 text-destructive">prunable</span>}
                  </div>
                </div>
                {!t.isMain && (
                  <button
                    onClick={() => remove.mutate({ path: t.path, force: t.isLocked })}
                    className="text-muted-foreground hover:text-destructive p-1"
                    title="Remove worktree"
                  ><Trash2 className="size-3.5" /></button>
                )}
              </div>
            ))}
          </div>

          {!adding && (
            <div className="flex gap-2">
              <button
                onClick={() => setAdding(true)}
                className="h-8 px-3 rounded-md border border-border text-[12px] hover:bg-muted flex items-center gap-1.5"
              ><Plus className="size-3.5" />Add worktree</button>
              <button
                onClick={() => prune.mutate()}
                disabled={prune.isPending}
                className="h-8 px-3 rounded-md border border-border text-[12px] hover:bg-muted disabled:opacity-40"
              >Prune</button>
            </div>
          )}

          {adding && (
            <div className="border border-border rounded-md p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input value={path} onChange={(e) => setPath(e.target.value)} placeholder="Path…"
                  className="h-7 flex-1 bg-background/40 rounded px-2 text-[12px] outline-none border border-border/60" />
                <button onClick={pickDir} className="h-7 px-2 rounded border border-border text-[11px] hover:bg-muted">Pick…</button>
              </div>
              <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="Ref (branch / commit)"
                className="h-7 bg-background/40 rounded px-2 text-[12px] outline-none border border-border/60" />
              <input value={newBranch} onChange={(e) => setNewBranch(e.target.value)} placeholder="New branch (optional)"
                className="h-7 bg-background/40 rounded px-2 text-[12px] outline-none border border-border/60" />
              {error && <p className="text-[11.5px] text-destructive">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setAdding(false); setError(null) }} className="h-7 px-3 text-[11.5px] text-muted-foreground hover:bg-muted rounded">Cancel</button>
                <button onClick={handleAdd} disabled={!path || !ref || add.isPending}
                  className="h-7 px-3 rounded bg-primary text-primary-foreground text-[11.5px] disabled:opacity-40">
                  {add.isPending ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted">Close</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
