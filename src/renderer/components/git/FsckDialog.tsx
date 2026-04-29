import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useFsck } from '@/hooks/useRepo'
import type { FsckResult } from '@/types/git'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function FsckDialog({ open, onOpenChange, repoPath }: Props) {
  const fsck = useFsck(repoPath)
  const [result, setResult] = useState<FsckResult | null>(null)

  useEffect(() => {
    if (open && repoPath) {
      fsck.mutateAsync().then(setResult).catch(() => setResult({ output: 'fsck failed', hasIssues: true }))
    } else if (!open) {
      setResult(null)
    }
  }, [open, repoPath])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ShieldCheck className="size-4" />Repository Verify (fsck)</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-1">
          {fsck.isPending && <p className="text-[12px] text-muted-foreground">Running git fsck…</p>}
          {result && (
            <>
              <p className={`text-[12px] ${result.hasIssues ? 'text-destructive' : 'text-graph-2'}`}>
                {result.hasIssues ? 'Issues detected.' : 'Repository is healthy.'}
              </p>
              <pre className="text-[11.5px] font-mono whitespace-pre-wrap bg-muted/40 border border-border rounded p-2 max-h-[320px] overflow-y-auto scrollbar-mac">
                {result.output}
              </pre>
            </>
          )}
        </div>
        <DialogFooter>
          <button onClick={() => fsck.mutateAsync().then(setResult)} disabled={fsck.isPending}
            className="h-8 px-4 rounded-md border border-border text-[12px] hover:bg-muted disabled:opacity-40">Re-run</button>
          <button onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted">Close</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
