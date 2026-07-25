import { useState } from 'react'
import TopBar from './components/TopBar'
import RangeMatrix from './components/RangeMatrix'
import DecisionTree from './components/DecisionTree'
import CoachPanel from './components/CoachPanel'
import HandImporter from './components/HandImporter'

function App() {
  const [mode, setMode] = useState('manual')
  const isImport = mode === 'import'

  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-100">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/90 px-4 py-2 sm:px-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Mode
        </p>
        <div className="inline-flex rounded-md border border-zinc-700/80 bg-zinc-900/80 p-0.5">
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={[
              'rounded px-3 py-1.5 text-xs font-medium transition',
              !isImport
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-400 hover:text-zinc-200',
            ].join(' ')}
          >
            Manual Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('import')}
            className={[
              'rounded px-3 py-1.5 text-xs font-medium transition',
              isImport
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'text-zinc-400 hover:text-zinc-200',
            ].join(' ')}
          >
            Import Mode
          </button>
        </div>
      </div>

      {isImport ? (
        <div className="border-b border-zinc-800/90 p-4 sm:px-6">
          <HandImporter />
        </div>
      ) : (
        <TopBar />
      )}

      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-zinc-800/90 p-4 lg:w-[420px] lg:border-b-0 lg:border-r xl:w-[460px]">
          <RangeMatrix />
          <CoachPanel />
        </aside>
        <section className="min-h-[420px] min-w-0 flex-1">
          <DecisionTree />
        </section>
      </main>
    </div>
  )
}

export default App
