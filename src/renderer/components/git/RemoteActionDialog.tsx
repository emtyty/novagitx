import { useState, useEffect } from 'react'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type Action = 'pull' | 'push'

interface RemoteActionDialogProps {
  action: Action | null
  currentBranch: string | null
  remotes: string[]
  onConfirm: (action: Action, remote: string, branch: string, force: boolean) => void
  onClose: () => void
}

export function RemoteActionDialog({
  action,
  currentBranch,
  remotes,
  onConfirm,
  onClose,
}: RemoteActionDialogProps) {
  const defaultRemote = remotes.includes('origin') ? 'origin' : remotes[0] ?? 'origin'
  const [remote, setRemote] = useState(defaultRemote)
  const [branch, setBranch] = useState(currentBranch ?? '')
  const [force, setForce] = useState(false)

  useEffect(() => {
    setRemote(remotes.includes('origin') ? 'origin' : remotes[0] ?? 'origin')
    setBranch(currentBranch ?? '')
    setForce(false)
  }, [action, currentBranch, remotes])

  if (!action) return null

  const isPull = action === 'pull'
  const Icon = isPull ? ArrowDownToLine : ArrowUpFromLine
  const title = isPull ? 'Pull' : 'Push'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!branch.trim()) return
    onConfirm(action!, remote, branch.trim(), force)
    onClose()
  }

  return (
    <Dialog open={!!action} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="size-4" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Remote</label>
            {remotes.length > 1 ? (
              <select
                value={remote}
                onChange={(e) => setRemote(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
              >
                {remotes.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            ) : (
              <div className="h-9 flex items-center px-3 rounded-md border border-border bg-muted/40 text-[13px] font-mono text-muted-foreground">
                {remote || 'origin'}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Branch</label>
            <input
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          {!isPull && (
            <label className="flex items-center gap-2 text-[12px] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="rounded border-border"
              />
              <span>Force push <span className="text-muted-foreground">(--force-with-lease)</span></span>
            </label>
          )}
          <DialogFooter className="pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!branch.trim()}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {title}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
