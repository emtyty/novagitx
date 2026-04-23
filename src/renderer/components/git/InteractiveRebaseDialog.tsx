import { useState, useEffect } from 'react'
import { GitBranch, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useRebaseCommits, useInteractiveRebaseMutation } from '@/hooks/useRepo'
import type { RebaseCommit } from '@/types/git'

type Action = RebaseCommit['action']

const ACTION_COLORS: Record<Action, string> = {
  pick:    'text-graph-2',
  squash:  'text-graph-1',
  fixup:   'text-graph-1',
  drop:    'text-destructive',
  reword:  'text-graph-3',
  edit:    'text-graph-3',
}

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
  branches: string[]
  currentBranch: string | null
}

export function InteractiveRebaseDialog({ open, onOpenChange, repoPath, branches, currentBranch }: Props) {
  const [base, setBase] = useState('')
  const [commits, setCommits] = useState<RebaseCommit[]>([])
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const available = branches.filter((b) => b !== currentBranch)
  const { data: rebaseCommits, isFetching } = useRebaseCommits(repoPath, base || null)
  const rebaseMutation = useInteractiveRebaseMutation(repoPath)

  useEffect(() => {
    if (rebaseCommits) setCommits([...rebaseCommits])
  }, [rebaseCommits])

  function moveUp(i: number) {
    if (i === 0) return
    setCommits((cs) => { const a = [...cs]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a })
  }

  function moveDown(i: number) {
    if (i >= commits.length - 1) return
    setCommits((cs) => { const a = [...cs]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a })
  }

  function setAction(i: number, action: Action) {
    setCommits((cs) => cs.map((c, idx) => idx === i ? { ...c, action } : c))
  }

  function handleDragStart(i: number) { setDragIdx(i) }
  function handleDragOver(e: React.DragEvent, i: number) { e.preventDefault(); setDragOver(i) }
  function handleDrop(i: number) {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setDragOver(null); return }
    setCommits((cs) => {
      const a = [...cs]
      const [item] = a.splice(dragIdx, 1)
      a.splice(i, 0, item)
      return a
    })
    setDragIdx(null)
    setDragOver(null)
  }

  async function handleSubmit() {
    if (!base || commits.length === 0) return
    setError(null)
    try {
      await rebaseMutation.mutateAsync({ base, commits })
      onOpenChange(false)
    } catch (e: any) {
      setError(e?.message ?? 'Rebase failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4" />
            Interactive Rebase
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Rebase onto</label>
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">— select base branch —</option>
              {available.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {isFetching && (
            <p className="text-[12px] text-muted-foreground">Loading commits…</p>
          )}

          {commits.length > 0 && (
            <div className="flex flex-col gap-0.5 max-h-[340px] overflow-y-auto border border-border rounded-md p-1">
              <p className="text-[10.5px] text-muted-foreground px-2 py-1">
                Drag to reorder · top = applied first
              </p>
              {commits.map((c, i) => (
                <div
                  key={c.hash + i}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors select-none ${
                    dragOver === i ? 'bg-primary/10' : 'hover:bg-muted'
                  } ${c.action === 'drop' ? 'opacity-40' : ''}`}
                >
                  <GripVertical className="size-3.5 text-muted-foreground shrink-0 cursor-grab" />
                  <select
                    value={c.action}
                    onChange={(e) => setAction(i, e.target.value as Action)}
                    onClick={(e) => e.stopPropagation()}
                    className={`h-6 rounded border border-border bg-background text-[11px] font-mono px-1 ${ACTION_COLORS[c.action]}`}
                  >
                    {(['pick','reword','edit','squash','fixup','drop'] as Action[]).map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <span className="text-[11px] font-mono text-muted-foreground shrink-0">{c.hash.slice(0, 7)}</span>
                  <span className="text-[12px] truncate flex-1">{c.subject}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-20">
                      <ChevronUp className="size-3" />
                    </button>
                    <button onClick={() => moveDown(i)} disabled={i >= commits.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-20">
                      <ChevronDown className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>

        <DialogFooter className="pt-1">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!base || commits.length === 0 || rebaseMutation.isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {rebaseMutation.isPending ? 'Rebasing…' : 'Start Rebase'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
