import { useState } from 'react'
import { Tag } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface CreateTagDialogProps {
  open: boolean
  commitHash: string | null
  onConfirm: (name: string, hash: string, message?: string) => void
  onClose: () => void
}

export function CreateTagDialog({ open, commitHash, onConfirm, onClose }: CreateTagDialogProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  function close() { setName(''); setMessage(''); onClose() }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !commitHash) return
    onConfirm(name.trim(), commitHash, message.trim() || undefined)
    close()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="size-4" />
            Create tag
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-1">
          {commitHash && (
            <p className="text-[11.5px] text-muted-foreground font-mono">
              at <span className="text-foreground">{commitHash.slice(0, 8)}</span>
            </p>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">Tag name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="v1.0.0"
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-muted-foreground">
              Message <span className="text-muted-foreground/60">(annotated tag, optional)</span>
            </label>
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Release notes…"
              className="h-9 rounded-md border border-border bg-background px-3 text-[13px] outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <DialogFooter className="pt-1">
            <button type="button" onClick={close} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Create tag
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
