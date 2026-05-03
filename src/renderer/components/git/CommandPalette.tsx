import { useEffect, useState } from 'react'
import { Search, GitBranch, GitCommit, Cloud, FileText, ArrowRight } from 'lucide-react'
import type { RefGroups, GitRevision } from '@/types/git'

type PaletteItem = { icon: any; label: string; hint: string; group: string; action?: () => void }

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  refs: RefGroups
  commits: GitRevision[]
  onCheckout: (branch: string) => void
}

export function CommandPalette({ open, onClose, refs, commits, onCheckout }: CommandPaletteProps) {
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  if (!open) return null

  const items: PaletteItem[] = [
    ...refs.branches.map((b) => ({
      icon: GitBranch,
      label: b.name,
      hint: 'Checkout branch',
      group: 'Branches',
      action: () => { onCheckout(b.name); onClose() },
    })),
    ...commits.slice(0, 8).map((c) => ({
      icon: GitCommit,
      label: c.subject,
      hint: c.objectId.slice(0, 8),
      group: 'Commits',
    })),
    { icon: Cloud, label: 'Pull from origin', hint: '⌘⇧P', group: 'Actions' },
    { icon: Cloud, label: 'Push to origin', hint: '⌘⇧K', group: 'Actions' },
    { icon: FileText, label: 'Open file…', hint: '⌘O', group: 'Actions' },
  ].filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))

  const grouped = items.reduce<Record<string, PaletteItem[]>>((acc, it) => {
    ;(acc[it.group] ||= []).push(it)
    return acc
  }, {})

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-[min(640px,92vw)] mac-window flex flex-col max-h-[60vh]"
      >
        <div className="flex items-center gap-2 px-3 h-12 border-b border-border">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type a command, branch or commit…"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted-foreground"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10.5px] font-mono">esc</kbd>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-mac py-1.5">
          {Object.entries(grouped).map(([g, list]) => (
            <div key={g} className="mb-1">
              <div className="px-3 py-1 text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">
                {g}
              </div>
              {list.slice(0, 6).map((it, i) => (
                <button
                  key={i}
                  onClick={it.action}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px] hover:bg-primary hover:text-primary-foreground group transition-colors"
                >
                  <it.icon className="size-3.5 text-muted-foreground group-hover:text-primary-foreground" />
                  <span className="truncate">{it.label}</span>
                  <span className="ml-auto text-[10.5px] text-muted-foreground group-hover:text-primary-foreground/80 font-mono">
                    {it.hint}
                  </span>
                  <ArrowRight className="size-3 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          ))}
          {items.length === 0 && (
            <div className="px-4 py-8 text-center text-[12.5px] text-muted-foreground">No results</div>
          )}
        </div>
        <div className="flex items-center gap-3 px-3 h-8 border-t border-border text-[10.5px] text-muted-foreground">
          <span><kbd className="px-1 py-px rounded bg-muted border border-border font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-px rounded bg-muted border border-border font-mono">↵</kbd> select</span>
          <span className="ml-auto">NovaGitX</span>
        </div>
      </div>
    </div>
  )
}
