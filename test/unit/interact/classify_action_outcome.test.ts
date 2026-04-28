import assert from 'assert'
import { classifyActionOutcome } from '../../../src/interact/classify.js'

function run() {
  // Step 1 — uiChanged → success
  {
    const result = classifyActionOutcome({ uiChanged: true })
    assert.strictEqual(result.outcome, 'success')
    assert.ok(result.reasoning.length > 0)
  }

  // Step 1 — expectedElementVisible → success
  {
    const result = classifyActionOutcome({ uiChanged: false, expectedElementVisible: true })
    assert.strictEqual(result.outcome, 'success')
    assert.strictEqual(result.reasoning, 'expected element is visible')
  }

  // Step 1 — both uiChanged and expectedElementVisible → success
  {
    const result = classifyActionOutcome({ uiChanged: true, expectedElementVisible: true })
    assert.strictEqual(result.outcome, 'success')
  }

  // No actionType supplied → unknown
  {
    const result = classifyActionOutcome({ uiChanged: false })
    assert.strictEqual(result.outcome, 'unknown')
    assert.ok(result.reasoning.includes('actionType was not supplied'))
  }

  // Local-state action routes to state verification rather than forced network probing
  {
    const result = classifyActionOutcome({ uiChanged: false, actionType: 'tap' })
    assert.strictEqual(result.outcome, 'no_op')
    assert.ok(result.reasoning.includes('local-state action'))
  }

  // Local-state action with network data still prefers local-state semantics
  {
    const result = classifyActionOutcome({
      uiChanged: false,
      actionType: 'type_text',
      networkRequests: []
    })
    assert.strictEqual(result.outcome, 'no_op')
    assert.ok(result.reasoning.includes('local-state action'))
  }

  // Explicit side-effect action without networkRequests supplied → unknown
  {
    const result = classifyActionOutcome({ uiChanged: false, actionType: 'start_app' })
    assert.strictEqual(result.outcome, 'unknown')
    assert.ok(result.reasoning.includes('side-effect action'))
  }

  // Side-effect action with empty networkRequests → no_op
  {
    const result = classifyActionOutcome({ uiChanged: false, actionType: 'start_app', networkRequests: [] })
    assert.strictEqual(result.outcome, 'no_op')
    assert.ok(result.reasoning.includes('side-effect action'))
  }

  // Network failure → backend_failure
  {
    const result = classifyActionOutcome({
      uiChanged: false,
      actionType: 'start_app',
      networkRequests: [{ endpoint: '/login', status: 'failure' }]
    })
    assert.strictEqual(result.outcome, 'backend_failure')
    assert.ok(result.reasoning.includes('/login'))
    assert.ok(result.reasoning.includes('failure'))
  }

  // Retryable status → backend_failure
  {
    const result = classifyActionOutcome({
      uiChanged: false,
      actionType: 'start_app',
      networkRequests: [
        { endpoint: '/api/submit', status: 'retryable' },
        { endpoint: '/api/other', status: 'success' }
      ]
    })
    assert.strictEqual(result.outcome, 'backend_failure')
    assert.ok(result.reasoning.includes('/api/submit'))
  }

  // All requests succeeded and UI stayed unchanged → ui_failure
  {
    const result = classifyActionOutcome({
      uiChanged: false,
      actionType: 'start_app',
      networkRequests: [
        { endpoint: '/api/save', status: 'success' },
        { endpoint: '/api/refresh', status: 'success' }
      ]
    })
    assert.strictEqual(result.outcome, 'ui_failure')
    assert.ok(result.reasoning.includes('network requests succeeded'))
  }

  // Empty network requests with log errors → no_op with note
  {
    const result = classifyActionOutcome({ uiChanged: false, actionType: 'start_app', networkRequests: [], hasLogErrors: true })
    assert.strictEqual(result.outcome, 'no_op')
    assert.ok(result.reasoning.includes('log errors'))
  }

  // Step 1 takes priority over network signals — success even when failures present
  {
    const result = classifyActionOutcome({
      uiChanged: true,
      actionType: 'start_app',
      networkRequests: [{ endpoint: '/api/log', status: 'failure' }]
    })
    assert.strictEqual(result.outcome, 'success')
  }

  console.log('classify_action_outcome tests passed')
}

try {
  run()
} catch (error) {
  console.error(error)
  process.exit(1)
}
