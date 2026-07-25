import { usePokerStore } from '../store/usePokerStore'

const POSITIONS = ['UTG', 'HJ', 'CO', 'BTN', 'SB', 'BB']

const fieldLabel =
  'text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500'

const controlBase =
  'rounded-md border border-zinc-700/80 bg-zinc-900/80 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30'

export default function TopBar() {
  const effectiveStackBB = usePokerStore((s) => s.effectiveStackBB)
  const heroPosition = usePokerStore((s) => s.heroPosition)
  const villainVpip = usePokerStore((s) => s.villainVpip)
  const villainPfr = usePokerStore((s) => s.villainPfr)
  const setEffectiveStackBB = usePokerStore((s) => s.setEffectiveStackBB)
  const setHeroPosition = usePokerStore((s) => s.setHeroPosition)
  const setVillainVpip = usePokerStore((s) => s.setVillainVpip)
  const setVillainPfr = usePokerStore((s) => s.setVillainPfr)
  const getExploitativeShift = usePokerStore((s) => s.getExploitativeShift)

  const shift = getExploitativeShift()
  const shiftStyles = {
    tighten: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
    widen: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
    standard: 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30',
  }

  const parseStat = (value, fallback) => {
    const n = Number(value)
    if (Number.isNaN(n)) return fallback
    return Math.min(100, Math.max(0, n))
  }

  return (
    <header className="border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end gap-x-6 gap-y-4 px-4 py-3 sm:px-6">
        <div className="mr-2 flex min-w-[140px] flex-col gap-0.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400/90">
            Poker Assistant
          </span>
          <span className="font-mono text-[11px] text-zinc-500">
            Eff. stack · pos · HUD
          </span>
        </div>

        <div className="flex min-w-[200px] flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="stack-slider" className={fieldLabel}>
              Effective stack
            </label>
            <span className="font-mono text-sm tabular-nums text-zinc-100">
              {effectiveStackBB}
              <span className="ml-1 text-zinc-500">bb</span>
            </span>
          </div>
          <input
            id="stack-slider"
            type="range"
            min={1}
            max={100}
            value={effectiveStackBB}
            onChange={(e) => setEffectiveStackBB(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-800 accent-emerald-400 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(16,185,129,0.25)]"
          />
          <div className="flex justify-between font-mono text-[10px] text-zinc-600">
            <span>1</span>
            <span>100</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="hero-position" className={fieldLabel}>
            Hero position
          </label>
          <select
            id="hero-position"
            value={heroPosition}
            onChange={(e) => setHeroPosition(e.target.value)}
            className={`${controlBase} h-9 min-w-[88px] cursor-pointer px-2.5 font-mono`}
          >
            {POSITIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="villain-vpip" className={fieldLabel}>
            Opp. VPIP
          </label>
          <div className="relative">
            <input
              id="villain-vpip"
              type="number"
              min={0}
              max={100}
              step={1}
              value={villainVpip}
              onChange={(e) =>
                setVillainVpip(parseStat(e.target.value, villainVpip))
              }
              className={`${controlBase} h-9 w-[72px] px-2.5 pr-6 font-mono tabular-nums`}
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
              %
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="villain-pfr" className={fieldLabel}>
            Opp. PFR
          </label>
          <div className="relative">
            <input
              id="villain-pfr"
              type="number"
              min={0}
              max={100}
              step={1}
              value={villainPfr}
              onChange={(e) =>
                setVillainPfr(parseStat(e.target.value, villainPfr))
              }
              className={`${controlBase} h-9 w-[72px] px-2.5 pr-6 font-mono tabular-nums`}
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">
              %
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className={fieldLabel}>Exploit</span>
          <div
            className={`flex h-9 items-center rounded-md px-3 font-mono text-xs uppercase tracking-wide ring-1 ${shiftStyles[shift]}`}
          >
            {shift}
          </div>
        </div>
      </div>
    </header>
  )
}
