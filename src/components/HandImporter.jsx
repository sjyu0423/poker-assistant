import { useState } from 'react'
import { usePokerStore } from '../store/usePokerStore'
import { parseHandHistory } from '../utils/handParser'

export default function HandImporter() {
  const setImportedHand = usePokerStore((s) => s.setImportedHand)
  const importedHand = usePokerStore((s) => s.importedHand)

  const [rawText, setRawText] = useState('')
  const [error, setError] = useState(null)

  const handleAnalyze = () => {
    setError(null)

    try {
      const parsed = parseHandHistory(rawText)

      if (!parsed?.handId && (!parsed?.players || parsed.players.length === 0)) {
        setError('Invalid hand history format')
        setImportedHand(null)
        return
      }

      setImportedHand(parsed)
    } catch {
      setError('Invalid hand history format')
      setImportedHand(null)
    }
  }

  return (
    <section className="flex w-full flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Hand importer
        </p>
        {importedHand?.handId ? (
          <p className="font-mono text-[11px] text-emerald-400/90">
            #{importedHand.handId}
          </p>
        ) : null}
      </div>

      <textarea
        value={rawText}
        onChange={(e) => {
          setRawText(e.target.value)
          if (error) setError(null)
        }}
        placeholder="Paste poker site hand history here…"
        spellCheck={false}
        className="min-h-40 w-full resize-y rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-xs leading-relaxed text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30"
      />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          className="rounded-md bg-emerald-500/15 px-3 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-500/30 transition hover:bg-emerald-500/25"
        >
          Analyze Hand
        </button>

        {error ? (
          <p
            role="alert"
            className="rounded-md bg-red-500/15 px-2.5 py-1.5 text-xs text-red-300 ring-1 ring-red-500/40"
          >
            Invalid hand history format
          </p>
        ) : null}
      </div>
    </section>
  )
}
