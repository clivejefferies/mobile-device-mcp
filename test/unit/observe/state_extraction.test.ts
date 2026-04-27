import assert from 'assert'
import { traverseNode } from '../../../src/utils/android/utils.js'
import { traverseIDBNode } from '../../../src/observe/ios.js'

async function run() {
  const androidElements: any[] = []
  traverseNode({
    '@_class': 'android.widget.SeekBar',
    '@_text': '',
    '@_content-desc': 'Duration',
    '@_clickable': 'true',
    '@_enabled': 'true',
    '@_selected': 'true',
    '@_progress': '7',
    '@_max': '14',
    '@_bounds': '[0,0][200,40]'
  }, androidElements)

  assert.strictEqual(androidElements.length, 1)
  assert.deepStrictEqual(androidElements[0].state?.selected, 'Duration')
  assert.strictEqual(androidElements[0].state?.raw_value, 7)
  assert.strictEqual(androidElements[0].state?.value, 50)
  assert.deepStrictEqual(androidElements[0].state?.value_range, { min: 0, max: 14 })

  const iosElements: any[] = []
  traverseIDBNode({
    AXElementType: 'Slider',
    AXLabel: 'Playback speed',
    AXValue: '0.75',
    AXTraits: ['UIAccessibilityTraitAdjustable']
  }, iosElements)

  assert.strictEqual(iosElements.length, 1)
  assert.strictEqual(iosElements[0].state?.value, 75)
  assert.strictEqual(iosElements[0].state?.raw_value, 0.75)

  console.log('state extraction tests passed')
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
