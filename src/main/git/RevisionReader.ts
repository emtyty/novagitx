import type { GitExecutor } from './GitExecutor.js'
import type { GitRevision, LogOptions } from './types.js'

// Fields: objectId(40) + parentIds\n + authorUnixTime\n + commitUnixTime\n + authorName\n + authorEmail\n + committerName\n + committerEmail\n + subject\n + body
// Records are NUL-delimited (-z)
const LOG_FORMAT = '%H%P%n%at%n%ct%n%aN%n%aE%n%cN%n%cE%n%s%n%b'

export class RevisionReader {
  constructor(private readonly executor: GitExecutor) {}

  async getFileHistory(filePath: string, opts: LogOptions = {}): Promise<GitRevision[]> {
    const args = ['log', '-z', `--pretty=format:${LOG_FORMAT}`, '--topo-order', '--follow']
    if (opts.maxCount) args.push(`--max-count=${opts.maxCount}`)
    args.push('--', filePath)
    const result = await this.executor.run(args)
    if (result.exitCode !== 0 && result.stdout.trim() === '') return []
    return this.parseLog(result.stdout)
  }

  async getRevisions(opts: LogOptions = {}): Promise<GitRevision[]> {
    const args = ['log', '-z', `--pretty=format:${LOG_FORMAT}`, '--topo-order']

    if (opts.maxCount) args.push(`--max-count=${opts.maxCount}`)
    if (opts.skip) args.push(`--skip=${opts.skip}`)
    if (!opts.onlyCurrentBranch) args.push('--all')
    if (opts.author) args.push(`--author=${opts.author}`)
    if (opts.grep) args.push(`--grep=${opts.grep}`)
    if (opts.since) args.push(`--since=${opts.since}`)
    if (opts.until) args.push(`--until=${opts.until}`)

    const result = await this.executor.run(args)
    if (result.exitCode !== 0 && result.stdout.trim() === '') return []

    return this.parseLog(result.stdout)
  }

  private parseLog(output: string): GitRevision[] {
    return output
      .split('\0')
      .filter(Boolean)
      .map((r) => this.parseRecord(r))
      .filter((r): r is GitRevision => r !== null)
  }

  private parseRecord(record: string): GitRevision | null {
    // First line: %H%P  (objectId 40 chars, then rest is space-separated parents)
    const firstNL = record.indexOf('\n')
    if (firstNL === -1) return null

    const firstLine = record.slice(0, firstNL)
    const objectId = firstLine.slice(0, 40)
    if (objectId.length < 40) return null

    const parentsPart = firstLine.slice(40).trim()
    const parentIds = parentsPart ? parentsPart.split(' ').filter(Boolean) : []

    const lines = record.slice(firstNL + 1).split('\n')
    const authorUnixTime = parseInt(lines[0] ?? '0', 10) || 0
    const commitUnixTime = parseInt(lines[1] ?? '0', 10) || 0
    const author = lines[2] ?? ''
    const authorEmail = lines[3] ?? ''
    const committer = lines[4] ?? ''
    const committerEmail = lines[5] ?? ''
    const subject = lines[6] ?? ''
    const body = lines.slice(7).join('\n').trimEnd() || null

    return {
      objectId,
      parentIds,
      author,
      authorEmail,
      authorUnixTime,
      committer,
      committerEmail,
      commitUnixTime,
      subject,
      body,
      refs: [],
      branchLane: 0,
      lanes: [],
    }
  }
}
