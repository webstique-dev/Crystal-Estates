import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🚀 Starting Crystal Estates Full-Stack Environment')
console.log('   - Server: http://localhost:5000')
console.log('   - Client: http://localhost:3000')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const serverProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'server'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
})

const clientProcess = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'client'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
})

function pipeWithPrefix(readable, prefix, colorCode = '36') {
  readable.on('data', (data) => {
    const lines = data.toString().split('\n')
    for (const line of lines) {
      if (line.trim().length > 0) {
        process.stdout.write(`\x1b[${colorCode}m${prefix}\x1b[0m ${line}\n`)
      }
    }
  })
}

pipeWithPrefix(serverProcess.stdout, '[SERVER]', '35') // Magenta
pipeWithPrefix(serverProcess.stderr, '[SERVER:ERR]', '31') // Red

pipeWithPrefix(clientProcess.stdout, '[CLIENT]', '36') // Cyan
pipeWithPrefix(clientProcess.stderr, '[CLIENT:ERR]', '33') // Yellow

function shutdown() {
  console.log('\n🛑 Shutting down Crystal Estates services...')
  try {
    if (isWindows) {
      if (serverProcess.pid) spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'])
      if (clientProcess.pid) spawn('taskkill', ['/pid', String(clientProcess.pid), '/f', '/t'])
    } else {
      serverProcess.kill('SIGINT')
      clientProcess.kill('SIGINT')
    }
  } catch (err) {
    // ignore shutdown errors
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

serverProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[SERVER] exited with code ${code}`)
  }
})

clientProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[CLIENT] exited with code ${code}`)
  }
})

