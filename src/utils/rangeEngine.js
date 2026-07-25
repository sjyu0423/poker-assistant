import scenarios from '../data/preflopRanges.json'

/**
 * Find the closest matching preflop scenario for a stack / position / prior action.
 * Stack sizes snap to the nearest available `stack_bb` bucket among matches
 * (e.g. 23BB → 25BB).
 */
export function findScenario(stack, position, action) {
  const stackBb = Number(stack)
  const normalizedPosition = String(position ?? '').toUpperCase()
  const normalizedAction = String(action ?? '').toLowerCase()

  let candidates = scenarios.filter(
    (scenario) =>
      scenario.position_hero === normalizedPosition &&
      scenario.prior_action === normalizedAction,
  )

  // Fall back to position-only if the exact prior_action is missing.
  if (candidates.length === 0) {
    candidates = scenarios.filter(
      (scenario) => scenario.position_hero === normalizedPosition,
    )
  }

  if (candidates.length === 0) {
    return null
  }

  return candidates.reduce((closest, scenario) => {
    const closestDelta = Math.abs(closest.stack_bb - stackBb)
    const scenarioDelta = Math.abs(scenario.stack_bb - stackBb)
    return scenarioDelta < closestDelta ? scenario : closest
  })
}

function formatPriorAction(priorAction) {
  return String(priorAction ?? '')
    .split('_')
    .filter(Boolean)
    .join(' ')
}

function getHandEntry(scenario, selectedHand) {
  return scenario?.matrix?.[selectedHand] ?? null
}

/**
 * Map each hand in a scenario to the action with the highest weight.
 * Example: { AA: 'raise_2.1x', '72o': 'fold', ... }
 */
export function getDominantActions(scenario) {
  const dominant = {}
  const matrix = scenario?.matrix

  if (!matrix) return dominant

  for (const [hand, entry] of Object.entries(matrix)) {
    const weights = entry?.weights ?? {}
    let bestAction = null
    let bestWeight = -Infinity

    for (const [action, weight] of Object.entries(weights)) {
      const value = Number(weight) || 0
      if (value > bestWeight) {
        bestWeight = value
        bestAction = action
      }
    }

    if (bestAction != null) {
      dominant[hand] = bestAction
    }
  }

  return dominant
}

/**
 * Build @xyflow/react nodes + edges for a scenario tree.
 * Root = scenario context; children = available_actions with selectedHand freq/EV.
 */
export function generateFlowNodes(scenario, selectedHand = 'A5s') {
  if (!scenario) {
    return { nodes: [], edges: [] }
  }

  const handEntry = getHandEntry(scenario, selectedHand)
  const handEv = handEntry?.ev ?? null
  const actions = scenario.available_actions ?? []

  const rootX = 360
  const rootY = 0
  const childY = 200
  const spacingX = 220
  const totalWidth = Math.max(0, actions.length - 1) * spacingX
  const startX = rootX - totalWidth / 2

  const nodes = [
    {
      id: 'root',
      type: 'action',
      position: { x: rootX, y: rootY },
      data: {
        label: `${scenario.position_hero} ${scenario.stack_bb}BB`,
        subtitle: formatPriorAction(scenario.prior_action),
        scenarioId: scenario.scenario_id,
        selectedHand,
        ev: handEv,
      },
    },
  ]

  const edges = []

  actions.forEach((action, index) => {
    const weight = handEntry?.weights?.[action.id] ?? 0
    const frequency = weight * 100
    const nodeId = `action-${action.id}`

    nodes.push({
      id: nodeId,
      type: 'outcome',
      position: { x: startX + index * spacingX, y: childY },
      data: {
        label: action.label,
        actionId: action.id,
        selectedHand,
        // Frequency for this action with the selected hand (0–100).
        frequency,
        // Scenario EV for the selected hand (matrix stores one EV per hand).
        ev: handEv,
        weight,
      },
    })

    edges.push({
      id: `e-root-${action.id}`,
      source: 'root',
      target: nodeId,
      label: `${frequency.toFixed(0)}% · EV ${formatEv(handEv)}`,
      type: 'smoothstep',
      animated: weight > 0,
    })
  })

  return { nodes, edges }
}

function formatEv(ev) {
  if (ev == null || Number.isNaN(Number(ev))) return '—'
  const value = Number(ev)
  const sign = value > 0 ? '+' : ''
  return `${sign}${value} bb`
}
