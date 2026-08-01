import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { TableNode } from "~/components/SchemaDiagram/TableNode"
import { ForeignKeyEdge } from "~/components/SchemaDiagram/ForeignKeyEdge"
import { useSchemaDiagram, LOADING_MESSAGES } from "./useSchemaDiagram"

const nodeTypes = {
   tableNode: TableNode,
}

const edgeTypes = {
   foreignKey: ForeignKeyEdge,
}

export function SchemaDiagram() {
   const {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      loadingPhase,
      currentTheme,
      setReactFlowInstance,
      handleRelayout,
   } = useSchemaDiagram()

   if (loadingPhase !== "done") {
      return (
         <div className="flex h-full items-center justify-center bg-bg-primary">
            <div className="h-6 w-6 rounded-full border-[3px] border-accent/30 border-t-accent animate-spin" />
            <span className="ml-3 text-text-muted">{LOADING_MESSAGES[loadingPhase]}</span>
         </div>
      )
   }

   return (
      <div className="relative h-full w-full react-diagram-wrapper bg-bg-primary">
         <style>{`
            .react-diagram-wrapper {
               --xy-background-color: transparent;
               --xy-controls-button-background-color: ${currentTheme.colors.surface};
               --xy-controls-button-background-color-hover: ${currentTheme.colors.surface2};
               --xy-controls-button-color: ${currentTheme.colors.text};
               --xy-controls-button-color-hover: ${currentTheme.colors.text};
               --xy-controls-button-border-color: ${currentTheme.colors.border};
               --xy-minimap-background-color: ${currentTheme.colors.surface};
            }
            .react-diagram-wrapper .react-flow {
               background-color: transparent !important;
            }
            .react-diagram-wrapper .react-flow__minimap {
               background-color: ${currentTheme.colors.surface};
               border: 1px solid ${currentTheme.colors.border};
               border-radius: 4px;
            }
            .react-diagram-wrapper .react-flow__controls-button {
               background-color: ${currentTheme.colors.surface};
               border-bottom: 1px solid ${currentTheme.colors.border};
               fill: ${currentTheme.colors.text};
            }
            .react-diagram-wrapper .react-flow__controls-button:hover {
               background-color: ${currentTheme.colors.surface2};
            }
            .react-flow__node {
               transition: transform 0.3s ease;
            }
         `}</style>
         <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            colorMode={currentTheme.monaco.base === "vs-dark" ? "dark" : "light"}
            style={{ backgroundColor: "transparent" }}
            fitView
            minZoom={0.1}
            onInit={setReactFlowInstance}
         >
            <Background color={currentTheme.colors.border} gap={24} />
            <Controls className="bg-bg-secondary border border-border" />
            <MiniMap
               nodeStrokeColor={currentTheme.colors.border}
               nodeColor={currentTheme.colors.surface2}
               maskColor="rgba(0,0,0,0.4)"
            />
         </ReactFlow>
         <button
            onClick={handleRelayout}
            className="absolute bottom-4 right-4 z-50 rounded-lg border px-3 py-1.5 text-xs font-medium shadow-md transition-colors hover:bg-accent/10"
            style={{
               backgroundColor: currentTheme.colors.surface,
               borderColor: currentTheme.colors.border,
               color: currentTheme.colors.text,
            }}
            title="Re-run layout"
         >
            Re-layout
         </button>
      </div>
   )
}
