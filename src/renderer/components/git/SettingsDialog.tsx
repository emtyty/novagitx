import { useEffect, useMemo, useState } from 'react'
import { Settings2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useGitConfig, useGitConfigMutations } from '@/hooks/useRepo'
import type { GitConfigEntry } from '@/types/git'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
}

const COMMON_KEYS = [
  { key: 'user.name',          label: 'User name' },
  { key: 'user.email',         label: 'User email' },
  { key: 'user.signingkey',    label: 'GPG signing key' },
  { key: 'commit.gpgsign',     label: 'Sign commits by default (true/false)' },
  { key: 'core.editor',        label: 'Editor' },
  { key: 'core.autocrlf',      label: 'Autocrlf (true/false/input)' },
  { key: 'pull.rebase',        label: 'pull.rebase (true/false/merges)' },
  { key: 'diff.tool',          label: 'External diff tool' },
  { key: 'merge.tool',         label: 'External merge tool' },
  { key: 'init.defaultBranch', label: 'Default branch name' },
] as const

export function SettingsDialog({ open, onOpenChange, repoPath }: Props) {
  const [scope, setScope] = useState<'local' | 'global'>('local')
  const { data: entries = [] } = useGitConfig(open ? repoPath : null, scope)
  const { set, unset } = useGitConfigMutations(repoPath)
  const [draft, setDraft] = useState<Record<string, string>>({})

  const map = useMemo<Record<string, GitConfigEntry>>(() => {
    const m: Record<string, GitConfigEntry> = {}
    for (const e of entries) m[e.key] = e
    return m
  }, [entries])

  useEffect(() => { if (open) setDraft({}) }, [open, scope])

  async function commit(key: string, raw: string) {
    const value = raw.trim()
    if (!value) {
      if (map[key]) await unset.mutateAsync({ key, scope })
    } else if (map[key]?.value !== value) {
      await set.mutateAsync({ key, value, scope })
    }
  }

  async function saveAll() {
    for (const { key } of COMMON_KEYS) {
      if (key in draft) await commit(key, draft[key])
    }
    setDraft({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Settings2 className="size-4" />Settings</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-1.5 pb-2">
          {(['local', 'global'] as const).map((s) => (
            <button key={s} onClick={() => setScope(s)}
              className={`h-7 px-3 rounded text-[11.5px] capitalize ${scope === s ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted'}`}>
              {s}
            </button>
          ))}
          <span className="ml-2 text-[11px] text-muted-foreground">
            {scope === 'local' ? 'Repository-level git config (.git/config)' : 'User-level git config (~/.gitconfig)'}
          </span>
        </div>

        <div className="border border-border rounded-md max-h-[360px] overflow-y-auto scrollbar-mac">
          {COMMON_KEYS.map(({ key, label }) => {
            const current = map[key]?.value ?? ''
            const value = key in draft ? draft[key] : current
            return (
              <div key={key} className="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-0">
                <div className="w-[180px] shrink-0">
                  <div className="text-[12px] font-mono">{key}</div>
                  <div className="text-[10.5px] text-muted-foreground">{label}</div>
                </div>
                <input value={value} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                  className="h-7 flex-1 bg-background/40 rounded px-2 text-[12px] outline-none border border-border/60" />
              </div>
            )
          })}
        </div>

        <div className="text-[11px] text-muted-foreground">
          Tip: external diff/merge tools must already be configured (e.g. <code className="font-mono">code</code>, <code className="font-mono">meld</code>, <code className="font-mono">kdiff3</code>).
        </div>

        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted">Close</button>
          <button onClick={saveAll} disabled={Object.keys(draft).length === 0 || set.isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] disabled:opacity-40">
            {set.isPending ? 'Saving…' : 'Save changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
