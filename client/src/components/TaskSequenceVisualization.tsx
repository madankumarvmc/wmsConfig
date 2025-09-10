import { useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  MiniMap,
  NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Package, List, ArrowRight, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { InventoryGroup, TaskSequenceConfiguration } from '../../../shared/schema';

interface TaskSequenceVisualizationProps {
  materialGroups: InventoryGroup[];
  taskSequenceConfigs: TaskSequenceConfiguration[];
}

interface MaterialGroupNodeData {
  id: number;
  name: string;
  storageIdentifiers: any;
  lineIdentifiers: any;
  description?: string;
}

interface TaskSequenceNodeData {
  id: number;
  materialGroupId: number;
  taskSequences: string[];
  shipmentAcknowledgment?: string;
}

// Custom node component for Material Groups
function MaterialGroupNode({ data }: NodeProps) {
  const nodeData = data as unknown as MaterialGroupNodeData;
  const storageIds = nodeData.storageIdentifiers || {};
  const lineIds = nodeData.lineIdentifiers || {};

  return (
    <Card className="w-72 border-2 border-blue-200 bg-blue-50 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-5 h-5 text-blue-600" />
          <div className="font-semibold text-blue-900 text-sm truncate">{nodeData.name}</div>
        </div>
        
        {/* Storage Identifiers */}
        {(storageIds.category || storageIds.uom || storageIds.bucket) && (
          <div className="mb-3">
            <div className="text-xs text-blue-700 mb-1 font-medium">Storage Identifiers:</div>
            <div className="flex flex-wrap gap-1">
              {storageIds.category && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  {storageIds.category}
                </Badge>
              )}
              {storageIds.uom && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  {storageIds.uom}
                </Badge>
              )}
              {storageIds.bucket && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                  {storageIds.bucket}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Line Identifiers */}
        {(lineIds.channel || lineIds.customer) && (
          <div>
            <div className="text-xs text-blue-700 mb-1 font-medium">Line Identifiers:</div>
            <div className="flex flex-wrap gap-1">
              {lineIds.channel && (
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                  {lineIds.channel}
                </Badge>
              )}
              {lineIds.customer && (
                <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 hover:bg-blue-100">
                  {lineIds.customer}
                </Badge>
              )}
            </div>
          </div>
        )}
        
        <Handle
          type="source"
          position={Position.Right}
          className="w-4 h-4 bg-blue-500 hover:bg-blue-600 border-2 border-white shadow-md transition-colors duration-200"
        />
      </CardContent>
    </Card>
  );
}

// Custom node component for Task Sequences
function TaskSequenceNode({ data }: NodeProps) {
  const nodeData = data as unknown as TaskSequenceNodeData;
  return (
    <Card className="w-[800px] border-2 border-green-200 bg-green-50 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <List className="w-5 h-5 text-green-600" />
          <div className="font-semibold text-green-900 text-sm">Task Sequence</div>
        </div>
        
        {nodeData.taskSequences && nodeData.taskSequences.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-green-700 mb-2 font-medium">Sequence Steps:</div>
            <div className="flex items-center justify-center gap-4 overflow-x-auto">
              {nodeData.taskSequences.map((task: string, index: number) => (
                <div key={index} className="flex items-center flex-shrink-0">
                  {/* Task Box */}
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-2">
                      {index + 1}
                    </div>
                    <div className="text-xs bg-green-100 px-3 py-2 rounded-md text-green-800 border border-green-200 font-medium min-w-20 text-center whitespace-nowrap">
                      {task.replace('OUTBOUND_', '').replace(/_/g, ' ')}
                    </div>
                  </div>
                  
                  {/* Arrow (except for last item) */}
                  {index < nodeData.taskSequences.length - 1 && (
                    <ChevronRight className="w-5 h-5 text-green-600 mx-3 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {nodeData.shipmentAcknowledgment && (
          <div>
            <div className="text-xs text-green-700 mb-1 font-medium">Acknowledgment:</div>
            <Badge variant="default" className="text-xs bg-green-600 hover:bg-green-700 transition-colors duration-200">
              {nodeData.shipmentAcknowledgment}
            </Badge>
          </div>
        )}
        
        <Handle
          type="target"
          position={Position.Left}
          className="w-4 h-4 bg-green-500 hover:bg-green-600 border-2 border-white shadow-md transition-colors duration-200"
        />
      </CardContent>
    </Card>
  );
}

const nodeTypes = {
  materialGroup: MaterialGroupNode,
  taskSequence: TaskSequenceNode,
};

export function TaskSequenceVisualization({ 
  materialGroups, 
  taskSequenceConfigs 
}: TaskSequenceVisualizationProps) {
  // Transform data into nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create Material Group nodes (left side)
    materialGroups.forEach((group, index) => {
      nodes.push({
        id: `mg-${group.id}`,
        type: 'materialGroup',
        position: { x: 50, y: index * 200 + 50 },
        data: {
          id: group.id,
          name: group.name,
          storageIdentifiers: group.storageIdentifiers,
          lineIdentifiers: group.lineIdentifiers,
          description: group.description,
        },
      });
    });

    // Create Task Sequence nodes (right side) and edges
    taskSequenceConfigs.forEach((config, index) => {
      const nodeId = `ts-${config.id}`;
      nodes.push({
        id: nodeId,
        type: 'taskSequence',
        position: { x: 450, y: index * 200 + 50 },
        data: {
          id: config.id,
          materialGroupId: config.inventoryGroupId,
          taskSequences: config.taskSequences || [],
          shipmentAcknowledgment: config.shipmentAcknowledgment || undefined,
        },
      });

      // Create edge from Material Group to Task Sequence
      edges.push({
        id: `edge-${config.inventoryGroupId}-${config.id}`,
        source: `mg-${config.inventoryGroupId}`,
        target: nodeId,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 },
        markerEnd: {
          type: 'arrowclosed',
          color: '#10b981',
        },
        label: 'configured for',
        labelStyle: { 
          fontSize: 12, 
          fontWeight: 500,
          fill: '#065f46',
        },
        labelBgStyle: { 
          fill: '#ecfdf5', 
          fillOpacity: 0.8 
        },
      });
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [materialGroups, taskSequenceConfigs]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Node clicked:', node);
    // Add subtle interaction feedback
    if (node.type === 'materialGroup') {
      console.log('Material Group Details:', node.data);
    } else if (node.type === 'taskSequence') {
      console.log('Task Sequence Details:', node.data);
    }
  }, []);

  // Empty state when no data
  if (materialGroups.length === 0 && taskSequenceConfigs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 border border-gray-200 rounded-lg">
        <div className="text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-600">No Data Available</p>
          <p className="text-sm text-gray-400 mt-2">
            Create Material Groups and Task Sequences to see their relationships
          </p>
        </div>
      </div>
    );
  }

  // Show message when no connections exist
  if (materialGroups.length > 0 && taskSequenceConfigs.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 border border-gray-200 rounded-lg">
        <div className="text-center">
          <ArrowRight className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-600">No Task Sequences Configured</p>
          <p className="text-sm text-gray-400 mt-2">
            Add Task Sequence configurations to see relationships with Material Groups
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 50, maxZoom: 1.2 }}
        attributionPosition="top-right"
        className="bg-gray-50"
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Controls 
          className="bg-white border border-gray-200 rounded-md shadow-sm" 
          position="bottom-left"
        />
        <MiniMap 
          className="bg-white border border-gray-200 rounded-md shadow-sm"
          position="bottom-right"
          nodeColor={(node) => {
            switch (node.type) {
              case 'materialGroup':
                return '#3b82f6';
              case 'taskSequence':
                return '#10b981';
              default:
                return '#6b7280';
            }
          }}
          nodeStrokeWidth={2}
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="#d1d5db" />
      </ReactFlow>
    </div>
  );
}