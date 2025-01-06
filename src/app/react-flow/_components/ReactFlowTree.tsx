"use client";
import React, { useCallback, useEffect, useState } from "react";

import { Handle, NodeToolbar, Position } from "@xyflow/react";

import {
  Background,
  ReactFlow,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import "../xy-theme.css";
import "@xyflow/react/dist/style.css";

import {
  initialNodes,
  initialEdges,
  NODE_TYPES,
} from "../_constants/initialElements";
import { useReactFlowInput } from "../context/ReactFlowUserInputContext";
import GenerateButton from "./GenerateButton";
import LoadTree from "./LoadTree";
import { PlusCircleIcon, Trash2Icon } from "lucide-react";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;
const flowKey = "example-flow";
let id = 1;
const getId = () => `${id++}`;

const getLayoutedElements = (nodes: any, edges: any, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node: any) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);

const distributeNodes = (inputNodes: any) => {
  const padding = 250;
  const gridCols = Math.ceil(Math.sqrt(inputNodes.length));

  return inputNodes.map((node: any, index: number) => {
    const col = index % gridCols;
    const row = Math.floor(index / gridCols);

    const randomOffsetX = Math.random() * 20 - 10;
    const randomOffsetY = Math.random() * 20 - 10;

    return {
      ...node,
      position: {
        x: col * padding + randomOffsetX,
        y: row * padding + randomOffsetY,
      },
    };
  });
};

const Flow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const [flowPosition, setFlowPosition] = useState<"TB" | "LR">("TB");
  const [rfInstance, setRfInstance] = useState<any>(null);
  const { setViewport, screenToFlowPosition } = useReactFlow();

  const addNewNode = useCallback(() => {
    const newNodeId = `${nodes.length + 1}`;

    const newNode = {
      id: newNodeId,
      data: { label: `Node ${newNodeId}` },
      type: NODE_TYPES.CUSTOM_NODE,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 300,
      },
    };
    setNodes((prev) => [...prev, newNode]);
  }, [nodes, setNodes]);

  const addChildNode = useCallback(
    (nodeId: any) => {
      const parentNode = nodes.find((node) => node.id === nodeId);
      const childrenIds = edges
        .filter((edge) => edge.source == nodeId)
        .map((edge) => edge.target);

      const prevChildren = nodes.filter((node) =>
        childrenIds.includes(node.id)
      );

      const newNodeId = `${nodes.length + 1}`;

      if (!parentNode) {
        return;
      }
      const newNode = {
        id: newNodeId,
        data: { label: `Node ${newNodeId}` },
        type: NODE_TYPES.CUSTOM_NODE,
        position: {
          x:
            prevChildren.length > 0
              ? prevChildren[prevChildren.length - 1].position.x + 200
              : parentNode?.position.x,
          y:
            prevChildren.length > 0
              ? prevChildren[prevChildren.length - 1].position.y
              : parentNode?.position.y + 200,
        },
      };

      setNodes((prev) => [...prev, newNode]);
      setEdges((prev) =>
        addEdge(
          {
            id: `e${nodeId}-${newNodeId}`,
            source: nodeId,
            target: newNodeId,
            type: "smoothstep",
            animated: true,
          },
          prev
        )
      );
    },
    [nodes, setNodes, setEdges]
  );

  //   const removeNode = useCallback(
  //     (nodeId: any) => {

  //       setNodes((prev) => prev.filter((node) => node.id !== nodeId));
  //       setEdges((prev) =>
  //         prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
  //       );
  //     },
  //     [setNodes, setEdges]
  //   );

  const removeNode = useCallback(
    (nodeId: string) => {
      setNodes((prevNodes) => {
        // Helper function to recursively find all child nodes
        const findChildren = (parentId: string, edges: any[]) => {
          const childNodes = edges
            .filter((edge) => edge.source === parentId)
            .map((edge) => edge.target);

          return childNodes.reduce(
            (acc, childId) => [
              ...acc,
              childId,
              ...findChildren(childId, edges),
            ],
            []
          );
        };

        // Collect all child nodes
        const edgesSnapshot = edges; // Ensure we have access to the current edges
        const childNodeIds = findChildren(nodeId, edgesSnapshot);

        // Nodes to delete include the parent and all its children
        const nodesToDelete = new Set([nodeId, ...childNodeIds]);

        return prevNodes.filter((node) => !nodesToDelete.has(node.id));
      });

      setEdges((prevEdges) => {
        // Remove edges connected to the deleted nodes
        return prevEdges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        );
      });
    },
    [setNodes, setEdges, edges]
  );

  const onConnect = useCallback(
    (params: any) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );

  const CustomNode = ({
    data,
    id,
  }: {
    data: {
      label: string;
      description: string;
      isMobileScreen: boolean;
      toolbarPosition: any;
    };
    id: any;
  }) => {
    const { userInput, setUserInput } = useReactFlowInput();

    return (
      <div>
        <NodeToolbar isVisible={true} position={data.toolbarPosition}>
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => removeNode(id)}
              className="bg-gray-100 hover:bg-gray-200 rounded-md px-1.5 py-1"
            >
              <Trash2Icon className="text-red-500 w-4 h-auto" />
            </button>
            <button
              className="bg-gray-100 hover:bg-gray-200 rounded-md px-1.5 py-1"
              onClick={() => addChildNode(id)}
            >
              <PlusCircleIcon className="text-green-600 w-4 h-auto" />
            </button>
          </div>
        </NodeToolbar>
        <Handle
          type="target"
          position={Position.Top}
          className="w-16 !bg-teal-500"
        />

        <div
          className={`flex flex-col space-y-2 ${
            data.isMobileScreen ? "min-h-40 min-w-10" : "min-h-32 min-w-40"
          }`}
        >
          <input
            className="border-2 px-2 border-gray-300 rounded-md"
            placeholder="Page Title"
            value={userInput[id]?.title || ""}
            onChange={(e) =>
              setUserInput({
                ...userInput,
                [id]: {
                  title: e.target.value || "",
                  description: userInput[id]?.description || "",
                },
              })
            }
          />

          <textarea
            value={userInput[id] ? userInput[id]?.description : ""}
            onChange={(e) =>
              setUserInput({
                ...userInput,
                [id]: {
                  title: userInput[id]?.title || "",
                  description: e.target.value,
                },
              })
            }
            placeholder="Description"
            className="flex-1 border-2 px-2 border-gray-300 rounded-md"
          />
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-16 !bg-teal-500"
        />
      </div>
    );
  };

  useEffect(() => {
    const distributedNodes = distributeNodes(initialNodes);
    setNodes(distributedNodes);
  }, []);

  const onLayout = useCallback(
    (direction: any) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    },
    [nodes, edges]
  );

  const nodeTypes = {
    customNode: CustomNode,
  };

  const onSave = useCallback(() => {
    if (rfInstance) {
      const flow = rfInstance.toObject();
      localStorage.setItem(flowKey, JSON.stringify(flow));
    }
  }, [rfInstance]);

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      const flow = JSON.parse(localStorage.getItem(flowKey) as string);

      if (flow) {
        const { x = 0, y = 0, zoom = 0.5 } = flow.viewport;
        setNodes(flow.nodes || []);
        setEdges(flow.edges || []);
        setViewport({ x, y, zoom });
      }
    };

    restoreFlow();
  }, [setNodes, setViewport]);

  const onConnectEnd = useCallback(
    (event: any, connectionState: any) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode as any));
        setEdges((eds) =>
          eds.concat({ id, source: connectionState.fromNode.id, target: id })
        );
      }
    },
    [screenToFlowPosition]
  );

  const clearBoard = () => {
    setNodes([]);
    setEdges([]);
  };

  const handleInputChange = useCallback(
    (nodeId: string, fieldName: string, value: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  [fieldName]: value, // Update only the field that changed
                },
              }
            : node
        )
      );
    },
    []
  );

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onInit={setRfInstance}
      onConnect={onConnect}
      //   onConnectEnd={onConnectEnd}
      connectionLineType={ConnectionLineType.SmoothStep}
      fitView
      style={{ backgroundColor: "#F7F9FB" }}
      defaultViewport={{
        x: 0,
        y: 0,
        zoom: 0.5,
      }}
    >
      <Panel position="top-right">
        <div className="flex items-center space-x-2">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            onClick={() => addNewNode()}
          >
            Add Screen
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            onClick={() => clearBoard()}
          >
            Clear Board
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
            onClick={() => {
              onLayout(flowPosition === "TB" ? "LR" : "TB");
              setFlowPosition(flowPosition === "TB" ? "LR" : "TB");
            }}
          >
            Layout {flowPosition === "TB" ? "(Left->Right)" : "(Top/Bottom)"}
          </button>

          <LoadTree setNodes={setNodes} setEdges={setEdges} />

          <GenerateButton nodes={nodes} edges={edges} />
        </div>
      </Panel>
      <Background />
    </ReactFlow>
  );
};

function FlowWithProvider(props: any) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
