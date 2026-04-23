import { useState } from 'react'
import { GitBranch } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface CreateBranchDialogProps {
  open: boolean
  fromBranch: string
  onConfirm: (name: string, from: string) => void
  onClose: () => void
}

export function CreateBranchDialog({ open, fromBranch, onConfirm, onClose }: CreateBranchDialogProps) {
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onConfirm(trimmed, fromBranch)
    setName('')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { setName(''); onClose() } }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4" />
            New branch
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">
              From <span className="font-mono text-foreground">{fromBranch}</span>
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="branch-name"
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => { setName(''); onClose() }}
              className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Create & checkout
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
