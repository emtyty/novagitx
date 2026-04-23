import { useState } from 'react'
import { Cloud, Plus, Trash2, Pencil, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRemotes, useRemoteMutationsCRUD } from '@/hooks/useRepo'
import type { Remote } from '@/types/git'

interface RemotesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repoPath: string | null
}

export function RemotesDialog({ open, onOpenChange, repoPath }: RemotesDialogProps) {
  const { data: remotes = [], isLoading } = useRemotes(repoPath)
  const { add, remove, rename, prune } = useRemoteMutationsCRUD(repoPath)
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [editingRemote, setEditingRemote] = useState<Remote | null>(null)
  const [editName, setEditName] = useState('')

  function handleAdd() {
    if (!newName.trim() || !newUrl.trim()) return
    add.mutate({ name: newName.trim(), url: newUrl.trim() }, {
      onSuccess: () => { setNewName(''); setNewUrl(''); setAddingNew(false) },
    })
  }

  function handleRename() {
    if (!editingRemote || !editName.trim()) return
    rename.mutate({ oldName: editingRemote.name, newName: editName.trim() }, {
      onSuccess: () => setEditingRemote(null),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="size-4 text-primary" />
            Manage Remotes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {isLoading && (
            <div className="text-[12px] text-muted-foreground py-4 text-center">Loading remotes…</div>
          )}

          {remotes.map((remote) => (
            <div key={remote.name} className="rounded-md border border-border bg-muted/30 overflow-hidden">
              {editingRemote?.name === remote.name ? (
                <div className="flex items-center gap-2 px-3 py-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingRemote(null) }}
                    className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-[12px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
                    placeholder="New remote name"
                  />
                  <button
                    onClick={handleRename}
                    disabled={rename.isPending}
                    className="text-[11px] px-2.5 h-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                  >
                    {rename.isPending ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingRemote(null)} className="text-[11px] px-2 h-7 text-muted-foreground hover:text-foreground">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2">
                  <Cloud className="size-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[12.5px] font-semibold font-mono text-foreground">{remote.name}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-muted-foreground font-mono truncate">{remote.fetchUrl}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => { setEditingRemote(remote); setEditName(remote.name) }}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Rename"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      onClick={() => prune.mutate(remote.name)}
                      disabled={prune.isPending}
                      className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                      title="Prune stale remote-tracking branches"
                    >
                      <RefreshCw className="size-3" />
                    </button>
                    <button
                      onClick={() => remove.mutate(remote.name)}
                      disabled={remove.isPending}
                      className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                      title="Remove remote"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {remotes.length === 0 && !isLoading && (
            <p className="text-[12px] text-muted-foreground text-center py-4">No remotes configured</p>
          )}

          {/* Add new remote */}
          {addingNew ? (
            <div className="rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
              <div className="text-[11.5px] font-semibold text-primary">Add remote</div>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Name (e.g. origin)"
                  className="w-28 h-7 rounded-md border border-border bg-background px-2 text-[12px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
                />
                <input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAddingNew(false) }}
                  placeholder="URL"
                  className="flex-1 h-7 rounded-md border border-border bg-background px-2 text-[12px] font-mono outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              {add.isError && (
                <p className="text-[11px] text-destructive">{String((add.error as any)?.message ?? 'Failed')}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim() || !newUrl.trim() || add.isPending}
                  className="text-[11px] px-3 h-7 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 font-medium"
                >
                  {add.isPending ? 'Adding…' : 'Add'}
                </button>
                <button onClick={() => setAddingNew(false)} className="text-[11px] px-2 h-7 text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="w-full flex items-center gap-1.5 px-3 py-2 rounded-md border border-dashed border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
            >
              <Plus className="size-3.5" />
              Add remote
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
