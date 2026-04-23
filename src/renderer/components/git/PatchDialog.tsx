import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { usePatchMutations } from '@/hooks/useRepo'
import { gitApi } from '@/api/git'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
  branches: string[]
  currentBranch: string | null
  mode: 'format' | 'apply'
}

export function PatchDialog({ open, onOpenChange, repoPath, branches, currentBranch, mode }: Props) {
  const [base, setBase] = useState('')
  const [outputDir, setOutputDir] = useState('')
  const [patchPath, setPatchPath] = useState('')
  const [useAm, setUseAm] = useState(true)
  const [result, setResult] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { formatPatch, applyPatch } = usePatchMutations(repoPath)

  const available = branches.filter((b) => b !== currentBranch)

  async function pickDir() {
    const dir = await gitApi.openDirDialog()
    if (dir) setOutputDir(dir)
  }

  async function pickFile() {
    const file = await gitApi.openFileDialog([{ name: 'Patch files', extensions: ['patch', 'diff', 'eml'] }])
    if (file) setPatchPath(file)
  }

  async function handleFormat() {
    if (!base || !outputDir) return
    setError(null)
    setResult(null)
    try {
      const files = await formatPatch.mutateAsync({ base, outputDir })
      setResult(files)
    } catch (e: any) { setError(e?.message) }
  }

  async function handleApply() {
    if (!patchPath) return
    setError(null)
    try {
      await applyPatch.mutateAsync({ patchPath, useAm })
      onOpenChange(false)
    } catch (e: any) { setError(e?.message) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            {mode === 'format' ? 'Format Patch' : 'Apply Patch'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'format' ? (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-muted-foreground">Since branch / commit</label>
              <select
                value={base}
                onChange={(e) => setBase(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-[13px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
              >
                <option value="">— select base —</option>
                {available.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-muted-foreground">Output directory</label>
              <div className="flex gap-2">
                <input
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  placeholder="/path/to/patches"
                  className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={pickDir}
                  className="h-9 px-3 rounded-md border border-border text-[12px] hover:bg-muted transition-colors"
                >
                  Browse…
                </button>
              </div>
            </div>
            {result && (
              <div className="bg-muted rounded-md p-2 space-y-0.5">
                <p className="text-[11px] text-muted-foreground mb-1">{result.length} patch file{result.length !== 1 ? 's' : ''} created:</p>
                {result.map((f, i) => <div key={i} className="text-[11px] font-mono truncate">{f}</div>)}
              </div>
            )}
            {error && <p className="text-[12px] text-destructive">{error}</p>}
            <DialogFooter className="pt-1">
              <button type="button" onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors">
                {result ? 'Close' : 'Cancel'}
              </button>
              {!result && (
                <button
                  onClick={handleFormat}
                  disabled={!base || !outputDir || formatPatch.isPending}
                  className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-40"
                >
                  {formatPatch.isPending ? 'Exporting…' : 'Export Patches'}
                </button>
              )}
            </DialogFooter>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] text-muted-foreground">Patch file</label>
              <div className="flex gap-2">
                <input
                  value={patchPath}
                  onChange={(e) => setPatchPath(e.target.value)}
                  placeholder="/path/to/file.patch"
                  className="flex-1 h-9 rounded-md border border-border bg-background px-3 text-[12.5px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={pickFile}
                  className="h-9 px-3 rounded-md border border-border text-[12px] hover:bg-muted transition-colors"
                >
                  Browse…
                </button>
              </div>
            </div>
            <label className="flex items-center gap-2 text-[12.5px] cursor-pointer">
              <input type="checkbox" checked={useAm} onChange={(e) => setUseAm(e.target.checked)} />
              Use <span className="font-mono text-primary">git am</span>
              <span className="text-muted-foreground">(preserves author/date; uncheck for git apply)</span>
            </label>
            {error && <p className="text-[12px] text-destructive">{error}</p>}
            <DialogFooter className="pt-1">
              <button type="button" onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!patchPath || applyPatch.isPending}
                className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-40"
              >
                {applyPatch.isPending ? 'Applying…' : 'Apply Patch'}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
