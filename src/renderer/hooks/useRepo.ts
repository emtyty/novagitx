import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gitApi } from '@/api/git'
import type { LogOptions } from '@/types/git'
// LogOptions re-exported for use in hook signatures

export function useLog(repoPath: string | null, opts?: LogOptions) {
  return useQuery({
    queryKey: ['log', repoPath, opts],
    queryFn: () => gitApi.getLog(repoPath!, opts),
    enabled: !!repoPath,
    staleTime: 5_000,
  })
}

export function useRefs(repoPath: string | null) {
  return useQuery({
    queryKey: ['refs', repoPath],
    queryFn: () => gitApi.getRefs(repoPath!),
    enabled: !!repoPath,
    staleTime: 5_000,
  })
}

export function useStatus(repoPath: string | null) {
  return useQuery({
    queryKey: ['status', repoPath],
    queryFn: () => gitApi.getStatus(repoPath!),
    enabled: !!repoPath,
    refetchInterval: 3_000,
  })
}

export function useDiff(repoPath: string | null, commitHash: string | null) {
  return useQuery({
    queryKey: ['diff', repoPath, commitHash],
    queryFn: () => gitApi.getDiffCommit(repoPath!, commitHash!),
    enabled: !!repoPath && !!commitHash,
    staleTime: 30_000,
  })
}

export function useFileDiff(repoPath: string | null, commitHash: string | null, filePath: string | null) {
  return useQuery({
    queryKey: ['fileDiff', repoPath, commitHash, filePath],
    queryFn: () => gitApi.getDiffFile(repoPath!, commitHash!, filePath!),
    enabled: !!repoPath && !!commitHash && !!filePath,
    staleTime: 30_000,
  })
}

export function useBranchMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  const checkout = useMutation({
    mutationFn: (branchName: string) => gitApi.checkoutBranch(repoPath!, branchName),
    onSuccess: invalidate,
  })

  const create = useMutation({
    mutationFn: ({ name, from }: { name: string; from?: string }) =>
      gitApi.createBranch(repoPath!, name, from),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: ({ name, force }: { name: string; force?: boolean }) =>
      gitApi.deleteBranch(repoPath!, name, force),
    onSuccess: invalidate,
  })

  const rename = useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      gitApi.renameBranch(repoPath!, oldName, newName),
    onSuccess: invalidate,
  })

  return { checkout, create, remove, rename }
}

export function useRemoteMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
  }

  const fetch = useMutation({
    mutationFn: (remote?: string) => gitApi.fetch(repoPath!, remote),
    onSuccess: invalidate,
  })

  const pull = useMutation({
    mutationFn: ({ remote, branch }: { remote: string; branch: string }) =>
      gitApi.pull(repoPath!, remote, branch),
    onSuccess: invalidate,
  })

  const push = useMutation({
    mutationFn: ({ remote, branch, force }: { remote: string; branch: string; force?: boolean }) =>
      gitApi.push(repoPath!, remote, branch, force),
    onSuccess: invalidate,
  })

  return { fetch, pull, push }
}

export function useCommitMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  const stage = useMutation({
    mutationFn: (filePath: string) => gitApi.stageFile(repoPath!, filePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['status', repoPath] }),
  })

  const unstage = useMutation({
    mutationFn: (filePath: string) => gitApi.unstageFile(repoPath!, filePath),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['status', repoPath] }),
  })

  const commit = useMutation({
    mutationFn: (message: string) => gitApi.createCommit(repoPath!, message),
    onSuccess: invalidate,
  })

  return { stage, unstage, commit }
}

export function useWorkingDiff(repoPath: string | null, filePath?: string | null) {
  return useQuery({
    queryKey: ['diff:working', repoPath, filePath],
    queryFn: () => gitApi.getDiffWorking(repoPath!, filePath ?? undefined),
    enabled: !!repoPath,
    staleTime: 0,
    refetchInterval: 3_000,
  })
}

export function useStagedDiff(repoPath: string | null, filePath?: string | null) {
  return useQuery({
    queryKey: ['diff:staged', repoPath, filePath],
    queryFn: () => gitApi.getDiffStaged(repoPath!, filePath ?? undefined),
    enabled: !!repoPath,
    staleTime: 0,
    refetchInterval: 3_000,
  })
}

export function useCommitMutationsExtra(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
    qc.invalidateQueries({ queryKey: ['diff:working', repoPath] })
    qc.invalidateQueries({ queryKey: ['diff:staged', repoPath] })
  }

  const discard = useMutation({
    mutationFn: (filePath: string) => gitApi.discardFile(repoPath!, filePath),
    onSuccess: invalidate,
  })

  const amend = useMutation({
    mutationFn: (message?: string) => gitApi.amendCommit(repoPath!, message),
    onSuccess: invalidate,
  })

  return { discard, amend }
}

export function useCommitGraphMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  const revert = useMutation({
    mutationFn: (hash: string) => gitApi.revertCommit(repoPath!, hash),
    onSuccess: invalidate,
  })

  const reset = useMutation({
    mutationFn: ({ hash, mode }: { hash: string; mode: 'soft' | 'mixed' | 'hard' }) =>
      gitApi.resetToCommit(repoPath!, hash, mode),
    onSuccess: invalidate,
  })

  const cherryPick = useMutation({
    mutationFn: (hash: string) => gitApi.cherryPick(repoPath!, hash),
    onSuccess: invalidate,
  })

  return { revert, reset, cherryPick }
}

export function useBranchMerge(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  return useMutation({
    mutationFn: ({ branch, strategy }: { branch: string; strategy?: string }) =>
      gitApi.mergeBranch(repoPath!, branch, strategy),
    onSuccess: invalidate,
  })
}

export function useTagMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidateRefs = () => qc.invalidateQueries({ queryKey: ['refs', repoPath] })

  const create = useMutation({
    mutationFn: ({ name, hash, message }: { name: string; hash?: string; message?: string }) =>
      gitApi.createTag(repoPath!, name, hash, message),
    onSuccess: invalidateRefs,
  })

  const remove = useMutation({
    mutationFn: (name: string) => gitApi.deleteTag(repoPath!, name),
    onSuccess: invalidateRefs,
  })

  const push = useMutation({
    mutationFn: ({ remote, name }: { remote: string; name: string }) =>
      gitApi.pushTag(repoPath!, remote, name),
  })

  return { create, remove, push }
}

export function useFileHistory(repoPath: string | null, filePath: string | null) {
  return useQuery({
    queryKey: ['fileHistory', repoPath, filePath],
    queryFn: () => gitApi.getFileHistory(repoPath!, filePath!),
    enabled: !!repoPath && !!filePath,
    staleTime: 10_000,
  })
}

export function useReflog(repoPath: string | null) {
  return useQuery({
    queryKey: ['reflog', repoPath],
    queryFn: () => gitApi.getReflog(repoPath!),
    enabled: !!repoPath,
    staleTime: 5_000,
  })
}

export function useBlame(repoPath: string | null, filePath: string | null, commitHash?: string | null) {
  return useQuery({
    queryKey: ['blame', repoPath, filePath, commitHash],
    queryFn: () => gitApi.getBlame(repoPath!, filePath!, commitHash ?? undefined),
    enabled: !!repoPath && !!filePath,
    staleTime: 30_000,
  })
}

export function useRemotes(repoPath: string | null) {
  return useQuery({
    queryKey: ['remotes', repoPath],
    queryFn: () => gitApi.getRemotes(repoPath!),
    enabled: !!repoPath,
    staleTime: 10_000,
  })
}

export function useRemoteMutationsCRUD(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['remotes', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
  }

  const add = useMutation({
    mutationFn: ({ name, url }: { name: string; url: string }) => gitApi.addRemote(repoPath!, name, url),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (name: string) => gitApi.removeRemote(repoPath!, name),
    onSuccess: invalidate,
  })

  const rename = useMutation({
    mutationFn: ({ oldName, newName }: { oldName: string; newName: string }) =>
      gitApi.renameRemote(repoPath!, oldName, newName),
    onSuccess: invalidate,
  })

  const prune = useMutation({
    mutationFn: (name: string) => gitApi.pruneRemote(repoPath!, name),
    onSuccess: invalidate,
  })

  return { add, remove, rename, prune }
}

export function useRebaseMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  const rebase = useMutation({
    mutationFn: (onto: string) => gitApi.rebase(repoPath!, onto),
    onSuccess: invalidate,
  })

  const abort = useMutation({
    mutationFn: () => gitApi.abortRebase(repoPath!),
    onSuccess: invalidate,
  })

  return { rebase, abort }
}

export function useConflicts(repoPath: string | null) {
  return useQuery({
    queryKey: ['conflicts', repoPath],
    queryFn: () => gitApi.getConflicts(repoPath!),
    enabled: !!repoPath,
    staleTime: 2_000,
    refetchInterval: 3_000,
  })
}

export function useConflictMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['conflicts', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
    qc.invalidateQueries({ queryKey: ['diff:working', repoPath] })
    qc.invalidateQueries({ queryKey: ['diff:staged', repoPath] })
  }

  return useMutation({
    mutationFn: ({ filePath, strategy }: { filePath: string; strategy: 'ours' | 'theirs' }) =>
      gitApi.resolveConflict(repoPath!, filePath, strategy),
    onSuccess: invalidate,
  })
}

export function useHunkMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
    qc.invalidateQueries({ queryKey: ['diff:working', repoPath] })
    qc.invalidateQueries({ queryKey: ['diff:staged', repoPath] })
  }

  const stageHunk = useMutation({
    mutationFn: (patch: string) => gitApi.stageHunk(repoPath!, patch),
    onSuccess: invalidate,
  })

  const unstageHunk = useMutation({
    mutationFn: (patch: string) => gitApi.unstageHunk(repoPath!, patch),
    onSuccess: invalidate,
  })

  return { stageHunk, unstageHunk }
}

export function useStashMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  const save = useMutation({
    mutationFn: (message?: string) => gitApi.stashSave(repoPath!, message),
    onSuccess: invalidateAll,
  })

  const apply = useMutation({
    mutationFn: (ref: string) => gitApi.stashApply(repoPath!, ref),
    onSuccess: invalidateAll,
  })

  const drop = useMutation({
    mutationFn: (ref: string) => gitApi.stashDrop(repoPath!, ref),
    onSuccess: invalidateAll,
  })

  return { save, apply, drop }
}

// ── Tier 2 hooks ──────────────────────────────────────────────────────────────

export function useStashList(repoPath: string | null) {
  return useQuery({
    queryKey: ['stashList', repoPath],
    queryFn: () => gitApi.listStashes(repoPath!),
    enabled: !!repoPath,
    staleTime: 3_000,
    refetchInterval: 5_000,
  })
}

export function useStashDiff(repoPath: string | null, ref: string | null) {
  return useQuery({
    queryKey: ['stashDiff', repoPath, ref],
    queryFn: () => gitApi.getStashDiff(repoPath!, ref!),
    enabled: !!repoPath && !!ref,
    staleTime: 30_000,
  })
}

export function useStashExtras(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
    qc.invalidateQueries({ queryKey: ['stashList', repoPath] })
  }

  const pop = useMutation({
    mutationFn: (ref?: string) => gitApi.stashPop(repoPath!, ref),
    onSuccess: invalidateAll,
  })

  const saveFlags = useMutation({
    mutationFn: ({ message, includeUntracked, all }: { message?: string; includeUntracked?: boolean; all?: boolean }) =>
      gitApi.stashSaveFlags(repoPath!, message, includeUntracked, all),
    onSuccess: invalidateAll,
  })

  return { pop, saveFlags }
}

export function useCompareDiff(repoPath: string | null, ref1: string | null, ref2: string | null, filePath?: string | null) {
  return useQuery({
    queryKey: ['compareDiff', repoPath, ref1, ref2, filePath],
    queryFn: () => gitApi.compareDiff(repoPath!, ref1!, ref2!, filePath ?? undefined),
    enabled: !!repoPath && !!ref1 && !!ref2,
    staleTime: 30_000,
  })
}

export function useBranchExtras(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
    qc.invalidateQueries({ queryKey: ['status', repoPath] })
  }

  const setUpstream = useMutation({
    mutationFn: ({ branch, upstream }: { branch: string; upstream: string }) =>
      gitApi.setUpstream(repoPath!, branch, upstream),
    onSuccess: invalidate,
  })

  const checkoutRemote = useMutation({
    mutationFn: ({ remoteBranch, localName }: { remoteBranch: string; localName?: string }) =>
      gitApi.checkoutRemoteBranch(repoPath!, remoteBranch, localName),
    onSuccess: invalidate,
  })

  const checkoutRevision = useMutation({
    mutationFn: (hash: string) => gitApi.checkoutRevision(repoPath!, hash),
    onSuccess: invalidate,
  })

  return { setUpstream, checkoutRemote, checkoutRevision }
}

export function useRebaseCommits(repoPath: string | null, base: string | null) {
  return useQuery({
    queryKey: ['rebaseCommits', repoPath, base],
    queryFn: () => gitApi.getRebaseCommits(repoPath!, base!),
    enabled: !!repoPath && !!base,
    staleTime: 10_000,
  })
}

export function useInteractiveRebaseMutation(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['log', repoPath] })
    qc.invalidateQueries({ queryKey: ['refs', repoPath] })
  }

  return useMutation({
    mutationFn: ({ base, commits }: { base: string; commits: import('@/types/git').RebaseCommit[] }) =>
      gitApi.interactiveRebase(repoPath!, base, commits),
    onSuccess: invalidate,
  })
}

export function usePatchMutations(repoPath: string | null) {
  const formatPatch = useMutation({
    mutationFn: ({ base, outputDir }: { base: string; outputDir: string }) =>
      gitApi.formatPatch(repoPath!, base, outputDir),
  })

  const applyPatch = useMutation({
    mutationFn: ({ patchPath, useAm }: { patchPath: string; useAm?: boolean }) =>
      gitApi.applyPatch(repoPath!, patchPath, useAm),
  })

  return { formatPatch, applyPatch }
}

export function useSubmodules(repoPath: string | null) {
  return useQuery({
    queryKey: ['submodules', repoPath],
    queryFn: () => gitApi.listSubmodules(repoPath!),
    enabled: !!repoPath,
    staleTime: 10_000,
  })
}

export function useSubmoduleMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['submodules', repoPath] })

  const add = useMutation({
    mutationFn: ({ url, path }: { url: string; path: string }) =>
      gitApi.addSubmodule(repoPath!, url, path),
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: () => gitApi.updateSubmodules(repoPath!),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (path: string) => gitApi.removeSubmodule(repoPath!, path),
    onSuccess: invalidate,
  })

  return { add, update, remove }
}

export function useCleanDryRun(repoPath: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['cleanDryRun', repoPath],
    queryFn: () => gitApi.cleanDryRun(repoPath!),
    enabled: !!repoPath && enabled,
    staleTime: 0,
  })
}

export function useCleanMutation(repoPath: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => gitApi.clean(repoPath!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['status', repoPath] })
      qc.invalidateQueries({ queryKey: ['cleanDryRun', repoPath] })
    },
  })
}

export function useGitignore(repoPath: string | null) {
  return useQuery({
    queryKey: ['gitignore', repoPath],
    queryFn: () => gitApi.readGitignore(repoPath!),
    enabled: !!repoPath,
    staleTime: 10_000,
  })
}

export function useGitattributes(repoPath: string | null) {
  return useQuery({
    queryKey: ['gitattributes', repoPath],
    queryFn: () => gitApi.readGitattributes(repoPath!),
    enabled: !!repoPath,
    staleTime: 10_000,
  })
}

export function useGitignoreMutations(repoPath: string | null) {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['gitignore', repoPath] })

  const write = useMutation({
    mutationFn: (content: string) => gitApi.writeGitignore(repoPath!, content),
    onSuccess: invalidate,
  })

  const addPattern = useMutation({
    mutationFn: (pattern: string) => gitApi.addToGitignore(repoPath!, pattern),
    onSuccess: invalidate,
  })

  return { write, addPattern }
}

export function useGitattributesMutations(repoPath: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => gitApi.writeGitattributes(repoPath!, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gitattributes', repoPath] }),
  })
}
