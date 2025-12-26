import { spawn } from 'node:child_process'
import path from 'node:path'
import { setTimeout as wait } from 'node:timers/promises'

const root = process.cwd()
const port = 3111

function run(cmd, args, options={}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...options })
    p.on('exit', code => code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)))
  })
}

async function ensureBuilt() {
  await run('npm', ['run','build'])
}

async function startServer() {
  const server = spawn('npm', ['run','start','--','-p', String(port)], { stdio: 'inherit', shell: true })
  // simple wait; Next prints ready quickly
  await wait(4000)
  return () => server.kill('SIGINT')
}

async function findBrowser() {
  const candidates = [
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'
  ]
  for (const exe of candidates) {
    try {
      await run('powershell', ['-Command', `Test-Path \"${exe}\"`])
      return exe
    } catch {}
  }
  return null
}

async function generate() {
  const kill = await startServer()
  const url = `http://localhost:${port}/charter`
  const outPath = path.join(root, 'public', 'MHC_Charter.pdf')
  const browserExe = await findBrowser()
  if (!browserExe) {
    kill()
    throw new Error('No Edge/Chrome found. Install Microsoft Edge or Google Chrome.')
  }
  const args = [
    '--headless=new',
    '--disable-gpu',
    `--print-to-pdf=${outPath}`,
    '--no-sandbox',
    url
  ]
  await run(`\"${browserExe}\"`, args)
  kill()
  console.log(`Saved PDF → ${outPath}`)
}

try {
  await ensureBuilt()
  await generate()
} catch (e) {
  console.error(e)
  process.exit(1)
}