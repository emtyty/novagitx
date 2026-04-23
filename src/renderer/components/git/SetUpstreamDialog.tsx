import { useState } from 'react'
import { Link } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useBranchExtras } from '@/hooks/useRepo'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
  branch: string
  remotes: string[]
  remoteBranches: string[]
}

export function SetUpstreamDialog({ open, onOpenChange, repoPath, branch, remotes, remoteBranches }: Props) {
  const [upstream, setUpstream] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { setUpstream: setUpstreamMutation } = useBranchExtras(repoPath)

  async function handleConfirm() {
    if (!upstream) return
    setError(null)
    try {
      await setUpstreamMutation.mutateAsync({ branch, upstream })
      onOpenChange(false)
    } catch (e: any) { setError(e?.message) }
  }

  const options = remoteBranches.length > 0 ? remoteBranches : remotes.map((r) => `${r}/${branch}`)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="size-4" />
            Set Upstream for <span className="font-mono text-primary">{branch}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Tracking branch</label>
            <select
              value={upstream}
              onChange={(e) => setUpstream(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            >
              <option value="">— select upstream —</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
        </div>
        <DialogFooter className="pt-1">
          <button type="button" onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!upstream || setUpstreamMutation.isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-40"
          >
            {setUpstreamMutation.isPending ? 'Setting…' : 'Set Upstream'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
