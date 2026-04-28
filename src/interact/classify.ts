export type ActionOutcome = 'success' | 'no_op' | 'backend_failure' | 'ui_failure' | 'unknown'
export type NetworkRequestStatus = 'success' | 'failure' | 'retryable'
export type ActionCategory = 'local_state' | 'side_effect'

export interface NetworkRequest {
  endpoint: string
  status: NetworkRequestStatus
}

export interface ClassifyActionOutcomeInput {
  uiChanged: boolean
  expectedElementVisible?: boolean | null
  /** Concrete action_type from the runtime action result (for example: tap, type_text, start_app). */
  actionType?: string | null
  /** null = get_network_activity has not been called yet */
  networkRequests?: NetworkRequest[] | null
  hasLogErrors?: boolean | null
}

export interface ClassifyActionOutcomeResult {
  outcome: ActionOutcome
  reasoning: string
}

const ACTION_CATEGORY_BY_TYPE: Record<string, ActionCategory> = {
  tap: 'local_state',
  tap_element: 'local_state',
  swipe: 'local_state',
  scroll_to_element: 'local_state',
  type_text: 'local_state',
  press_back: 'local_state',
  start_app: 'side_effect',
  restart_app: 'side_effect',
  terminate_app: 'side_effect',
  reset_app_data: 'side_effect',
  install_app: 'side_effect',
  build_app: 'side_effect',
  build_and_install: 'side_effect'
}

function inferActionCategory(actionType?: string | null): ActionCategory | null {
  if (typeof actionType !== 'string') return null
  const normalized = actionType.trim().toLowerCase()
  if (!normalized) return null
  return ACTION_CATEGORY_BY_TYPE[normalized] ?? 'side_effect'
}

/**
 * Pure deterministic classifier. Applies rules in fixed order.
 * Same inputs always produce the same output.
 */
export function classifyActionOutcome(input: ClassifyActionOutcomeInput): ClassifyActionOutcomeResult {
  const { uiChanged, expectedElementVisible, actionType, networkRequests, hasLogErrors } = input
  const actionCategory = inferActionCategory(actionType)

  // Step 1 — UI signal is positive
  if (uiChanged || expectedElementVisible === true) {
    return { outcome: 'success', reasoning: expectedElementVisible === true ? 'expected element is visible' : 'UI changed after action' }
  }

  // Step 2 — no action type means we cannot choose a safe routing path
  if (actionCategory === null) {
    return {
      outcome: 'unknown',
      reasoning: 'actionType was not supplied; pass the runtime action_type so the classifier can distinguish local-state and side-effect routing'
    }
  }

  const failedRequest = networkRequests?.find((r) => r.status === 'failure' || r.status === 'retryable')
  if (failedRequest) {
    return { outcome: 'backend_failure', reasoning: `network request ${failedRequest.endpoint} returned ${failedRequest.status}` }
  }

  // Step 3 — local-state actions should be verified with state-specific signals first
  if (actionCategory === 'local_state') {
    const logNote = hasLogErrors ? ' (log errors present)' : ''
    return {
      outcome: 'no_op',
      reasoning: `local-state action${logNote}; use expect_state, refreshed snapshot comparison, or expect_element_visible instead of defaulting to network inspection`
    }
  }

  // Step 4 — side-effect actions may legitimately need network or log inspection
  if (networkRequests === null || networkRequests === undefined) {
    return {
      outcome: 'unknown',
      reasoning: 'side-effect action without network data; inspect network or log signals only if the outcome is still ambiguous'
    }
  }

  // Step 5 — no network requests at all
  if (networkRequests.length === 0) {
    const logNote = hasLogErrors ? ' (log errors present)' : ''
    return { outcome: 'no_op', reasoning: `side-effect action and no network activity${logNote}` }
  }

  // Step 6 — network requests exist and all succeeded
  if (networkRequests.every((r) => r.status === 'success')) {
    return { outcome: 'ui_failure', reasoning: 'network requests succeeded but UI did not change' }
  }

  // Step 7 — fallback
  return { outcome: 'unknown', reasoning: 'signals are inconclusive' }
}
