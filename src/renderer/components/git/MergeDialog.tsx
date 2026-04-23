import { useState } from 'react'
import { GitMerge } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

type Strategy = 'merge' | 'no-ff' | 'squash'

interface MergeDialogProps {
  open: boolean
  branches: string[]
  currentBranch: string | null
  onConfirm: (branch: string, strategy: Strategy) => void
  onClose: () => void
  initialBranch?: string
}

export function MergeDialog({ open, branches, currentBranch, onConfirm, onClose, initialBranch }: MergeDialogProps) {
  const [branch, setBranch] = useState(initialBranch ?? '')
  const [strategy, setStrategy] = useState<Strategy>('merge')

  const available = branches.filter((b) => b !== currentBranch)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!branch) return
    onConfirm(branch, strategy)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="size-4" />
            Merge into <span className="font-mono text-primary">{currentBranch}</span>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Branch to merge</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              autoFocus
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">— select branch —</option>
              {available.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Strategy</label>
            <div className="flex flex-col gap-1.5">
              {([
                ['merge', 'Fast-forward if possible'],
                ['no-ff', 'Always create merge commit (--no-ff)'],
                ['squash', 'Squash all commits (--squash)'],
              ] as [Strategy, string][]).map(([val, desc]) => (
                <label key={val} className="flex items-start gap-2.5 cursor-pointer text-[12.5px]">
                  <input
                    type="radio"
                    name="strategy"
                    value={val}
                    checked={strategy === val}
                    onChange={() => setStrategy(val)}
                    className="mt-0.5"
                  />
                  <span>
                    <span className="font-mono text-[11.5px] text-primary">{val}</span>
                    <span className="text-muted-foreground ml-1.5">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-1">
            <button type="button" onClick={onClose} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!branch}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Merge
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
