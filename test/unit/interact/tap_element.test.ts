import assert from 'assert'
import { ToolsInteract } from '../../../src/interact/index.js'
import * as Observe from '../../../src/observe/index.js'

async function run() {
  console.log('Starting tap_element unit tests...')
  const originalGetUITreeHandler = (Observe as any).ToolsObserve.getUITreeHandler
  const originalTapHandler = (ToolsInteract as any).tapHandler

  try {
    ;(Observe as any).ToolsObserve.getUITreeHandler = async () => ({
      device: { platform: 'android', id: 'mock-device' },
      elements: [
        { text: 'Submit', resourceId: 'btn_submit', bounds: [0, 0, 20, 20], visible: true, enabled: true, clickable: true }
      ]
    })

    const waitSuccess = await ToolsInteract.waitForUIHandler({
      selector: { text: 'Submit' },
      condition: 'exists',
      timeout_ms: 200,
      poll_interval_ms: 50,
      platform: 'android'
    })
    assert.strictEqual(waitSuccess.status, 'success')
    const successElementId = waitSuccess.element.elementId

    let tapped: { x: number, y: number, platform?: string, deviceId?: string } | null = null
    ;(ToolsInteract as any).tapHandler = async ({ platform, x, y, deviceId }: any) => {
      tapped = { platform, x, y, deviceId }
      return { success: true, device: { platform: platform || 'android', id: deviceId || 'mock-device' }, x, y }
    }

    const tapSuccess = await ToolsInteract.tapElementHandler({ elementId: successElementId })
    assert.deepStrictEqual(tapSuccess, { success: true, elementId: successElementId, action: 'tap' })
    assert.deepStrictEqual(tapped, { platform: 'android', x: 10, y: 10, deviceId: 'mock-device' })

    ;(Observe as any).ToolsObserve.getUITreeHandler = async () => ({
      device: { platform: 'android', id: 'mock-device' },
      elements: [
        { text: 'Hidden', resourceId: 'btn_hidden', bounds: [0, 0, 20, 20], visible: false, enabled: true, clickable: true }
      ]
    })
    const waitHidden = await ToolsInteract.waitForUIHandler({
      selector: { text: 'Hidden' },
      condition: 'exists',
      timeout_ms: 200,
      poll_interval_ms: 50,
      platform: 'android'
    })
    const hiddenResult = await ToolsInteract.tapElementHandler({ elementId: waitHidden.element.elementId })
    assert.strictEqual(hiddenResult.success, false)
    assert.strictEqual(hiddenResult.error?.code, 'element_not_visible')

    ;(Observe as any).ToolsObserve.getUITreeHandler = async () => ({
      device: { platform: 'android', id: 'mock-device' },
      elements: [
        { text: 'Disabled', resourceId: 'btn_disabled', bounds: [0, 0, 20, 20], visible: true, enabled: false, clickable: true }
      ]
    })
    const waitDisabled = await ToolsInteract.waitForUIHandler({
      selector: { text: 'Disabled' },
      condition: 'exists',
      timeout_ms: 200,
      poll_interval_ms: 50,
      platform: 'android'
    })
    const disabledResult = await ToolsInteract.tapElementHandler({ elementId: waitDisabled.element.elementId })
    assert.strictEqual(disabledResult.success, false)
    assert.strictEqual(disabledResult.error?.code, 'element_not_enabled')

    ;(Observe as any).ToolsObserve.getUITreeHandler = async () => ({
      device: { platform: 'android', id: 'mock-device' },
      elements: []
    })
    const notFoundResult = await ToolsInteract.tapElementHandler({ elementId: successElementId })
    assert.strictEqual(notFoundResult.success, false)
    assert.strictEqual(notFoundResult.error?.code, 'element_not_found')

    console.log('tap_element unit tests passed')
  } finally {
    ;(Observe as any).ToolsObserve.getUITreeHandler = originalGetUITreeHandler
    ;(ToolsInteract as any).tapHandler = originalTapHandler
  }
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
