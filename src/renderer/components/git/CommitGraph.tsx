import { useRef, useState, useEffect, memo } from 'react'
import type { GitRevision, GitRef } from '@/types/git'
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

const ROW_H = 40
const LANE_W = 16
const LEFT_PAD = 14
const OVERSCAN = 8

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const viewportHRef = useRef(600)
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    viewportHRef.current = el.clientHeight
    const onScroll = () => forceUpdate((n) => n + 1)
    const ro = new ResizeObserver(() => {
      viewportHRef.current = el.clientHeight
      forceUpdate((n) => n + 1)
    })
    el.addEventListener('scroll', onScroll, { passive: true })
    ro.observe(el)
    return () => { el.removeEventListener('scroll', onScroll); ro.disconnect() }
  }, [])

  // Read directly from DOM so the window is always in sync with the scroll position
  const scrollTop = scrollRef.current?.scrollTop ?? 0
  const viewportH = viewportHRef.current

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center text-muted-foreground text-[13px]">
        Loading commits…
      </div>
    )
  }

  const maxLanes = commits.reduce((m, c) => Math.max(m, c.lanes.length), 1)
  const graphW = LEFT_PAD + maxLanes * LANE_W + 8

  const startIdx = Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN)
  const visibleCount = Math.ceil(viewportH / ROW_H) + OVERSCAN * 2
  const endIdx = Math.min(commits.length, startIdx + visibleCount)
  const paddingTop = startIdx * ROW_H
  const paddingBottom = Math.max(0, (commits.length - endIdx) * ROW_H)
  const visibleCommits = commits.slice(startIdx, endIdx)

  return (
    <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scrollbar-mac">
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
          {paddingTop > 0 && (
            <tr aria-hidden><td colSpan={4} style={{ height: paddingTop, padding: 0 }} /></tr>
          )}

          {visibleCommits.map((c, i) => (
            <CommitRow
              key={c.objectId}
              commit={c}
              next={commits[startIdx + i + 1]}
              graphW={graphW}
              isSel={c.objectId === selectedId}
              onSelect={onSelect}
              onCheckoutRevision={onCheckoutRevision}
              onCreateBranchFrom={onCreateBranchFrom}
              onCreateTagAt={onCreateTagAt}
              onCherryPick={onCherryPick}
              onRevert={onRevert}
              onResetTo={onResetTo}
            />
          ))}

          {paddingBottom > 0 && (
            <tr aria-hidden><td colSpan={4} style={{ height: paddingBottom, padding: 0 }} /></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

interface RowProps {
  commit: GitRevision
  next?: GitRevision
  graphW: number
  isSel: boolean
  onSelect: (c: GitRevision) => void
  onCheckoutRevision?: (hash: string) => void
  onCreateBranchFrom?: (hash: string) => void
  onCreateTagAt?: (hash: string) => void
  onCherryPick?: (hash: string) => void
  onRevert?: (hash: string) => void
  onResetTo?: (hash: string, mode: 'soft' | 'mixed' | 'hard') => void
}

const CommitRow = memo(function CommitRow({
  commit: c,
  next,
  graphW,
  isSel,
  onSelect,
  onCheckoutRevision,
  onCreateBranchFrom,
  onCreateTagAt,
  onCherryPick,
  onRevert,
  onResetTo,
}: RowProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <tr
          onClick={() => onSelect(c)}
          className={`group cursor-pointer transition-colors ${isSel ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
        >
          <td className="p-0 align-middle">
            <div className="flex items-center">
              <GraphCell commit={c} next={next} graphW={graphW} />
              <Refs refs={c.refs} />
              <span className="truncate text-foreground/90">{c.subject}</span>
            </div>
          </td>
          <td className="px-2 py-1.5">
            <Author author={c.author} />
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
            <ContextMenuItem onClick={() => onResetTo?.(c.objectId, 'soft')}>Soft — keep staged</ContextMenuItem>
            <ContextMenuItem onClick={() => onResetTo?.(c.objectId, 'mixed')}>Mixed — keep unstaged</ContextMenuItem>
            <ContextMenuItem onClick={() => onResetTo?.(c.objectId, 'hard')} className="text-destructive focus:text-destructive">
              Hard — discard all changes
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  )
})

const REF_STYLES: Record<string, string> = {
  isHead:  'bg-graph-2/15 text-[hsl(var(--graph-2))] border-graph-2/40',
  head:    'bg-primary/15 text-primary border-primary/40',
  remote:  'bg-graph-3/15 text-[hsl(var(--graph-3))] border-graph-3/40',
  tag:     'bg-graph-4/15 text-[hsl(var(--graph-4))] border-graph-4/40',
}

const Refs = memo(function Refs({ refs }: { refs: GitRef[] | undefined }) {
  if (!refs?.length) return null
  return (
    <div className="flex items-center gap-1 mr-2 shrink-0">
      {refs.map((r) => {
        const styleKey = r.isHead ? 'isHead' : r.type
        return (
          <span
            key={r.completeName}
            className={`inline-flex items-center px-1.5 py-px rounded-[5px] border text-[10.5px] font-medium font-mono ${REF_STYLES[styleKey] ?? REF_STYLES.tag}`}
          >
            {r.name}
          </span>
        )
      })}
    </div>
  )
})

const Author = memo(function Author({ author }: { author: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className="size-5 shrink-0 rounded-full flex items-center justify-center text-[9.5px] font-bold text-white"
        style={{ background: hashColor(author) }}
      >
        {initials(author)}
      </span>
      <span className="truncate text-[11.5px] text-foreground/85">{author}</span>
    </div>
  )
})

const GraphCell = memo(function GraphCell({ commit, next, graphW }: { commit: GitRevision; next?: GitRevision; graphW: number }) {
  const cy = ROW_H / 2
  const dotX = LEFT_PAD + commit.branchLane * LANE_W
  const nextLanes = next ? new Set(next.lanes) : null
  const commitLanes = new Set(commit.lanes)

  return (
    <svg width={graphW} height={ROW_H} className="shrink-0">
      {commit.lanes.map((lane) => {
        const x = LEFT_PAD + lane * LANE_W
        const goesDown = nextLanes?.has(lane) ?? false
        return (
          <g key={lane}>
            <line x1={x} y1={0} x2={x} y2={cy} stroke={laneColor(lane)} strokeWidth={1.75} opacity={0.85} />
            {goesDown && (
              <line x1={x} y1={cy} x2={x} y2={ROW_H} stroke={laneColor(lane)} strokeWidth={1.75} opacity={0.85} />
            )}
          </g>
        )
      })}
      {nextLanes &&
        [...nextLanes]
          .filter((l) => !commitLanes.has(l))
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
})
