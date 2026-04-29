import { useState } from 'react'
import { Archive } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useArchive } from '@/hooks/useRepo'
import { gitApi } from '@/api/git'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

export function ArchiveDialog({ open, onOpenChange, repoPath }: Props) {
  const [ref, setRef] = useState('HEAD')
  const [format, setFormat] = useState<'zip' | 'tar.gz'>('zip')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  const archive = useArchive(repoPath)

  async function handleExport() {
    setError(null); setDone(null)
    const ext = format === 'zip' ? 'zip' : 'tar.gz'
    const filters = [{ name: format.toUpperCase(), extensions: [ext] }]
    const out = await gitApi.saveFileDialog(`${ref.replace(/[^\w.-]/g, '_')}.${ext}`, filters)
    if (!out) return
    try {
      await archive.mutateAsync({ ref, format, outputPath: out })
      setDone(out)
    } catch (e: any) { setError(e?.message) }
  }

  function handleOpen(o: boolean) {
    if (!o) { setError(null); setDone(null) }
    onOpenChange(o)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Archive className="size-4" />Archive</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-1">
          <p className="text-[12.5px] text-muted-foreground">Export the tree at any ref as a zip or tar.gz.</p>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">Ref (branch / tag / commit)</span>
            <input value={ref} onChange={(e) => setRef(e.target.value)}
              className="h-8 bg-background/40 rounded px-2 text-[12px] outline-none border border-border/60" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted-foreground">Format</span>
            <select value={format} onChange={(e) => setFormat(e.target.value as 'zip' | 'tar.gz')}
              className="h-8 bg-background/40 rounded px-2 text-[12px] outline-none border border-border/60">
              <option value="zip">zip</option>
              <option value="tar.gz">tar.gz</option>
            </select>
          </label>
          {error && <p className="text-[12px] text-destructive">{error}</p>}
          {done && <p className="text-[12px] text-graph-2 break-all">Wrote {done}</p>}
        </div>
        <DialogFooter>
          <button onClick={() => handleOpen(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted">Close</button>
          <button onClick={handleExport} disabled={!ref || archive.isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] disabled:opacity-40">
            {archive.isPending ? 'Archiving…' : 'Save…'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
