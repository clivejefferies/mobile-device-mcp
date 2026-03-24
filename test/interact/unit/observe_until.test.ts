import { ToolsInteract } from '../../../src/interact/index.js'
import * as Observe from '../../../src/observe/index.js'

async function runTests() {
  console.log('Starting observe_until unit tests...')

  const origFind = (ToolsInteract as any).findElementHandler
  const origReadLog = (Observe as any).ToolsObserve.readLogStreamHandler
  const origGetLogs = (Observe as any).ToolsObserve.getLogsHandler
  const origGetFp = (Observe as any).ToolsObserve.getScreenFingerprintHandler
  const origResolveObserve = (Observe as any).ToolsObserve.resolveObserve

  try {
    // UI condition: findElement returns found on 2nd call
    let calls = 0
    ;(ToolsInteract as any).findElementHandler = async (args) => {
      calls++
      const query = (args && (args.query || args)) || ''
      if (calls >= 2) return { found: true, element: { text: query } }
      return { found: false }
    }

    const resUi = await ToolsInteract.observeUntilHandler({ type: 'ui', query: 'Generate Session', timeoutMs: 3000, pollIntervalMs: 100, platform: 'android' })
    console.log('UI Test:', (resUi && (resUi as any).success) ? 'PASS' : 'FAIL')

    // Log condition: stream empty, snapshot contains matching line
    ;(Observe as any).ToolsObserve.readLogStreamHandler = async () => ({ entries: [ { message: 'nothing' } ] })
    let glCalls = 0
    ;(Observe as any).ToolsObserve.getLogsHandler = async () => {
      glCalls++
      if (glCalls === 1) return { device: {}, logs: ['INFO start'] }
      return { device: {}, logs: ['INFO start', 'ERROR Exception occurred', 'Server: Boom'] }
    }

    const resLog = await ToolsInteract.observeUntilHandler({ type: 'log', query: 'Server', timeoutMs: 3000, pollIntervalMs: 100, platform: 'android' })
    console.log('Log Test:', (resLog && (resLog as any).success) ? 'PASS' : 'FAIL')

    // Screen condition: fingerprint changes after a few polls
    let seq = ['A', 'A', 'B']
    ;(Observe as any).ToolsObserve.resolveObserve = async () => ({ observe: { getScreenFingerprint: async () => ({ fingerprint: seq.length ? seq.shift() : null }) }, resolved: { id: 'mock' } })
    const resScreen = await ToolsInteract.observeUntilHandler({ type: 'screen', timeoutMs: 3000, pollIntervalMs: 100, platform: 'android' })
    console.log('Screen Test:', (resScreen && (resScreen as any).success) ? 'PASS' : 'FAIL')

    // Idle condition: stable fingerprints observed
    let idleSeq = ['X', 'X', 'X']
    ;(Observe as any).ToolsObserve.resolveObserve = async () => ({ observe: { getScreenFingerprint: async () => ({ fingerprint: idleSeq.length ? idleSeq.shift() : 'X' }) }, resolved: { id: 'mock' } })
    const resIdle = await ToolsInteract.observeUntilHandler({ type: 'idle', timeoutMs: 3000, pollIntervalMs: 100, platform: 'android' })
    console.log('Idle Test:', (resIdle && (resIdle as any).success) ? 'PASS' : 'FAIL')

  } finally {
    ;(ToolsInteract as any).findElementHandler = origFind
    ;(Observe as any).ToolsObserve.readLogStreamHandler = origReadLog
    ;(Observe as any).ToolsObserve.getLogsHandler = origGetLogs
    ;(Observe as any).ToolsObserve.getScreenFingerprintHandler = origGetFp
    ;(Observe as any).ToolsObserve.resolveObserve = origResolveObserve
  }
}

runTests().catch(console.error)
