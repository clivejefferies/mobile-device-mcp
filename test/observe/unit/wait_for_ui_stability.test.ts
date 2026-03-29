import { ToolsInteract } from '../../../../src/interact/index.js'
import * as Observe from '../../../../src/observe/index.js'

async function run() {
  console.log('Unit: wait_for_ui stability behavior')

  const origFind = (ToolsInteract as any).findElementHandler
  const origFp = (Observe as any).ToolsObserve.getScreenFingerprintHandler

  try {
    // Simulate UI flicker: present, absent, present, then stable
    const seq = [false, true, false, true, true, true]
    (ToolsInteract as any).findElementHandler = async () => ({ found: seq.shift() ?? true })

    const res = await (ToolsInteract as any).waitForUIHandler({ type: 'ui', query: 'X', timeoutMs: 5000, pollIntervalMs: 100, stability_ms: 500, platform: 'android' })
    const ok = res && (res as any).success
    console.log('Flicker stability test:', ok ? 'PASS' : 'FAIL', JSON.stringify((res as any).telemetry || {}, null, 2))

    // Simulate immediate stable presence
    (ToolsInteract as any).findElementHandler = async () => ({ found: true })
    const res2 = await (ToolsInteract as any).waitForUIHandler({ type: 'ui', query: 'Y', timeoutMs: 2000, pollIntervalMs: 100, stability_ms: 300, platform: 'android' })
    console.log('Immediate stable test:', res2 && (res2 as any).success ? 'PASS' : 'FAIL', JSON.stringify((res2 as any).telemetry || {}, null, 2))

  } finally {
    (ToolsInteract as any).findElementHandler = origFind
    (Observe as any).ToolsObserve.getScreenFingerprintHandler = origFp
  }
}

run().catch(e=>{ console.error(e); process.exit(1) })
