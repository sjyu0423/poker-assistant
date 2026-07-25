import TopBar from './components/TopBar'
import DecisionTree from './components/DecisionTree'
import CoachPanel from './components/CoachPanel'

function App() {
  return (
    <div className="flex min-h-svh flex-col bg-zinc-950 text-zinc-100">
      <TopBar />
      <main className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-[420px] min-w-0 flex-1">
          <DecisionTree />
        </div>
        <div className="w-full shrink-0 border-t border-zinc-800/90 lg:w-80 lg:border-t-0 xl:w-96">
          <CoachPanel />
        </div>
      </main>
    </div>
  )
}

export default App
