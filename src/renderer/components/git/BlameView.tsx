import { X, GitCommit } from 'lucide-react'
import { useBlame } from '@/hooks/useRepo'
import { hashColor } from '@/types/git'

interface BlameViewProps {
  repoPath: string | null
  filePath: string
  commitHash?: string | null
  onClose: () => void
  onSelectCommit?: (hash: string) => void
}

export function BlameView({ repoPath, filePath, commitHash, onClose, onSelectCommit }: BlameViewProps) {
  const { data: lines = [], isLoading } = useBlame(repoPath, filePath, commitHash)

  // Group consecutive lines with the same hash for visual blocks
  const blocks = new Map<string, { author: string; authorTime: number }>()
  for (const l of lines) {
    if (!blocks.has(l.hash)) blocks.set(l.hash, { author: l.author, authorTime: l.authorTime })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-window border-l border-border">
      <div className="h-9 border-b border-border flex items-center gap-2 px-3 shrink-0 bg-titlebar/60">
        <GitCommit className="size-3.5 text-primary shrink-0" />
        <span className="text-[12px] font-semibold truncate flex-1">Blame — {filePath.split('/').pop()}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="size-3.5" />
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center flex-1 text-muted-foreground text-[12px]">
          Loading blame…
        </div>
      )}

      {!isLoading && (
        <div className="flex-1 overflow-auto scrollbar-mac font-mono text-[11.5px] leading-[1.55]">
          <table className="w-full">
            <tbody>
              {lines.map((line, i) => {
                const prevHash = i > 0 ? lines[i - 1]?.hash : null
                const isNewBlock = line.hash !== prevHash
                const meta = blocks.get(line.hash)
                const date = meta
                  ? new Date(meta.authorTime * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                  : ''
                const color = hashColor(line.hash)

                return (
                  <tr key={i} className="group hover:bg-muted/30">
                    {/* Blame gutter */}
                    <td
                      className="select-none w-[180px] pr-2 pl-2 border-r border-border/40 align-top cursor-pointer"
                      onClick={() => onSelectCommit?.(line.hash)}
                    >
                      {isNewBlock ? (
                        <div className="flex items-center gap-1.5 py-0.5">
                          <span
                            className="size-2 rounded-full shrink-0"
                            style={{ background: color }}
                          />
                          <span className="text-[10.5px] text-foreground/80 font-mono truncate" title={meta?.author}>
                            {meta?.author}
                          </span>
                          <span className="text-[10px] text-muted-foreground/60 shrink-0 ml-auto">{date}</span>
                        </div>
                      ) : (
                        <div
                          className="w-0.5 h-full ml-1 rounded-full opacity-30"
                          style={{ background: color }}
                        />
                      )}
                    </td>
                    {/* Commit hash */}
                    <td
                      className="select-none w-[52px] text-right pr-2 text-[10.5px] text-muted-foreground/60 border-r border-border/40 cursor-pointer hover:text-primary"
                      onClick={() => onSelectCommit?.(line.hash)}
                    >
                      {isNewBlock ? line.hash.slice(0, 7) : ''}
                    </td>
                    {/* Line number */}
                    <td className="select-none w-10 text-right pr-2 text-muted-foreground/50 border-r border-border/40">
                      {line.lineNum}
                    </td>
                    {/* Code */}
                    <td className="pl-2 pr-4 whitespace-pre text-foreground/90">{line.text}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
