import TopBar from './components/TopBar'
import RangeMatrix from './components/RangeMatrix'
import DecisionTree from './components/DecisionTree'
import CoachPanel from './components/CoachPanel'

function App() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-100">
      <TopBar />
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
