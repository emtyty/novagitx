import { Search, GitBranch, GitMerge, GitPullRequest, ArrowDownToLine, ArrowUpFromLine, RotateCw, Plus, Settings2, Sun, Moon, Monitor } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeContext } from '@/App'
import type { ThemeMode } from '@/hooks/useTheme'

interface TitleBarProps {
  repoName: string
  repoPath: string
  currentBranch: string | null
  onOpenPalette: () => void
  onFetch?: () => void
  onPull?: () => void
  onPush?: () => void
  onOpenRepo?: () => void
  onCloneRepo?: () => void
  onInitRepo?: () => void
  isFetching?: boolean
  isPulling?: boolean
  isPushing?: boolean
}

export function TitleBar({
  repoName,
  repoPath,
  currentBranch,
  onOpenPalette,
  onFetch,
  onPull,
  onPush,
  onOpenRepo,
  onCloneRepo,
  onInitRepo,
  isFetching,
  isPulling,
  isPushing,
}: TitleBarProps) {
  const displayPath = repoPath.replace(/^\/Users\/[^/]+/, '~')

  return (
    <div className="titlebar-vibrancy flex h-11 items-center gap-3 border-b border-titlebar-border pl-[80px] pr-3 select-none">
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80">
        <GitBranch className="size-3.5 text-primary" />
        {repoName}
      </div>
      <span className="text-muted-foreground/60 text-xs">—</span>
      <span className="text-[12px] text-muted-foreground font-mono truncate max-w-[200px]">
        {displayPath}
      </span>
      {currentBranch && (
        <span className="text-[11px] text-primary font-mono bg-primary/10 px-1.5 py-0.5 rounded-md">
          {currentBranch}
        </span>
      )}

      <button
        onClick={onOpenPalette}
        className="ml-auto mr-auto hidden md:flex items-center gap-2 h-7 w-[360px] rounded-md bg-background/60 hover:bg-background border border-border/70 px-2.5 text-[12px] text-muted-foreground transition-colors"
      >
        <Search className="size-3.5" />
        <span className="truncate">Search commits, branches, files…</span>
        <span className="ml-auto flex items-center gap-1 text-[10.5px] text-muted-foreground/80">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono">⌘</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono">K</kbd>
        </span>
      </button>

      <div className="ml-auto md:ml-0 flex items-center gap-1">
        <ToolbarButton icon={ArrowDownToLine} label="Pull" loading={isPulling} onClick={onPull} />
        <ToolbarButton icon={ArrowUpFromLine} label="Push" loading={isPushing} onClick={onPush} />
        <ToolbarButton icon={RotateCw} label="Fetch" loading={isFetching} onClick={onFetch} />
        <Divider />
        <ToolbarButton icon={GitBranch} label="Branch" />
        <ToolbarButton icon={GitMerge} label="Merge" />
        <ToolbarButton icon={GitPullRequest} label="PR" />
        <Divider />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex items-center gap-1.5 h-7 px-2 rounded-md text-[12px] text-foreground/80 hover:bg-background/70 active:bg-background transition-colors">
              <Plus className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpenRepo}>Open repository…</DropdownMenuItem>
            <DropdownMenuItem onClick={onCloneRepo}>Clone repository…</DropdownMenuItem>
            <DropdownMenuItem onClick={onInitRepo}>New repository…</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <ToolbarButton icon={Settings2} label="" />
      </div>
    </div>
  )
}

const THEME_CYCLE: ThemeMode[] = ['light', 'dark', 'system']
const THEME_ICONS: Record<ThemeMode, typeof Sun> = { light: Sun, dark: Moon, system: Monitor }
const THEME_LABELS: Record<ThemeMode, string> = { light: 'Light', dark: 'Dark', system: 'System' }

function ThemeToggle() {
  const { mode, setMode } = useThemeContext()
  const Icon = THEME_ICONS[mode]
  const next = THEME_CYCLE[(THEME_CYCLE.indexOf(mode) + 1) % THEME_CYCLE.length]
  return (
    <button
      onClick={() => setMode(next)}
      title={`Theme: ${THEME_LABELS[mode]} — click for ${THEME_LABELS[next]}`}
      className="relative flex items-center gap-1.5 h-7 px-2 rounded-md text-[12px] text-foreground/80 hover:bg-background/70 active:bg-background transition-colors"
    >
      <Icon className="size-3.5" />
    </button>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  badge,
  loading,
  onClick,
}: {
  icon: any
  label: string
  badge?: string
  loading?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="relative flex items-center gap-1.5 h-7 px-2 rounded-md text-[12px] text-foreground/80 hover:bg-background/70 active:bg-background transition-colors disabled:opacity-50"
    >
      <Icon className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
      {label && <span className="hidden lg:inline">{label}</span>}
      {badge && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  )
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-border" />
}
