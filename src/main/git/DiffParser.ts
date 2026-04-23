import type { GitExecutor } from './GitExecutor.js'
import type { DiffFile, DiffLine } from './types.js'

export class DiffParser {
  async getCommitDiff(executor: GitExecutor, commitHash: string): Promise<DiffFile[]> {
    const args =
      commitHash === 'WORKTREE'
        ? ['diff', '--unified=3', '--no-color', '-z', '--numstat', 'HEAD']
        : ['diff-tree', '--no-commit-id', '-r', '--unified=3', '--no-color', `${commitHash}^..${commitHash}`]

    const result = await executor.run(args)
    if (result.exitCode !== 0 && !result.stdout) return []
    return this.parseDiff(result.stdout)
  }

  async getFileDiff(executor: GitExecutor, commitHash: string, filePath: string): Promise<DiffFile | null> {
    const args =
      commitHash === 'WORKTREE'
        ? ['diff', '--unified=3', '--no-color', 'HEAD', '--', filePath]
        : ['diff-tree', '--no-commit-id', '-r', '--unified=3', '--no-color', `${commitHash}^..${commitHash}`, '--', filePath]

    const result = await executor.run(args)
    if (result.exitCode !== 0 && !result.stdout) return null
    const files = this.parseDiff(result.stdout)
    return files[0] ?? null
  }

  parseDiff(raw: string): DiffFile[] {
    const files: DiffFile[] = []
    const fileBlocks = raw.split(/^diff --git /m).filter(Boolean)

    for (const block of fileBlocks) {
      const lines = block.split('\n')
      const headerLine = lines[0] ?? ''
      const match = headerLine.match(/^a\/(.+) b\/(.+)$/)
      const path = match ? match[2] : headerLine.trim()

      let status: DiffFile['status'] = 'M'
      let oldPath: string | null = null
      let addedLines = 0
      let removedLines = 0
      const diffLines: DiffLine[] = []

      let oldLineNum = 0
      let newLineNum = 0

      for (const line of lines.slice(1)) {
        if (line.startsWith('new file')) { status = 'A'; continue }
        if (line.startsWith('deleted file')) { status = 'D'; continue }
        if (line.startsWith('rename from ')) { oldPath = line.slice(12); status = 'R'; continue }
        if (line.startsWith('--- ') || line.startsWith('+++ ')) continue
        if (line.startsWith('index ') || line.startsWith('similarity ') || line.startsWith('rename to ')) continue

        if (line.startsWith('@@')) {
          const hunkMatch = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)/)
          if (hunkMatch) {
            oldLineNum = parseInt(hunkMatch[1], 10)
            newLineNum = parseInt(hunkMatch[2], 10)
          }
          diffLines.push({ type: 'hunk', oldLineNum: null, newLineNum: null, text: line })
          continue
        }

        if (line.startsWith('+')) {
          diffLines.push({ type: 'add', oldLineNum: null, newLineNum: newLineNum++, text: line.slice(1) })
          addedLines++
        } else if (line.startsWith('-')) {
          diffLines.push({ type: 'del', oldLineNum: oldLineNum++, newLineNum: null, text: line.slice(1) })
          removedLines++
        } else if (line.startsWith(' ')) {
          diffLines.push({ type: 'ctx', oldLineNum: oldLineNum++, newLineNum: newLineNum++, text: line.slice(1) })
        }
      }

      if (path) {
        files.push({ path, oldPath, status, addedLines, removedLines, lines: diffLines })
      }
    }

    return files
  }
}
