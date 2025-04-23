import ReactFlow, { Background, Controls, applyNodeChanges, NodeChange } from 'reactflow';
import 'reactflow/dist/style.css';

import { Node, Edge } from 'reactflow';
import { getAzureDiagram } from '../../api/azureDiagram';
import { useEffect, useState, useMemo } from 'react';
import { useMsal } from "@azure/msal-react";
import FlowCustomNode from './FlowCustomNode';


import CloudIcon     from '@mui/icons-material/Cloud';



const AzureArchitectureDiagram = () => {


    
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const { instance } = useMsal();

    const nodeTypes = useMemo(
        () => ({
            custom: FlowCustomNode,
        }),
        []
    );

    useEffect(() => {
        const rfRoot = document.querySelector('.react-flow') as HTMLElement;
        if (!rfRoot) return;

        let el: HTMLElement | null = rfRoot;
        while (el) {
            const style = getComputedStyle(el);
            if (
                style.overflow === 'hidden' ||
                style.pointerEvents === 'none' ||
                style.zIndex === '0'
            ) {
                console.warn('⚠️ Potential interfering parent:', el);
                console.log('Style:', style);
            }
            el = el.parentElement;
        }
    }, []);

    useEffect(() => {
        const fetchDiagramData = async () => {
            try {
                await instance.initialize(); // Ensure MSAL instance is initialized
                const data = await getAzureDiagram(instance);

                // Ensure nodes are draggable and use the custom node type
                const updatedNodes = data.nodes.map((node: Node) => ({
                    ...node,
                    type: 'custom',
                    draggable: true,
                }));

                setNodes(updatedNodes);
                setEdges(data.edges);
            } catch (error) {
                console.error('Error fetching Azure diagram data:', error);
            }
        };

        fetchDiagramData();
    }, [instance]);

    const handleNodesChange = (changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    };

    return (
        <div
            style={{
                height: '100%',
                width: '100%',
                minHeight: '600px',
                position: 'relative',
                overflow: 'visible',
            }}
        >
            {nodes.length > 0 && (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    panOnDrag={true} // Allow dragging canvas
                    nodesDraggable={true} // Allow dragging nodes
                    onNodesChange={handleNodesChange}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            )}
        </div>
    );
};


export const icon = <CloudIcon />;
export default AzureArchitectureDiagram;
