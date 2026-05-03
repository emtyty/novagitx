import { useEffect } from 'react'
import { useShortcutStore, getCombo, type ShortcutDef } from '@/store/shortcutStore'
import { eventToCombo, isEditableTarget } from '@/lib/keys'

interface Entry {
  handler: () => void
  allowInEditable?: boolean
}

const handlers = new Map<string, Entry>()

export function useShortcut(
  def: ShortcutDef,
  handler: () => void,
  options: { enabled?: boolean; allowInEditable?: boolean } = {},
) {
  const register = useShortcutStore((s) => s.register)
  const enabled = options.enabled ?? true

  useEffect(() => {
    register(def)
  }, [def.id, def.label, def.defaultCombo, def.group, register])

  useEffect(() => {
    if (!enabled) return
    handlers.set(def.id, { handler, allowInEditable: options.allowInEditable })
    return () => {
      const cur = handlers.get(def.id)
      if (cur?.handler === handler) handlers.delete(def.id)
    }
  }, [def.id, handler, enabled, options.allowInEditable])
}

export function installGlobalShortcuts() {
  const onKey = (e: KeyboardEvent) => {
    const combo = eventToCombo(e)
    if (!combo) return
    const editable = isEditableTarget(e.target)
    const hasMod = combo.includes('Mod') || combo.includes('Alt') || /^F\d/.test(combo)

    for (const [id, entry] of handlers) {
      if (getCombo(id) !== combo) continue
      if (editable && !entry.allowInEditable && !hasMod) continue
      e.preventDefault()
      entry.handler()
      return
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}
