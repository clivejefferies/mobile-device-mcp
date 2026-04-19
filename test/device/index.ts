import { readdir } from 'fs/promises'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'

const deviceRoot = fileURLToPath(new URL('.', import.meta.url))
const runnableSuffixes = ['.test.ts', '.smoke.ts', '.integration.ts']

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return collectFiles(fullPath)
    return fullPath
  }))

  return files.flat()
}

async function runFile(file: string): Promise<void> {
  const relativePath = path.relative(deviceRoot, file).replaceAll(path.sep, '/')
  console.log(`Running device test: ${relativePath}`)

  await new Promise<void>((resolve, reject) => {
    const child = spawn('tsx', [file], {
      stdio: 'inherit',
      env: { ...process.env, DEVICE_TEST_RUNNER: '1' },
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`Device test failed: ${relativePath} (exit code ${code ?? 'unknown'})`))
    })
  })
}

(async function () {
  const allFiles = (await collectFiles(deviceRoot))
    .filter((file) => path.basename(file) !== 'index.ts')
    .filter((file) => runnableSuffixes.some((suffix) => file.endsWith(suffix)))
    .sort()

  for (const file of allFiles) {
    await runFile(file)
  }

  console.log('Device tests loaded.')
})().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
