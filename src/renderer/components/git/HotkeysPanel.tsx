import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Keyboard } from 'lucide-react'
import { useShortcutStore } from '@/store/shortcutStore'
import { eventToCombo, formatCombo } from '@/lib/keys'

export function HotkeysPanel() {
  const defs = useShortcutStore((s) => s.defs)
  const bindings = useShortcutStore((s) => s.bindings)
  const rebind = useShortcutStore((s) => s.rebind)
  const reset = useShortcutStore((s) => s.reset)
  const resetAll = useShortcutStore((s) => s.resetAll)

  const [recording, setRecording] = useState<string | null>(null)
  const [conflict, setConflict] = useState<string>('')

  const groups = useMemo(() => {
    const out: Record<string, typeof defs[string][]> = {}
    for (const d of Object.values(defs)) {
      const g = d.group ?? 'General'
      ;(out[g] ||= []).push(d)
    }
    for (const g of Object.values(out)) g.sort((a, b) => a.label.localeCompare(b.label))
    return Object.entries(out).sort(([a], [b]) => a.localeCompare(b))
  }, [defs])

  useEffect(() => {
    if (!recording) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setRecording(null)
        return
      }
      const combo = eventToCombo(e)
      if (!combo) return
      e.preventDefault()
      e.stopPropagation()
      const c = rebind(recording, combo)
      if (c) {
        setConflict(`Conflict with "${defs[c]?.label ?? c}" — choose a different combo`)
      } else {
        setConflict('')
        setRecording(null)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [recording, rebind, defs])

  if (Object.keys(defs).length === 0) {
    return (
      <div className="p-4 text-[12px] text-muted-foreground">
        <Keyboard className="size-4 inline mr-1.5 -mt-0.5" />
        No shortcuts have been registered yet. Open the main window once and they'll appear here.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">
          Click a combo to rebind. Press <kbd className="font-mono">Esc</kbd> to cancel.
        </span>
        <button onClick={resetAll}
          className="flex items-center gap-1 h-7 px-3 rounded text-[11.5px] text-muted-foreground hover:bg-muted">
          <RotateCcw className="size-3" />Reset all
        </button>
      </div>

      {conflict && (
        <div className="text-[11px] text-destructive bg-destructive/10 border border-destructive/30 rounded px-3 py-1.5">
          {conflict}
        </div>
      )}

      <div className="border border-border rounded-md max-h-[420px] overflow-y-auto scrollbar-mac">
        {groups.map(([group, list]) => (
          <div key={group}>
            <div className="px-3 py-1.5 text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/40 border-b border-border">
              {group}
            </div>
            {list.map((d) => {
              const current = bindings[d.id] ?? d.defaultCombo
              const isOverride = bindings[d.id] && bindings[d.id] !== d.defaultCombo
              const isRec = recording === d.id
              return (
                <div key={d.id} className="flex items-center gap-2 px-3 py-2 border-b border-border/50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] truncate">{d.label}</div>
                    <div className="text-[10.5px] text-muted-foreground font-mono truncate">{d.id}</div>
                  </div>
                  <button
                    onClick={() => { setConflict(''); setRecording(isRec ? null : d.id) }}
                    className={`min-w-[110px] h-7 px-2 rounded text-[11.5px] font-mono border transition-colors ${
                      isRec
                        ? 'bg-primary/15 border-primary text-primary'
                        : isOverride
                          ? 'bg-background/40 border-primary/40 text-primary hover:bg-primary/10'
                          : 'bg-background/40 border-border/60 hover:bg-muted'
                    }`}>
                    {isRec ? 'Press keys…' : formatCombo(current)}
                  </button>
                  {isOverride && (
                    <button onClick={() => reset(d.id)} title="Reset to default"
                      className="h-7 w-7 grid place-items-center rounded text-muted-foreground hover:bg-muted">
                      <RotateCcw className="size-3" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
