// src/components/AzureArchitectureDiagram.tsx
import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyNodeChanges,
  NodeChange,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useMsal } from '@azure/msal-react';
import { getAzureDiagram } from '../../api/azureDiagram';
import FlowCustomNode from './FlowCustomNode';
import { Cloud } from 'lucide-react';

const AzureArchitectureDiagram: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { instance } = useMsal();

  const nodeTypes = useMemo(() => ({ custom: FlowCustomNode }), []);

  // Detect potential CSS overflow/pointerIssues in parent elements
  useEffect(() => {
    const root = document.querySelector('.react-flow') as HTMLElement | null;
    let el = root;
    while (el) {
      const style = getComputedStyle(el);
      if (
        style.overflow === 'hidden' ||
        style.pointerEvents === 'none' ||
        style.zIndex === '0'
      ) {
        console.warn('⚠️ Potential interfering parent:', el, style);
      }
      el = el.parentElement;
    }
  }, []);

  // Fetch diagram data from Azure
  useEffect(() => {
    const fetchDiagramData = async () => {
      try {
        await instance.initialize();
        const data = await getAzureDiagram(instance);
        const updatedNodes = data.nodes.map((node: Node) => ({
          ...node,
          type: 'custom',
          draggable: true,
        }));
        setNodes(updatedNodes);
        setEdges(data.edges);
      } catch (err) {
        console.error('Error loading Azure diagram:', err);
      }
    };
    fetchDiagramData();
  }, [instance]);

  const handleNodesChange = (changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-visible">
      {nodes.length > 0 && (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          panOnDrag
          nodesDraggable
          onNodesChange={handleNodesChange}
          fitView
        >
          <Background className="bg-gray-100 dark:bg-gray-900" />
          <Controls className="bg-white dark:bg-gray-800 rounded p-1 shadow" />
        </ReactFlow>
      )}
    </div>
  );
};

// Icon for menu or legend display
export const icon = <Cloud className="w-6 h-6 text-blue-500" />;
export default AzureArchitectureDiagram;
