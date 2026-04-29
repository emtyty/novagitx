import { useEffect, useState } from 'react'
import { LayoutGrid } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useSparseCheckout, useSparseCheckoutMutation } from '@/hooks/useRepo'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function SparseCheckoutDialog({ open, onOpenChange, repoPath }: Props) {
  const { data } = useSparseCheckout(open ? repoPath : null)
  const set = useSparseCheckoutMutation(repoPath)
  const [text, setText] = useState('')
  const [cone, setCone] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && data) {
      setText(data.patterns.join('\n'))
      setCone(data.cone)
    }
  }, [open, data])

  async function handleSave() {
    setError(null)
    const patterns = text.split('\n').map((l) => l.trim()).filter(Boolean)
    try {
      await set.mutateAsync({ patterns, cone })
      onOpenChange(false)
    } catch (e: any) { setError(e?.message) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><LayoutGrid className="size-4" />Sparse Checkout</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-1">
          <p className="text-[11.5px] text-muted-foreground">
            Check out only a subset of the working tree. One pattern per line. Empty list disables sparse-checkout.
          </p>
          <label className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
            <input type="checkbox" checked={cone} onChange={(e) => setCone(e.target.checked)} className="rounded border-border" />
            Cone mode (faster; pattern = directory path)
          </label>
          <textarea value={text} onChange={(e) => setText(e.target.value)}
            placeholder={cone ? 'src/\ndocs/' : '/src/**\n!**/*.test.ts'}
            className="font-mono text-[12px] bg-background/40 rounded px-2 py-2 outline-none border border-border/60 min-h-[200px] scrollbar-mac" />
          {data && (
            <p className="text-[11px] text-muted-foreground">
              Currently {data.enabled ? 'enabled' : 'disabled'} · {data.patterns.length} pattern{data.patterns.length === 1 ? '' : 's'}
            </p>
          )}
          {error && <p className="text-[11.5px] text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted">Cancel</button>
          <button onClick={handleSave} disabled={set.isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] disabled:opacity-40">
            {set.isPending ? 'Applying…' : 'Apply'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
