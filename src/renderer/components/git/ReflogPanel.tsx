import { X, RotateCcw } from 'lucide-react'
import { useReflog } from '@/hooks/useRepo'
import type { ReflogEntry } from '@/types/git'

interface ReflogPanelProps {
  repoPath: string | null
  onClose: () => void
  onCheckout?: (hash: string) => void
}

export function ReflogPanel({ repoPath, onClose, onCheckout }: ReflogPanelProps) {
  const { data: entries = [], isLoading } = useReflog(repoPath)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-window border-l border-border">
      <div className="h-9 border-b border-border flex items-center gap-2 px-3 shrink-0 bg-titlebar/60">
        <RotateCcw className="size-3.5 text-primary shrink-0" />
        <span className="text-[12px] font-semibold flex-1">Reflog</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-mac font-mono">
        {isLoading && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-[12px] font-sans">
            Loading reflog…
          </div>
        )}
        {!isLoading && entries.length === 0 && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-[12px] font-sans">
            Reflog is empty
          </div>
        )}
        {entries.map((entry, i) => (
          <ReflogRow key={i} entry={entry} onCheckout={onCheckout} />
        ))}
      </div>
    </div>
  )
}

function ReflogRow({ entry, onCheckout }: { entry: ReflogEntry; onCheckout?: (hash: string) => void }) {
  const date = entry.date
    ? new Date(entry.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="flex items-start gap-2 px-3 py-1.5 border-b border-border/40 hover:bg-muted/40 group">
      <span className="text-[11px] text-primary shrink-0 mt-0.5">{entry.hash.slice(0, 7)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] text-muted-foreground shrink-0">{entry.selector}</span>
          <span className="text-[10.5px] text-foreground/80 truncate">{entry.action}</span>
        </div>
        {date && <div className="text-[10px] text-muted-foreground/60 mt-0.5">{date}</div>}
      </div>
      {onCheckout && (
        <button
          onClick={() => onCheckout(entry.hash)}
          className="text-[10.5px] text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 font-sans"
        >
          Checkout
        </button>
      )}
    </div>
  )
}
