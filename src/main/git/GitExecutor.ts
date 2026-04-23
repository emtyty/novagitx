import { spawn } from 'child_process'

export interface ExecResult {
  stdout: string
  stderr: string
  exitCode: number
}

export class GitExecutor {
  constructor(private readonly workingDir: string) {}

  run(args: string[], envOverrides?: Record<string, string>): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
      const proc = spawn('git', args, {
        cwd: this.workingDir,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0', LANG: 'en_US.UTF-8', ...envOverrides },
      })

      const stdoutChunks: Buffer[] = []
      const stderrChunks: Buffer[] = []

      proc.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk))
      proc.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk))

      proc.on('close', (code) => {
        resolve({
          stdout: Buffer.concat(stdoutChunks).toString('utf8'),
          stderr: Buffer.concat(stderrChunks).toString('utf8'),
          exitCode: code ?? 1,
        })
      })

      proc.on('error', reject)
    })
  }
}
