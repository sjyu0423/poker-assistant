import { useCallback, useEffect, useMemo } from 'react'
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { usePokerStore } from '../store/usePokerStore'
import { findScenario, generateFlowNodes } from '../utils/rangeEngine'

function ActionNode({ data }) {
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-blue-500 bg-zinc-900 px-4 py-3 shadow-lg shadow-blue-500/10">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-zinc-900 !bg-blue-400"
      />
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-blue-400">
        Hero action
      </p>
      <p className="font-mono text-sm font-medium text-zinc-100">{data.label}</p>
      {data.subtitle ? (
        <p className="mt-1 text-xs text-zinc-500">{data.subtitle}</p>
      ) : null}
      {data.selectedHand ? (
        <p className="mt-1 font-mono text-[11px] text-blue-300/80">
          Hand {data.selectedHand}
          {data.ev != null ? ` · EV ${data.ev > 0 ? '+' : ''}${data.ev}` : ''}
        </p>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-zinc-900 !bg-blue-400"
      />
    </div>
  )
}

function VillainNode({ data }) {
  return (
    <div className="min-w-[180px] rounded-lg border-2 border-red-500 bg-zinc-900 px-4 py-3 shadow-lg shadow-red-500/10">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-zinc-900 !bg-red-400"
      />
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-red-400">
        Villain
      </p>
      <p className="font-mono text-sm font-medium text-zinc-100">{data.label}</p>
      {data.subtitle ? (
        <p className="mt-1 text-xs text-zinc-500">{data.subtitle}</p>
      ) : null}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2.5 !w-2.5 !border-zinc-900 !bg-red-400"
      />
    </div>
  )
}

function OutcomeNode({ data }) {
  return (
    <div className="min-w-[160px] rounded-lg border border-emerald-600/40 bg-emerald-600 px-4 py-3 shadow-lg shadow-emerald-500/20">
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2.5 !w-2.5 !border-emerald-800 !bg-emerald-200"
      />
      <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.14em] text-emerald-100/80">
        Outcome
      </p>
      <p className="font-mono text-sm font-semibold text-white">{data.label}</p>
      {data.frequency != null ? (
        <p className="mt-1 font-mono text-xs tabular-nums text-emerald-50">
          {Number(data.frequency).toFixed(0)}% freq
        </p>
      ) : null}
      {data.ev != null ? (
        <p className="font-mono text-xs tabular-nums text-emerald-50/90">
          EV {data.ev > 0 ? '+' : ''}
          {data.ev} bb
        </p>
      ) : null}
    </div>
  )
}

const nodeTypes = {
  action: ActionNode,
  villain: VillainNode,
  outcome: OutcomeNode,
}

function DecisionTreeCanvas() {
  const effectiveStackBB = usePokerStore((s) => s.effectiveStackBB)
  const heroPosition = usePokerStore((s) => s.heroPosition)
  const currentAction = usePokerStore((s) => s.currentAction)
  const selectedCombo = usePokerStore((s) => s.selectedCombo)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView } = useReactFlow()

  useEffect(() => {
    const scenario = findScenario(
      effectiveStackBB,
      heroPosition,
      currentAction,
    )
    const { nodes: nextNodes, edges: nextEdges } = generateFlowNodes(
      scenario,
      selectedCombo,
    )

    setNodes(nextNodes)
    setEdges(nextEdges)

    // Defer fitView until after React Flow applies the new elements.
    const frame = requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 200 })
    })

    return () => cancelAnimationFrame(frame)
  }, [
    effectiveStackBB,
    heroPosition,
    currentAction,
    selectedCombo,
    setNodes,
    setEdges,
    fitView,
  ])

  const onInit = useCallback((instance) => {
    instance.fitView({ padding: 0.2 })
  }, [])

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      style: { stroke: '#52525b' },
      labelStyle: { fill: '#a1a1aa', fontSize: 11 },
      labelBgStyle: { fill: '#18181b', fillOpacity: 0.9 },
    }),
    [],
  )

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onInit={onInit}
      fitView
      colorMode="dark"
      proOptions={{ hideAttribution: true }}
      className="bg-zinc-950"
    >
      <Background color="#3f3f46" gap={20} size={1} />
      <Controls className="!overflow-hidden !rounded-lg !border !border-zinc-700 !bg-zinc-900 !shadow-none" />
      <MiniMap
        className="!overflow-hidden !rounded-lg !border !border-zinc-700 !bg-zinc-900"
        nodeColor={(node) => {
          if (node.type === 'action') return '#3b82f6'
          if (node.type === 'villain') return '#ef4444'
          if (node.type === 'outcome') return '#059669'
          return '#71717a'
        }}
        maskColor="rgba(9, 9, 11, 0.75)"
      />
    </ReactFlow>
  )
}

export default function DecisionTree() {
  return (
    <div className="h-full min-h-[420px] w-full">
      <ReactFlowProvider>
        <DecisionTreeCanvas />
      </ReactFlowProvider>
    </div>
  )
}
