import { useCallback, useEffect, useState } from 'react'
import { usePokerStore } from '../store/usePokerStore'

function generateRecommendedAction(effectiveStackBB, heroPosition) {
  const stack = effectiveStackBB
  const pos = heroPosition

  if (stack <= 15) {
    return `At ${stack}BB on the ${pos}, pressure is extreme. Prefer a polarized jam-or-fold plan over a small open—your stack can't absorb flops with a capped range.`
  }

  if (stack <= 30) {
    return `At ${stack}BB on the ${pos}, an open to 2.1x balances your range: you keep playability with strong hands while still threatening a shove on later streets. Mix in some linear raises and occasional jams so timing and sizing don't leak your holdings.`
  }

  return `At ${stack}BB on the ${pos}, a standard open (around 2.2–2.5x) keeps your range wide enough to pressure blinds without over-committing chips. Use deeper stacks to realize equity postflop rather than shoving light.`
}

function rollDelaySeconds() {
  return Number((2.5 + Math.random() * 2.5).toFixed(1))
}

export default function CoachPanel() {
  const effectiveStackBB = usePokerStore((s) => s.effectiveStackBB)
  const heroPosition = usePokerStore((s) => s.heroPosition)

  const advice = generateRecommendedAction(effectiveStackBB, heroPosition)

  const [delaySeconds, setDelaySeconds] = useState(rollDelaySeconds)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)

  const progress = Math.min(1, elapsed / delaySeconds)
  const remaining = Math.max(0, delaySeconds - elapsed)
  const ready = progress >= 1

  const reshuffleDelay = useCallback(() => {
    setDelaySeconds(rollDelaySeconds())
    setElapsed(0)
    setRunning(false)
  }, [])

  useEffect(() => {
    reshuffleDelay()
  }, [effectiveStackBB, heroPosition, reshuffleDelay])

  useEffect(() => {
    if (!running) return undefined

    const startedAt = performance.now()
    let frameId = 0

    const tick = (now) => {
      const next = (now - startedAt) / 1000
      if (next >= delaySeconds) {
        setElapsed(delaySeconds)
        setRunning(false)
        return
      }
      setElapsed(next)
      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [running, delaySeconds])

  return (
    <aside className="flex h-full w-full flex-col gap-5 border-l border-zinc-800/90 bg-zinc-950/80 p-4 sm:p-5">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-400/90">
          Coach
        </p>
        <h2 className="mt-1 font-mono text-sm text-zinc-100">
          {heroPosition} · {effectiveStackBB}bb
        </h2>
      </div>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Recommended line
        </p>
        <p className="text-sm leading-relaxed text-zinc-300">{advice}</p>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              Delay timer
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Wait{' '}
              <span className="font-mono tabular-nums text-amber-300">
                {delaySeconds.toFixed(1)}s
              </span>{' '}
              before acting to balance timing tells.
            </p>
          </div>
          <button
            type="button"
            onClick={reshuffleDelay}
            className="shrink-0 rounded-md border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
          >
            Reroll
          </button>
        </div>

        <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
          <svg viewBox="0 0 100 100" className="-rotate-90 h-full w-full">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-zinc-800"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress)}`}
              className={ready ? 'text-emerald-400' : 'text-amber-400'}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl tabular-nums text-zinc-100">
              {ready ? 'Go' : remaining.toFixed(1)}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-zinc-500">
              {ready ? 'act now' : 'sec left'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (ready) {
              reshuffleDelay()
              return
            }
            setElapsed(0)
            setRunning(true)
          }}
          className={`w-full rounded-md px-3 py-2 text-xs font-medium uppercase tracking-wide transition ${
            ready
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/30'
              : running
                ? 'cursor-default bg-zinc-800 text-zinc-500'
                : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30 hover:bg-amber-500/25'
          }`}
          disabled={running}
        >
          {ready ? 'New delay' : running ? 'Holding…' : 'Start delay'}
        </button>
      </section>
    </aside>
  )
}
