import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const isWindows = process.platform === 'win32'
const npmCmd = isWindows ? 'npm.cmd' : 'npm'

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log('🚀 Starting Crystal Estates Production Services')
console.log('   - Server: http://localhost:5000')
console.log('   - Client: http://localhost:3000')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

const serverProcess = spawn(npmCmd, ['run', 'start'], {
  cwd: path.join(rootDir, 'server'),
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: isWindows,
})

const clientProcess = spawn(npmCmd, ['run', 'start'], {
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

pipeWithPrefix(serverProcess.stdout, '[SERVER]', '35')
pipeWithPrefix(serverProcess.stderr, '[SERVER:ERR]', '31')

pipeWithPrefix(clientProcess.stdout, '[CLIENT]', '36')
pipeWithPrefix(clientProcess.stderr, '[CLIENT:ERR]', '33')

function shutdown() {
  console.log('\n🛑 Stopping production services...')
  try {
    if (isWindows) {
      if (serverProcess.pid) spawn('taskkill', ['/pid', String(serverProcess.pid), '/f', '/t'])
      if (clientProcess.pid) spawn('taskkill', ['/pid', String(clientProcess.pid), '/f', '/t'])
    } else {
      serverProcess.kill('SIGINT')
      clientProcess.kill('SIGINT')
    }
  } catch (err) {
    // ignore
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

