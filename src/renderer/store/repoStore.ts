import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { RepoInfo } from '@/types/git'

interface RecentRepo {
  path: string
  name: string
}

interface RepoStore {
  repoInfo: RepoInfo | null
  recentRepos: RecentRepo[]
  setRepo: (info: RepoInfo) => void
  clearRepo: () => void
}

export const useRepoStore = create<RepoStore>()(
  persist(
    (set) => ({
      repoInfo: null,
      recentRepos: [],
      setRepo: (info) =>
        set((state) => ({
          repoInfo: info,
          recentRepos: [
            { path: info.path, name: info.name },
            ...state.recentRepos.filter((r) => r.path !== info.path),
          ].slice(0, 10),
        })),
      clearRepo: () => set({ repoInfo: null }),
    }),
    { name: 'nova-git-x-repo' }
  )
)
