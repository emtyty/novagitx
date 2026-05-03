import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Combo } from '@/lib/keys'

export interface ShortcutDef {
  id: string
  label: string
  defaultCombo: Combo
  group?: string
}

interface ShortcutStore {
  defs: Record<string, ShortcutDef>
  bindings: Record<string, Combo>
  register: (def: ShortcutDef) => void
  rebind: (id: string, combo: Combo) => string | null
  reset: (id: string) => void
  resetAll: () => void
}

export const useShortcutStore = create<ShortcutStore>()(
  persist(
    (set, get) => ({
      defs: {},
      bindings: {},
      register: (def) =>
        set((s) => {
          const cur = s.defs[def.id]
          if (
            cur &&
            cur.defaultCombo === def.defaultCombo &&
            cur.label === def.label &&
            cur.group === def.group
          ) {
            return s
          }
          return { defs: { ...s.defs, [def.id]: def } }
        }),
      rebind: (id, combo) => {
        const { defs, bindings } = get()
        const conflict = Object.entries({
          ...Object.fromEntries(Object.values(defs).map((d) => [d.id, d.defaultCombo])),
          ...bindings,
        }).find(([k, v]) => k !== id && v === combo)?.[0]
        if (conflict) return conflict
        set({ bindings: { ...bindings, [id]: combo } })
        return null
      },
      reset: (id) =>
        set((s) => {
          const next = { ...s.bindings }
          delete next[id]
          return { bindings: next }
        }),
      resetAll: () => set({ bindings: {} }),
    }),
    {
      name: 'novagitx.shortcuts',
      partialize: (s) => ({ bindings: s.bindings }),
    },
  ),
)

export function getCombo(id: string): Combo | undefined {
  const s = useShortcutStore.getState()
  return s.bindings[id] ?? s.defs[id]?.defaultCombo
}
