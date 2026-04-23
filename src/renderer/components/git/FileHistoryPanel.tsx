import { useState } from 'react'
import { X, History } from 'lucide-react'
import { useFileHistory } from '@/hooks/useRepo'
import type { GitRevision } from '@/types/git'
import { hashColor, initials } from '@/types/git'

interface FileHistoryPanelProps {
  repoPath: string | null
  filePath: string
  onClose: () => void
  onSelectCommit?: (commit: GitRevision) => void
}

export function FileHistoryPanel({ repoPath, filePath, onClose, onSelectCommit }: FileHistoryPanelProps) {
  const { data: commits = [], isLoading } = useFileHistory(repoPath, filePath)
  const [selected, setSelected] = useState<string | null>(null)

  function handleSelect(commit: GitRevision) {
    setSelected(commit.objectId)
    onSelectCommit?.(commit)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-window border-l border-border">
      <div className="h-9 border-b border-border flex items-center gap-2 px-3 shrink-0 bg-titlebar/60">
        <History className="size-3.5 text-primary shrink-0" />
        <span className="text-[12px] font-semibold truncate flex-1">History — {filePath.split('/').pop()}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-mac">
        {isLoading && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-[12px]">
            Loading history…
          </div>
        )}
        {!isLoading && commits.length === 0 && (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-[12px]">
            No history found
          </div>
        )}
        {commits.map((commit) => {
          const isActive = commit.objectId === selected
          const date = new Date(commit.authorUnixTime * 1000).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric',
          })
          return (
            <button
              key={commit.objectId}
              onClick={() => handleSelect(commit)}
              className={`w-full flex items-start gap-2.5 px-3 py-2 text-left border-b border-border/50 transition-colors ${
                isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
              }`}
            >
              <span
                className="size-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5"
                style={{ background: hashColor(commit.author) }}
              >
                {initials(commit.author)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium truncate">{commit.subject}</div>
                <div className="text-[10.5px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <span className="font-mono">{commit.objectId.slice(0, 7)}</span>
                  <span>·</span>
                  <span>{commit.author}</span>
                  <span>·</span>
                  <span>{date}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
