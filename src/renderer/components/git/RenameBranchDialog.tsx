import { useState, useEffect } from 'react'
import { GitBranch } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface RenameBranchDialogProps {
  open: boolean
  currentName: string
  onConfirm: (oldName: string, newName: string) => void
  onClose: () => void
}

export function RenameBranchDialog({ open, currentName, onConfirm, onClose }: RenameBranchDialogProps) {
  const [name, setName] = useState(currentName)
  useEffect(() => { if (open) setName(currentName) }, [open, currentName])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || trimmed === currentName) return
    onConfirm(currentName, trimmed)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-[360px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="size-4" />
            Rename branch
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">New name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <DialogFooter>
            <button type="button" onClick={onClose} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button
              type="submit"
              disabled={!name.trim() || name.trim() === currentName}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Rename
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
