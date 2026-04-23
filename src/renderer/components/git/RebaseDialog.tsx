import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useRebaseMutations } from '@/hooks/useRepo'
import type { RefGroups } from '@/types/git'

interface RebaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repoPath: string | null
  refs: RefGroups
  currentBranch: string | null
}

export function RebaseDialog({ open, onOpenChange, repoPath, refs, currentBranch }: RebaseDialogProps) {
  const [onto, setOnto] = useState('')
  const { rebase, abort } = useRebaseMutations(repoPath)

  const allBranches = [
    ...refs.branches.filter((b) => b.name !== currentBranch).map((b) => b.name),
    ...refs.remotes.map((r) => `${r.remote}/${r.name}`),
  ]

  function handleRebase() {
    if (!onto.trim()) return
    rebase.mutate(onto.trim(), {
      onSuccess: () => { onOpenChange(false); setOnto('') },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4 text-primary" />
            Rebase
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <div className="text-[12px] text-muted-foreground mb-1.5">
              Rebase <span className="font-semibold text-foreground font-mono">{currentBranch ?? 'HEAD'}</span> onto:
            </div>
            <input
              list="rebase-branches"
              value={onto}
              onChange={(e) => setOnto(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRebase() }}
              placeholder="Branch or commit…"
              autoFocus
              className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-[12.5px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            />
            <datalist id="rebase-branches">
              {allBranches.map((b) => <option key={b} value={b} />)}
            </datalist>
          </div>

          {rebase.isError && (
            <div className="rounded-md bg-destructive/10 border border-destructive/30 px-3 py-2 text-[11.5px] text-destructive whitespace-pre-wrap font-mono">
              {String((rebase.error as any)?.message ?? 'Rebase failed')}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            This replays commits from <span className="font-mono">{currentBranch ?? 'HEAD'}</span> on top of the selected branch. Conflicts must be resolved manually if they arise.
          </p>
        </div>

        <DialogFooter className="flex-row gap-2">
          <button
            onClick={() => abort.mutate(undefined, { onSuccess: () => onOpenChange(false) })}
            disabled={abort.isPending}
            className="text-[12px] px-3 h-8 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
          >
            {abort.isPending ? 'Aborting…' : 'Abort rebase'}
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onOpenChange(false)}
            className="text-[12px] px-3 h-8 rounded-md border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRebase}
            disabled={!onto.trim() || rebase.isPending}
            className="text-[12px] px-4 h-8 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 font-medium"
          >
            {rebase.isPending ? 'Rebasing…' : 'Rebase'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
