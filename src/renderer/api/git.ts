import type { GitRevision, GitRef, GitItemStatus, DiffFile, LogOptions, RepoInfo, RefGroups, BlameLine, ReflogEntry, Remote, ConflictFile, StashEntry, Submodule, CleanEntry, RebaseCommit } from '@/types/git'

declare global {
  interface Window {
    git: {
      openRepo: () => Promise<RepoInfo | null>
      getRepoInfo: (repoPath: string) => Promise<RepoInfo>
      cloneRepo: (url: string, destination: string, depth?: number) => Promise<RepoInfo>
      initRepo: (path?: string) => Promise<RepoInfo | null>
      getLog: (repoPath: string, opts?: LogOptions) => Promise<GitRevision[]>
      getRefs: (repoPath: string) => Promise<RefGroups>
      getStatus: (repoPath: string) => Promise<GitItemStatus[]>
      getDiffCommit: (repoPath: string, commitHash: string) => Promise<DiffFile[]>
      getDiffFile: (repoPath: string, commitHash: string, filePath: string) => Promise<DiffFile[]>
      getDiffWorking: (repoPath: string, filePath?: string) => Promise<DiffFile[]>
      getDiffStaged: (repoPath: string, filePath?: string) => Promise<DiffFile[]>
      checkoutBranch: (repoPath: string, branchName: string) => Promise<void>
      createBranch: (repoPath: string, name: string, from?: string) => Promise<void>
      deleteBranch: (repoPath: string, name: string, force?: boolean) => Promise<void>
      renameBranch: (repoPath: string, oldName: string, newName: string) => Promise<void>
      mergeBranch: (repoPath: string, branch: string, strategy?: string) => Promise<void>
      fetch: (repoPath: string, remote?: string) => Promise<void>
      pull: (repoPath: string, remote: string, branch: string) => Promise<void>
      push: (repoPath: string, remote: string, branch: string, force?: boolean) => Promise<void>
      stageFile: (repoPath: string, filePath: string) => Promise<void>
      unstageFile: (repoPath: string, filePath: string) => Promise<void>
      discardFile: (repoPath: string, filePath: string) => Promise<void>
      createCommit: (repoPath: string, message: string) => Promise<void>
      amendCommit: (repoPath: string, message?: string) => Promise<void>
      revertCommit: (repoPath: string, hash: string) => Promise<void>
      resetToCommit: (repoPath: string, hash: string, mode: string) => Promise<void>
      cherryPick: (repoPath: string, hash: string) => Promise<void>
      createTag: (repoPath: string, name: string, hash?: string, message?: string) => Promise<void>
      deleteTag: (repoPath: string, name: string) => Promise<void>
      pushTag: (repoPath: string, remote: string, name: string) => Promise<void>
      stashSave: (repoPath: string, message?: string) => Promise<void>
      stashApply: (repoPath: string, ref: string) => Promise<void>
      stashDrop: (repoPath: string, ref: string) => Promise<void>
      getFileHistory: (repoPath: string, filePath: string, opts?: LogOptions) => Promise<GitRevision[]>
      getReflog: (repoPath: string) => Promise<ReflogEntry[]>
      getBlame: (repoPath: string, filePath: string, commitHash?: string) => Promise<BlameLine[]>
      getRemotes: (repoPath: string) => Promise<Remote[]>
      addRemote: (repoPath: string, name: string, url: string) => Promise<void>
      removeRemote: (repoPath: string, name: string) => Promise<void>
      renameRemote: (repoPath: string, oldName: string, newName: string) => Promise<void>
      pruneRemote: (repoPath: string, name: string) => Promise<void>
      rebase: (repoPath: string, onto: string) => Promise<void>
      abortRebase: (repoPath: string) => Promise<void>
      getConflicts: (repoPath: string) => Promise<ConflictFile[]>
      resolveConflict: (repoPath: string, filePath: string, strategy: 'ours' | 'theirs') => Promise<void>
      stageHunk: (repoPath: string, patch: string) => Promise<void>
      unstageHunk: (repoPath: string, patch: string) => Promise<void>
      stashPop: (repoPath: string, ref?: string) => Promise<void>
      stashSaveFlags: (repoPath: string, message?: string, includeUntracked?: boolean, all?: boolean) => Promise<void>
      listStashes: (repoPath: string) => Promise<StashEntry[]>
      getStashDiff: (repoPath: string, ref: string) => Promise<DiffFile[]>
      compareDiff: (repoPath: string, ref1: string, ref2: string, filePath?: string) => Promise<DiffFile[]>
      setUpstream: (repoPath: string, branch: string, upstream: string) => Promise<void>
      checkoutRemoteBranch: (repoPath: string, remoteBranch: string, localName?: string) => Promise<void>
      checkoutRevision: (repoPath: string, hash: string) => Promise<void>
      getRebaseCommits: (repoPath: string, base: string) => Promise<RebaseCommit[]>
      interactiveRebase: (repoPath: string, base: string, commits: RebaseCommit[]) => Promise<void>
      formatPatch: (repoPath: string, base: string, outputDir: string) => Promise<string[]>
      applyPatch: (repoPath: string, patchPath: string, useAm?: boolean) => Promise<void>
      openDirDialog: () => Promise<string | null>
      openFileDialog: (filters?: { name: string; extensions: string[] }[]) => Promise<string | null>
      listSubmodules: (repoPath: string) => Promise<Submodule[]>
      addSubmodule: (repoPath: string, url: string, path: string) => Promise<void>
      updateSubmodules: (repoPath: string) => Promise<void>
      removeSubmodule: (repoPath: string, path: string) => Promise<void>
      cleanDryRun: (repoPath: string) => Promise<CleanEntry[]>
      clean: (repoPath: string) => Promise<void>
      readGitignore: (repoPath: string) => Promise<string>
      writeGitignore: (repoPath: string, content: string) => Promise<void>
      addToGitignore: (repoPath: string, pattern: string) => Promise<void>
      readGitattributes: (repoPath: string) => Promise<string>
      writeGitattributes: (repoPath: string, content: string) => Promise<void>
    }
    theme: {
      getTheme: () => Promise<{ shouldUseDarkColors: boolean; themeSource: 'system' | 'light' | 'dark' }>
      setThemeSource: (source: 'system' | 'light' | 'dark') => Promise<void>
      onThemeChanged: (cb: (dark: boolean) => void) => () => void
    }
    appOS: {
      platform: NodeJS.Platform
      onRepoOpenedFromOS: (cb: (info: RepoInfo) => void) => () => void
    }
  }
}

export const gitApi = {
  openRepo: (): Promise<RepoInfo | null> => window.git.openRepo(),
  getRepoInfo: (repoPath: string): Promise<RepoInfo> => window.git.getRepoInfo(repoPath),
  cloneRepo: (url: string, destination: string, depth?: number): Promise<RepoInfo> => window.git.cloneRepo(url, destination, depth),
  initRepo: (path?: string): Promise<RepoInfo | null> => window.git.initRepo(path),
  getLog: (repoPath: string, opts?: LogOptions): Promise<GitRevision[]> => window.git.getLog(repoPath, opts),
  getRefs: (repoPath: string): Promise<RefGroups> => window.git.getRefs(repoPath),
  getStatus: (repoPath: string): Promise<GitItemStatus[]> => window.git.getStatus(repoPath),
  getDiffCommit: (repoPath: string, commitHash: string): Promise<DiffFile[]> => window.git.getDiffCommit(repoPath, commitHash),
  getDiffFile: (repoPath: string, commitHash: string, filePath: string): Promise<DiffFile[]> => window.git.getDiffFile(repoPath, commitHash, filePath),
  getDiffWorking: (repoPath: string, filePath?: string): Promise<DiffFile[]> => window.git.getDiffWorking(repoPath, filePath),
  getDiffStaged: (repoPath: string, filePath?: string): Promise<DiffFile[]> => window.git.getDiffStaged(repoPath, filePath),
  checkoutBranch: (repoPath: string, branchName: string): Promise<void> => window.git.checkoutBranch(repoPath, branchName),
  createBranch: (repoPath: string, name: string, from?: string): Promise<void> => window.git.createBranch(repoPath, name, from),
  deleteBranch: (repoPath: string, name: string, force?: boolean): Promise<void> => window.git.deleteBranch(repoPath, name, force),
  renameBranch: (repoPath: string, oldName: string, newName: string): Promise<void> => window.git.renameBranch(repoPath, oldName, newName),
  mergeBranch: (repoPath: string, branch: string, strategy?: string): Promise<void> => window.git.mergeBranch(repoPath, branch, strategy),
  fetch: (repoPath: string, remote?: string): Promise<void> => window.git.fetch(repoPath, remote),
  pull: (repoPath: string, remote: string, branch: string): Promise<void> => window.git.pull(repoPath, remote, branch),
  push: (repoPath: string, remote: string, branch: string, force?: boolean): Promise<void> => window.git.push(repoPath, remote, branch, force),
  stageFile: (repoPath: string, filePath: string): Promise<void> => window.git.stageFile(repoPath, filePath),
  unstageFile: (repoPath: string, filePath: string): Promise<void> => window.git.unstageFile(repoPath, filePath),
  discardFile: (repoPath: string, filePath: string): Promise<void> => window.git.discardFile(repoPath, filePath),
  createCommit: (repoPath: string, message: string): Promise<void> => window.git.createCommit(repoPath, message),
  amendCommit: (repoPath: string, message?: string): Promise<void> => window.git.amendCommit(repoPath, message),
  revertCommit: (repoPath: string, hash: string): Promise<void> => window.git.revertCommit(repoPath, hash),
  resetToCommit: (repoPath: string, hash: string, mode: string): Promise<void> => window.git.resetToCommit(repoPath, hash, mode),
  cherryPick: (repoPath: string, hash: string): Promise<void> => window.git.cherryPick(repoPath, hash),
  createTag: (repoPath: string, name: string, hash?: string, message?: string): Promise<void> => window.git.createTag(repoPath, name, hash, message),
  deleteTag: (repoPath: string, name: string): Promise<void> => window.git.deleteTag(repoPath, name),
  pushTag: (repoPath: string, remote: string, name: string): Promise<void> => window.git.pushTag(repoPath, remote, name),
  stashSave: (repoPath: string, message?: string): Promise<void> => window.git.stashSave(repoPath, message),
  stashApply: (repoPath: string, ref: string): Promise<void> => window.git.stashApply(repoPath, ref),
  stashDrop: (repoPath: string, ref: string): Promise<void> => window.git.stashDrop(repoPath, ref),
  getFileHistory: (repoPath: string, filePath: string, opts?: LogOptions): Promise<GitRevision[]> => window.git.getFileHistory(repoPath, filePath, opts),
  getReflog: (repoPath: string): Promise<ReflogEntry[]> => window.git.getReflog(repoPath),
  getBlame: (repoPath: string, filePath: string, commitHash?: string): Promise<BlameLine[]> => window.git.getBlame(repoPath, filePath, commitHash),
  getRemotes: (repoPath: string): Promise<Remote[]> => window.git.getRemotes(repoPath),
  addRemote: (repoPath: string, name: string, url: string): Promise<void> => window.git.addRemote(repoPath, name, url),
  removeRemote: (repoPath: string, name: string): Promise<void> => window.git.removeRemote(repoPath, name),
  renameRemote: (repoPath: string, oldName: string, newName: string): Promise<void> => window.git.renameRemote(repoPath, oldName, newName),
  pruneRemote: (repoPath: string, name: string): Promise<void> => window.git.pruneRemote(repoPath, name),
  rebase: (repoPath: string, onto: string): Promise<void> => window.git.rebase(repoPath, onto),
  abortRebase: (repoPath: string): Promise<void> => window.git.abortRebase(repoPath),
  getConflicts: (repoPath: string): Promise<ConflictFile[]> => window.git.getConflicts(repoPath),
  resolveConflict: (repoPath: string, filePath: string, strategy: 'ours' | 'theirs'): Promise<void> => window.git.resolveConflict(repoPath, filePath, strategy),
  stageHunk: (repoPath: string, patch: string): Promise<void> => window.git.stageHunk(repoPath, patch),
  unstageHunk: (repoPath: string, patch: string): Promise<void> => window.git.unstageHunk(repoPath, patch),
  stashPop: (repoPath: string, ref?: string): Promise<void> => window.git.stashPop(repoPath, ref),
  stashSaveFlags: (repoPath: string, message?: string, includeUntracked?: boolean, all?: boolean): Promise<void> => window.git.stashSaveFlags(repoPath, message, includeUntracked, all),
  listStashes: (repoPath: string): Promise<StashEntry[]> => window.git.listStashes(repoPath),
  getStashDiff: (repoPath: string, ref: string): Promise<DiffFile[]> => window.git.getStashDiff(repoPath, ref),
  compareDiff: (repoPath: string, ref1: string, ref2: string, filePath?: string): Promise<DiffFile[]> => window.git.compareDiff(repoPath, ref1, ref2, filePath),
  setUpstream: (repoPath: string, branch: string, upstream: string): Promise<void> => window.git.setUpstream(repoPath, branch, upstream),
  checkoutRemoteBranch: (repoPath: string, remoteBranch: string, localName?: string): Promise<void> => window.git.checkoutRemoteBranch(repoPath, remoteBranch, localName),
  checkoutRevision: (repoPath: string, hash: string): Promise<void> => window.git.checkoutRevision(repoPath, hash),
  getRebaseCommits: (repoPath: string, base: string): Promise<RebaseCommit[]> => window.git.getRebaseCommits(repoPath, base),
  interactiveRebase: (repoPath: string, base: string, commits: RebaseCommit[]): Promise<void> => window.git.interactiveRebase(repoPath, base, commits),
  formatPatch: (repoPath: string, base: string, outputDir: string): Promise<string[]> => window.git.formatPatch(repoPath, base, outputDir),
  applyPatch: (repoPath: string, patchPath: string, useAm?: boolean): Promise<void> => window.git.applyPatch(repoPath, patchPath, useAm),
  openDirDialog: (): Promise<string | null> => window.git.openDirDialog(),
  openFileDialog: (filters?: { name: string; extensions: string[] }[]): Promise<string | null> => window.git.openFileDialog(filters),
  listSubmodules: (repoPath: string): Promise<Submodule[]> => window.git.listSubmodules(repoPath),
  addSubmodule: (repoPath: string, url: string, path: string): Promise<void> => window.git.addSubmodule(repoPath, url, path),
  updateSubmodules: (repoPath: string): Promise<void> => window.git.updateSubmodules(repoPath),
  removeSubmodule: (repoPath: string, path: string): Promise<void> => window.git.removeSubmodule(repoPath, path),
  cleanDryRun: (repoPath: string): Promise<CleanEntry[]> => window.git.cleanDryRun(repoPath),
  clean: (repoPath: string): Promise<void> => window.git.clean(repoPath),
  readGitignore: (repoPath: string): Promise<string> => window.git.readGitignore(repoPath),
  writeGitignore: (repoPath: string, content: string): Promise<void> => window.git.writeGitignore(repoPath, content),
  addToGitignore: (repoPath: string, pattern: string): Promise<void> => window.git.addToGitignore(repoPath, pattern),
  readGitattributes: (repoPath: string): Promise<string> => window.git.readGitattributes(repoPath),
  writeGitattributes: (repoPath: string, content: string): Promise<void> => window.git.writeGitattributes(repoPath, content),
}
