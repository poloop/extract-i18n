import path from 'path'
import { exec, ExecException } from 'child_process'


function runCLI (args: string[] = []): Promise<{
  code: number,
  error: ExecException | null,
  stdout: string,
  stderr: string,
}> {
  return new Promise(resolve => {
    exec(
      `node ${path.resolve(__dirname, '../bin/extract-i18n.js')} ${args.join(' ')}`,
      { cwd: '.' },
      (error, stdout, stderr) => {
        resolve({
          code: error && error.code ? error.code : 0,
          error,
          stdout,
          stderr,
        })
      }
    )
  })
}

describe('extract-i18n CLI', () => {
  it('should fail with no arguments and ask to give path of the language files', async () => {
    const { code, stdout, stderr } = await runCLI([])
    expect(code).toBe(1)
    expect(stdout).toBe('')
    expect(stderr).toBe("error: missing required argument 'languageFiles'\n")
  })
  it('should call missingKeys and duplicateKeys commands by default with just langugeFiles argument', async () => {
    const { code, stdout, stderr } = await runCLI(["./tests/fixtures/lang/**/*.json"])
    
    console.log(stdout)
    
    console.log(stderr)
  })
})