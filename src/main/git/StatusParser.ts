import type { GitExecutor } from './GitExecutor.js'
import type { GitItemStatus } from './types.js'

export class StatusParser {
  async getStatus(executor: GitExecutor): Promise<GitItemStatus[]> {
    const result = await executor.run(['status', '--porcelain=2', '-z', '--untracked-files=all'])
    if (result.exitCode !== 0) return []
    return this.parse(result.stdout)
  }

  private parse(output: string): GitItemStatus[] {
    const items: GitItemStatus[] = []
    const records = output.split('\0').filter(Boolean)
    let i = 0

    while (i < records.length) {
      const entry = records[i]
      i++

      if (!entry || entry.length < 2) continue
      const prefix = entry[0]

      if (prefix === '1') {
        // ordinary changed entry: 1 <xy> <sub> <mH> <mI> <mW> <hH> <hI> <path>
        const parts = entry.split(' ')
        const xy = parts[1] ?? '--'
        const path = parts.slice(8).join(' ')
        items.push(this.makeItem(path, null, xy))
      } else if (prefix === '2') {
        // renamed/copied: 2 <xy> ... <x><score> <path>\t<origPath>
        const parts = entry.split(' ')
        const xy = parts[1] ?? '--'
        const pathsStr = parts.slice(8).join(' ')
        const tabIdx = pathsStr.indexOf('\t')
        const path = tabIdx !== -1 ? pathsStr.slice(0, tabIdx) : pathsStr
        const origPath = tabIdx !== -1 ? pathsStr.slice(tabIdx + 1) : null
        const scoreStr = parts[8]?.slice(1) ?? '0'
        const similarity = parseInt(scoreStr, 10) || null
        const item = this.makeItem(path, origPath, xy)
        item.isRenamed = xy[0] === 'R' || xy[1] === 'R'
        item.renameSimilarity = similarity
        items.push(item)
      } else if (prefix === 'u') {
        // unmerged
        const parts = entry.split(' ')
        const path = parts.slice(9).join(' ')
        const item = this.makeItem(path, null, 'UU')
        item.isUnmerged = true
        items.push(item)
      } else if (prefix === '?') {
        // untracked
        const path = entry.slice(2)
        items.push(this.makeItem(path, null, '??'))
      }
    }

    return items
  }

  private makeItem(name: string, oldName: string | null, xy: string): GitItemStatus {
    const x = xy[0] ?? ' '
    const y = xy[1] ?? ' '
    return {
      name,
      oldName,
      isNew: x === 'A' || y === 'A' || x === '?' || y === '?',
      isDeleted: x === 'D' || y === 'D',
      isChanged: x === 'M' || y === 'M',
      isRenamed: x === 'R' || y === 'R',
      isUnmerged: x === 'U' || y === 'U' || (x === 'A' && y === 'A') || (x === 'D' && y === 'D'),
      isStaged: x !== ' ' && x !== '?' && x !== '.',
      renameSimilarity: null,
    }
  }
}
