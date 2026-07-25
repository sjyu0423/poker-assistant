import { useMemo } from 'react'
import { usePokerStore } from '../store/usePokerStore'
import { findScenario, getDominantActions } from '../utils/rangeEngine'

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

function comboLabel(row, col) {
  const rowRank = RANKS[row]
  const colRank = RANKS[col]

  if (row === col) return `${rowRank}${colRank}`
  if (col > row) return `${rowRank}${colRank}s`
  return `${colRank}${rowRank}o`
}

function dominantActionClass(action) {
  if (!action || action === 'fold') {
    return 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
  }
  if (action.includes('raise')) {
    return 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
  }
  if (action.includes('jam') || action.includes('shove')) {
    return 'bg-red-500 text-red-950 hover:bg-red-400'
  }
  if (action === 'call') {
    return 'bg-blue-500 text-blue-950 hover:bg-blue-400'
  }
  return 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'
}

export default function RangeMatrix() {
  const tableSize = usePokerStore((s) => s.tableSize)
  const effectiveStackBB = usePokerStore((s) => s.effectiveStackBB)
  const heroPosition = usePokerStore((s) => s.heroPosition)
  const currentAction = usePokerStore((s) => s.currentAction)
  const selectedCombo = usePokerStore((s) => s.selectedCombo)
  const setSelectedCombo = usePokerStore((s) => s.setSelectedCombo)

  const dominantActions = useMemo(() => {
    const scenario = findScenario(
      effectiveStackBB,
      heroPosition,
      currentAction,
    )
    return getDominantActions(scenario)
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

            return (
              <button
                key={label}
                type="button"
                title={dominant ? `${label} · ${dominant}` : label}
                onClick={() => setSelectedCombo(label)}
                className={[
                  'aspect-square rounded-sm text-center text-[9px] font-mono leading-none transition sm:text-[10px]',
                  'flex items-center justify-center',
                  dominantActionClass(dominant),
                  isActive
                    ? 'z-[1] shadow-[0_0_12px_rgba(52,211,153,0.65)] ring-2 ring-emerald-300'
                    : 'ring-1 ring-black/20',
                ].join(' ')}
              >
                {label}
              </button>
            )
          }),
        )}
      </div>
    </div>
  )
}
