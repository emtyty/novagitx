import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { useGitignore, useGitattributes, useGitignoreMutations, useGitattributesMutations } from '@/hooks/useRepo'

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  repoPath: string | null
  file: 'gitignore' | 'gitattributes'
}

export function GitignoreEditor({ open, onOpenChange, repoPath, file }: Props) {
  const [content, setContent] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: gitignoreContent } = useGitignore(file === 'gitignore' ? repoPath : null)
  const { data: gitattributesContent } = useGitattributes(file === 'gitattributes' ? repoPath : null)
  const gitignoreMutations = useGitignoreMutations(repoPath)
  const gitattributesMutation = useGitattributesMutations(repoPath)

  const sourceContent = file === 'gitignore' ? gitignoreContent : gitattributesContent

  useEffect(() => {
    if (sourceContent !== undefined) setContent(sourceContent)
  }, [sourceContent])

  useEffect(() => {
    if (open) { setSaved(false); setError(null) }
  }, [open])

  const title = file === 'gitignore' ? '.gitignore' : '.gitattributes'

  async function handleSave() {
    setError(null)
    try {
      if (file === 'gitignore') {
        await gitignoreMutations.write.mutateAsync(content)
      } else {
        await gitattributesMutation.mutateAsync(content)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) { setError(e?.message) }
  }

  const isPending = file === 'gitignore'
    ? gitignoreMutations.write.isPending
    : gitattributesMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] h-[480px] flex flex-col gap-0 p-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-[14px]">
            <FileText className="size-4" />
            Edit {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 p-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            spellCheck={false}
            className="w-full h-full resize-none rounded-md border border-border bg-background px-3 py-2 text-[12.5px] font-mono outline-none focus:ring-1 focus:ring-primary/50 leading-relaxed"
            placeholder={file === 'gitignore' ? '# Patterns to ignore\nnode_modules/\n*.log' : '# Git attributes\n*.pb binary'}
          />
        </div>

        {error && <p className="px-4 pb-1 text-[12px] text-destructive">{error}</p>}

        <DialogFooter className="px-4 pb-4 pt-2 border-t border-border">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 rounded-md text-[12px] text-muted-foreground hover:bg-muted transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-[12px] font-medium hover:bg-primary/90 disabled:opacity-40"
          >
            {isPending ? 'Saving…' : saved ? 'Saved!' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
