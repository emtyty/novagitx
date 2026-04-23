import type { GitRevision } from '@/types/git'
import { hashColor, initials } from '@/types/git'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { GitBranch, Tag, RotateCcw, SkipForward, RefreshCw, Copy, GitCommit } from 'lucide-react'

const ROW_H = 36
const LANE_W = 16
const LEFT_PAD = 14

const laneColor = (lane: number) => `hsl(var(--graph-${(lane % 6) + 1}))`

function relativeTime(unixTime: number): string {
  const s = Math.floor(Date.now() / 1000) - unixTime
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  if (s < 2592000) return `${Math.floor(s / 604800)}w`
  return `${Math.floor(s / 2592000)}mo`
}

interface CommitGraphProps {
  commits: GitRevision[]
  selectedId: string | null
  onSelect: (c: GitRevision) => void
  isLoading?: boolean
  onCreateBranchFrom?: (hash: string) => void
  onCreateTagAt?: (hash: string) => void
  onCherryPick?: (hash: string) => void
  onRevert?: (hash: string) => void
  onResetTo?: (hash: string, mode: 'soft' | 'mixed' | 'hard') => void
  onCheckoutRevision?: (hash: string) => void
}

export function CommitGraph({
  commits,
  selectedId,
  onSelect,
  isLoading,
  onCreateBranchFrom,
  onCreateTagAt,
  onCherryPick,
  onRevert,
  onResetTo,
  onCheckoutRevision,
}: CommitGraphProps) {
  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-muted-foreground text-[13px]">
        Loading commits…
      </div>
    )
  }

  const maxLanes = commits.length ? Math.max(...commits.map((c) => c.lanes.length)) : 1
  const graphW = LEFT_PAD + maxLanes * LANE_W + 8

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-mac">
      <table className="w-full text-[12px]">
        <thead className="sticky top-0 z-10 bg-window/95 backdrop-blur border-b border-border">
          <tr className="text-left text-[10.5px] uppercase tracking-wider text-muted-foreground">
            <th className="font-semibold px-2 py-2" style={{ width: graphW + 380 }}>
              Graph &amp; Message
            </th>
            <th className="font-semibold px-2 py-2 w-[180px]">Author</th>
            <th className="font-semibold px-2 py-2 w-[80px]">Date</th>
            <th className="font-semibold px-2 py-2 w-[110px]">Hash</th>
          </tr>
        </thead>
        <tbody>
          {commits.map((c, i) => {
            const next = commits[i + 1]
            const isSel = c.objectId === selectedId
            return (
              <ContextMenu key={c.objectId}>
                <ContextMenuTrigger asChild>
                  <tr
                    onClick={() => onSelect(c)}
                    className={`group cursor-pointer transition-colors ${
                      isSel ? 'bg-primary/10' : 'hover:bg-muted/60'
                    }`}
                  >
                    <td className="p-0 align-middle">
                      <div className="flex items-center">
                        <GraphCell commit={c} next={next} graphW={graphW} />
                        <Refs commit={c} />
                        <Message commit={c} />
                      </div>
                    </td>
                    <td className="px-2 py-1.5">
                      <Author commit={c} />
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground font-mono text-[11px]">
                      {relativeTime(c.authorUnixTime)}
                    </td>
                    <td className="px-2 py-1.5 text-muted-foreground/80 font-mono text-[11px]">
                      {c.objectId.slice(0, 8)}
                    </td>
                  </tr>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52">
                  <ContextMenuItem onClick={() => navigator.clipboard.writeText(c.objectId)}>
                    <Copy className="size-3.5 mr-2" />
                    Copy hash
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onCheckoutRevision?.(c.objectId)}>
                    <GitCommit className="size-3.5 mr-2" />
                    Checkout (detach HEAD)
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onCreateBranchFrom?.(c.objectId)}>
                    <GitBranch className="size-3.5 mr-2" />
                    New branch from here
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onCreateTagAt?.(c.objectId)}>
                    <Tag className="size-3.5 mr-2" />
                    Create tag here
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onCherryPick?.(c.objectId)}>
                    <SkipForward className="size-3.5 mr-2" />
                    Cherry-pick
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onRevert?.(c.objectId)}>
                    <RotateCcw className="size-3.5 mr-2" />
                    Revert commit
                  </ContextMenuItem>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger>
                      <RefreshCw className="size-3.5 mr-2" />
                      Reset to here
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent>
                      <ContextMenuItem onClick={() => onResetTo?.(c.objectId, 'soft')}>
                        Soft — keep staged
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => onResetTo?.(c.objectId, 'mixed')}>
                        Mixed — keep unstaged
                      </ContextMenuItem>
                      <ContextMenuItem
                        onClick={() => onResetTo?.(c.objectId, 'hard')}
                        className="text-destructive focus:text-destructive"
                      >
                        Hard — discard all changes
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                </ContextMenuContent>
              </ContextMenu>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function GraphCell({ commit, next, graphW }: { commit: GitRevision; next?: GitRevision; graphW: number }) {
  const cy = ROW_H / 2
  const dotX = LEFT_PAD + commit.branchLane * LANE_W

  return (
    <svg width={graphW} height={ROW_H} className="shrink-0">
      {commit.lanes.map((lane) => {
        const x = LEFT_PAD + lane * LANE_W
        const goesDown = next?.lanes.includes(lane)
        return (
          <g key={lane}>
            <line x1={x} y1={0} x2={x} y2={cy} stroke={laneColor(lane)} strokeWidth={1.75} opacity={0.85} />
            {goesDown && (
              <line x1={x} y1={cy} x2={x} y2={ROW_H} stroke={laneColor(lane)} strokeWidth={1.75} opacity={0.85} />
            )}
          </g>
        )
      })}
      {next &&
        next.lanes
          .filter((l) => !commit.lanes.includes(l))
          .map((l) => {
            const x2 = LEFT_PAD + l * LANE_W
            return (
              <path
                key={`m-${l}`}
                d={`M ${dotX} ${cy} C ${dotX} ${ROW_H}, ${x2} ${cy}, ${x2} ${ROW_H}`}
                stroke={laneColor(l)}
                strokeWidth={1.75}
                fill="none"
                opacity={0.85}
              />
            )
          })}
      <circle cx={dotX} cy={cy} r={4.5} fill={laneColor(commit.branchLane)} stroke="hsl(var(--window))" strokeWidth={2} />
    </svg>
  )
}

function Refs({ commit }: { commit: GitRevision }) {
  if (!commit.refs?.length) return null
  return (
    <div className="flex items-center gap-1 mr-2 shrink-0">
      {commit.refs.map((r) => {
        const styles = r.isHead
          ? 'bg-graph-2/15 text-[hsl(var(--graph-2))] border-graph-2/40'
          : r.type === 'head'
          ? 'bg-primary/15 text-primary border-primary/40'
          : r.type === 'remote'
          ? 'bg-graph-3/15 text-[hsl(var(--graph-3))] border-graph-3/40'
          : 'bg-graph-4/15 text-[hsl(var(--graph-4))] border-graph-4/40'
        return (
          <span
            key={r.completeName}
            className={`inline-flex items-center px-1.5 py-px rounded-[5px] border text-[10.5px] font-medium font-mono ${styles}`}
          >
            {r.name}
          </span>
        )
      })}
    </div>
  )
}

function Message({ commit }: { commit: GitRevision }) {
  return <span className="truncate text-foreground/90">{commit.subject}</span>
}

function Author({ commit }: { commit: GitRevision }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="size-5 shrink-0 rounded-full flex items-center justify-center text-[9.5px] font-bold text-white"
        style={{ background: hashColor(commit.author) }}
      >
        {initials(commit.author)}
      </span>
      <span className="truncate text-[11.5px] text-foreground/85">{commit.author}</span>
    </div>
  )
}
