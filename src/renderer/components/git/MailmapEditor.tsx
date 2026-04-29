import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useMailmap, useMailmapMutation } from '@/hooks/useRepo'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function MailmapEditor({ open, onOpenChange, repoPath }: Props) {
  const { data: content = '' } = useMailmap(open ? repoPath : null)
  const write = useMailmapMutation(repoPath)
  const [text, setText] = useState('')
  useEffect(() => { if (open) setText(content) }, [open, content])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users className="size-4" />.mailmap</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-[11.5px] text-muted-foreground">
            One entry per line: <code className="font-mono">Real Name &lt;real@email&gt; Old Name &lt;old@email&gt;</code>
          </p>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            className="font-mono text-[12px] bg-background/40 rounded px-2 py-2 outline-none border border-border/60 min-h-[280px] scrollbar-mac" />
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={async () => { await write.mutateAsync(text); onOpenChange(false) }} disabled={write.isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] disabled:opacity-40">
            {write.isPending ? 'Saving…' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
