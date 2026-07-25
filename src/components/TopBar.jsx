import { usePokerStore } from '../store/usePokerStore'

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const fieldLabel =
  'text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500'

const selectBase =
  'h-9 min-w-[88px] cursor-pointer rounded-md border bg-zinc-900/80 px-2.5 font-mono text-sm text-zinc-100 outline-none transition focus:ring-1'

export default function TopBar() {
  const heroPosition = usePokerStore((s) => s.heroPosition)
  const villainPosition = usePokerStore((s) => s.villainPosition)
  const effectiveStackBB = usePokerStore((s) => s.effectiveStackBB)
  const setHeroPosition = usePokerStore((s) => s.setHeroPosition)
  const setVillainPosition = usePokerStore((s) => s.setVillainPosition)
  const setEffectiveStackBB = usePokerStore((s) => s.setEffectiveStackBB)

  const samePosition = heroPosition === villainPosition

  const clampStack = (value) => {
    const n = Number(value)
    if (Number.isNaN(n)) return effectiveStackBB
    return Math.min(100, Math.max(1, Math.round(n)))
  }

  return (
    <header className="border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <div className="mr-2 flex min-w-[140px] flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/90">
              Poker Assistant
            </span>
            <span className="font-mono text-[11px] text-zinc-500">
              GTO spot config
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="hero-position" className={fieldLabel}>
              Hero position
            </label>
            <select
              id="hero-position"
              value={heroPosition}
              onChange={(e) => setHeroPosition(e.target.value)}
              className={`${selectBase} border-blue-500/40 bg-blue-500/10 text-blue-100 focus:border-blue-400/70 focus:ring-blue-500/30`}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="villain-position" className={fieldLabel}>
              Villain position
            </label>
            <select
              id="villain-position"
              value={villainPosition}
              onChange={(e) => setVillainPosition(e.target.value)}
              className={`${selectBase} border-red-500/40 bg-red-500/10 text-red-100 focus:border-red-400/70 focus:ring-red-500/30`}
            >
              {POSITIONS.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          <div className="flex min-w-[220px] flex-1 flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="stack-input" className={fieldLabel}>
                Effective stack (BB)
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="stack-input"
                  type="number"
                  min={1}
                  max={100}
                  value={effectiveStackBB}
                  onChange={(e) =>
                    setEffectiveStackBB(clampStack(e.target.value))
                  }
                  className="h-9 w-[72px] rounded-md border border-zinc-700/80 bg-zinc-900/80 px-2.5 font-mono text-sm tabular-nums text-zinc-100 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30"
                />
                <span className="font-mono text-xs text-zinc-500">bb</span>
              </div>
            </div>
            <input
              id="stack-slider"
              type="range"
              min={1}
              max={100}
              value={effectiveStackBB}
              onChange={(e) => setEffectiveStackBB(Number(e.target.value))}
              aria-label="Effective stack slider"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-emerald-400 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
            />
            <div className="flex justify-between font-mono text-[10px] text-zinc-600">
              <span>1</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {samePosition ? (
          <p className="text-xs text-amber-300">
            Hero and Villain cannot share a position.
          </p>
        ) : null}
      </div>
    </header>
  )
}
