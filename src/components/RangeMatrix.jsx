import { usePokerStore } from '../store/usePokerStore'

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

function comboLabel(row, col) {
  const rowRank = RANKS[row]
  const colRank = RANKS[col]

  if (row === col) return `${rowRank}${colRank}`
  if (col > row) return `${rowRank}${colRank}s`
  return `${colRank}${rowRank}o`
}

export default function RangeMatrix() {
  const selectedCombo = usePokerStore((s) => s.selectedCombo)
  const setSelectedCombo = usePokerStore((s) => s.setSelectedCombo)

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
            const isPair = row === col

            return (
              <button
                key={label}
                type="button"
                title={label}
                onClick={() => setSelectedCombo(label)}
                className={[
                  'aspect-square rounded-sm text-center text-[9px] font-mono leading-none transition sm:text-[10px]',
                  'flex items-center justify-center',
                  'bg-zinc-900 text-zinc-400',
                  'hover:bg-zinc-800 hover:text-zinc-100',
                  isPair ? 'text-zinc-300' : '',
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.45)] ring-2 ring-emerald-400'
                    : 'ring-1 ring-zinc-800',
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
