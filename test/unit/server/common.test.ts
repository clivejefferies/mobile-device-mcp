import assert from 'assert'
import { requireBooleanArg } from '../../../src/server/common.js'

function run() {
  assert.strictEqual(requireBooleanArg({ exact: true }, 'exact'), true)
  assert.strictEqual(requireBooleanArg({ exact: false }, 'exact'), false)
  assert.throws(() => requireBooleanArg({}, 'exact'), /Missing or invalid boolean argument: exact/)
  assert.throws(() => requireBooleanArg({ exact: 'true' as unknown as boolean }, 'exact'), /Missing or invalid boolean argument: exact/)

  console.log('server common tests passed')
}

try {
  run()
} catch (error) {
  console.error(error)
  process.exit(1)
}
