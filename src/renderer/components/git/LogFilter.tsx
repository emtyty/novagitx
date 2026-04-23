import { useState, useEffect, useRef } from 'react'
import { Search, X, GitBranch } from 'lucide-react'
import type { LogOptions } from '@/types/git'

interface LogFilterProps {
  value: LogOptions
  onChange: (opts: LogOptions) => void
}

export function LogFilter({ value, onChange }: LogFilterProps) {
  const [author, setAuthor] = useState(value.author ?? '')
  const [grep, setGrep] = useState(value.grep ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onChange({
        ...value,
        author: author.trim() || undefined,
        grep: grep.trim() || undefined,
      })
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [author, grep])

  function toggleCurrentBranch() {
    onChange({ ...value, onlyCurrentBranch: !value.onlyCurrentBranch })
  }

  function clearAll() {
    setAuthor('')
    setGrep('')
    onChange({ onlyCurrentBranch: value.onlyCurrentBranch })
  }

  const hasFilter = author.trim() || grep.trim()

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border bg-titlebar/40">
      <Search className="size-3.5 text-muted-foreground shrink-0" />

      <input
        value={grep}
        onChange={(e) => setGrep(e.target.value)}
        placeholder="Filter message…"
        className="h-6 flex-1 min-w-0 bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 outline-none"
      />

      <input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author…"
        className="h-6 w-[110px] bg-transparent text-[11.5px] text-foreground placeholder:text-muted-foreground/60 outline-none border-l border-border pl-2"
      />

      <button
        onClick={toggleCurrentBranch}
        title="Current branch only"
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors ${
          value.onlyCurrentBranch
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-muted'
        }`}
      >
        <GitBranch className="size-3" />
        <span>This branch</span>
      </button>

      {hasFilter && (
        <button
          onClick={clearAll}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Clear filters"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
