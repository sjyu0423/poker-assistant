import { useMemo } from 'react'
import { usePokerStore } from '../store/usePokerStore'
import { findScenario, getDominantActions } from '../utils/rangeEngine'

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

const ACTION_COLORS = {
  jam: '#ef4444',
  raise_2.1x: '#22c55e',
  call: '#3b82f6',
  fold: '#4b5563',
}

/** Fixed paint order: Jam → Raise → Call → Fold */
const GRADIENT_ACTIONS = [
  {
    color: ACTION_COLORS.jam,
    match: (key) => key.includes('jam') || key.includes('shove'),
  },
  {
    color: ACTION_COLORS['raise_2.1x'],
    match: (key) => key.includes('raise'),
  },
  {
    color: ACTION_COLORS.call,
    match: (key) => key === 'call',
  },
  {
    color: ACTION_COLORS.fold,
    match: (key) => key === 'fold',
  },
]

function comboLabel(row, col) {
  const rowRank = RANKS[row]
  const colRank = RANKS[col]

  if (row === col) return `${rowRank}${colRank}`
  if (col > row) return `${rowRank}${colRank}s`
  return `${colRank}${rowRank}o`
}

function sumMatchedWeight(weights, match) {
  return Object.entries(weights).reduce((sum, [key, value]) => {
    if (!match(key)) return sum
    return sum + (Number(value) || 0)
  }, 0)
}

/**
 * Build a hard-stop diagonal gradient from mixed-strategy weights.
 * Example: raise 0.6 + fold 0.4 → ['#22c55e 0% 60%', '#4b5563 60% 100%']
 */
function getGradientStyle(weights) {
  if (!weights) {
    return { backgroundColor: '#1f2937' }
  }

  const stops = []
  let cumulative = 0
  let lastColor = null

  for (const action of GRADIENT_ACTIONS) {
    const weight = sumMatchedWeight(weights, action.match)
    if (weight <= 0) continue

    const start = cumulative * 100
    cumulative += weight
    const end = cumulative * 100
    stops.push(`${action.color} ${start}% ${end}%`)
    lastColor = action.color
  }

  if (stops.length === 0) {
    return { backgroundColor: '#1f2937' }
  }

  if (stops.length === 1) {
    return { background: lastColor }
  }

  return {
    background: `linear-gradient(to bottom right, ${stops.join(', ')})`,
  }
}

export default function RangeMatrix() {
  const tableSize = usePokerStore((s) => s.tableSize)
  const effectiveStackBB = usePokerStore((s) => s.effectiveStackBB)
  const heroPosition = usePokerStore((s) => s.heroPosition)
  const currentAction = usePokerStore((s) => s.currentAction)
  const selectedCombo = usePokerStore((s) => s.selectedCombo)
  const setSelectedCombo = usePokerStore((s) => s.setSelectedCombo)

  const { dominantActions, scenario } = useMemo(() => {
    const nextScenario = findScenario(
      effectiveStackBB,
      heroPosition,
      currentAction,
    )
    return {
      scenario: nextScenario,
      dominantActions: getDominantActions(nextScenario),
    }
  }, [tableSize, effectiveStackBB, heroPosition, currentAction])

  return (
    <div className="w-full max-w-xl">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Range matrix
        </p>
        <p className="font-mono text-xs text-emerald-400/90">{selectedCombo}</p>
      </div>

      <div className="grid grid-cols-13 gap-1">
        {RANKS.map((_, row) =>
          RANKS.map((__, col) => {
            const label = comboLabel(row, col)
            const isActive = label === selectedCombo
            const dominant = dominantActions[label]
            const currentHandWeights = scenario?.matrix?.[label]?.weights ?? null

            return (
              <div
                key={label}
                role="button"
                tabIndex={0}
                title={dominant ? `${label} · ${dominant}` : label}
                onClick={() => setSelectedCombo(label)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedCombo(label)
                  }
                }}
                style={getGradientStyle(currentHandWeights)}
                className={[
                  'aspect-square rounded-sm font-mono',
                  'flex items-center justify-center text-xs border cursor-pointer hover:brightness-110',
                  'text-white/90 [text-shadow:0_1px_1px_rgba(0,0,0,0.55)]',
                  isActive
                    ? 'z-[1] border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.65)] ring-2 ring-emerald-300'
                    : 'border-black/30',
                ].join(' ')}
              >
                {label}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
