'use client'

import React, { useMemo } from 'react'
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react'
import dagre from 'dagre'
import '@xyflow/react/dist/style.css'
import { SessionState } from '../../services/store'

/* ------------ COLORS ------------ */
const COLORS = {
  agent: '#FFFFFF',
  tool: '#32CD32',
  subAgent: '#FF8C00'
}

/* -------- NODE STYLE ---------- */
function styleNode(colorKey: keyof typeof COLORS) {
  return {
    background: COLORS[colorKey],
    borderRadius: 8,
    padding: 10,
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
    fontWeight: 600
  }
}

/* ---------- DAGRE LAYOUT ---------- */

const dagreGraph = new dagre.graphlib.Graph()
dagreGraph.setDefaultEdgeLabel(() => ({}))

const nodeWidth = 220
const nodeHeight = 60

function applyLayout(nodes: Node[], edges: Edge[]) {
  dagreGraph.setGraph({
    rankdir: 'TB', // top → bottom
    nodesep: 30,
    ranksep: 70
  })

  nodes.forEach(n => dagreGraph.setNode(n.id, { width: nodeWidth, height: nodeHeight }))

  edges.forEach(e => dagreGraph.setEdge(e.source, e.target))

  dagre.layout(dagreGraph)

  return nodes.map(node => {
    const pos = dagreGraph.node(node.id)
    node.position = {
      x: pos.x - nodeWidth / 2,
      y: pos.y - nodeHeight / 2
    }
    return node
  })
}

/* ---------- JSON → GRAPH ---------- */

function generateGraph(agent: string, json: SessionState) {
  const nodes: Node[] = []
  const edges: Edge[] = []
  const visited = new Set<string>()

  function traverseAgent(agentName: string) {
    if (!json[agentName] || visited.has(agentName)) return
    visited.add(agentName)

    const agent = json[agentName]

    // Agent node (main block)
    nodes.push({
      id: agentName,
      data: { label: agentName },
      style: styleNode('agent'),
      position: { x: 0, y: 0 }
    })

    // Tools & nested agents
    agent.tools.forEach(tool => {
      const toolId = `${agentName}.${tool.name}`
      const isSubAgent = tool.type === 'agent'

      // Node
      nodes.push({
        id: toolId,
        data: { label: tool.name },
        style: styleNode(isSubAgent ? 'subAgent' : 'tool'),
        position: { x: 0, y: 0 }
      })

      // Edge: agent → tool
      edges.push({
        id: `${agentName}->${toolId}`,
        source: agentName,
        target: toolId
      })

      if (isSubAgent) {
        // Recursively add sub-agent
        traverseAgent(tool.name)

        // Connect tool → sub-agent
        edges.push({
          id: `${toolId}->${tool.name}`,
          source: toolId,
          target: tool.name
        })
      }
    })
  }

  Object.keys(json)
    .filter(name => agent === name)
    .forEach(name => traverseAgent(name))

  return { nodes: applyLayout(nodes, edges), edges }
}

/* ---------- MAIN REACT COMPONENT ---------- */

const GraphRenderer: React.FC<{ data: SessionState; agent: string }> = ({ data, agent }) => {
  const graph = useMemo(() => generateGraph(agent, data), [data, agent])

  return (
    <div
      style={{
        width: '100%',
        height: '550px',
        border: '1px solid #333',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#0d1117'
      }}
    >
      <ReactFlow
        nodes={graph.nodes}
        edges={graph.edges}
        fitView
        defaultEdgeOptions={{
          type: 'straight',
          markerEnd: {
            type: 'arrowclosed',
            width: 18,
            height: 18
          },
          style: { stroke: '#bbb', strokeWidth: 1.3 }
        }}
        minZoom={0.4}
        maxZoom={1.8}
        zoomOnScroll
        panOnDrag
      >
        <Background color='#1b1f2a' gap={12} />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default GraphRenderer
