import React from "react";
import { useReactFlowInput } from "../context/ReactFlowUserInputContext";

type Props = {
  setNodes: React.Dispatch<any>;
  setEdges: React.Dispatch<any>;
};

function LoadTree({ setNodes, setEdges }: Props) {
  const { setUserInput } = useReactFlowInput();

  //   function loadStatesFromTree(tree) {
  //     const nodes = [];
  //     const edges = [];
  //     const context = {};

  //     // Helper function to traverse the tree and populate states
  //     function traverse(node, parentId = null) {
  //       // Add the current node to the nodes array
  //       nodes.push({
  //         id: node.id,
  //         data: node.data || {},
  //         position: node.position || { x: 0, y: 0 },
  //         type: "customNode",
  //       });

  //       // Add the node's context data
  //       if (node.title || node.description) {
  //         context[node.id] = {
  //           title: node.title || "",
  //           description: node.description || "",
  //         };
  //       }

  //       // Add an edge if there's a parent node
  //       if (parentId) {
  //         edges.push({
  //           id: `e-${parentId}-${node.is}`,
  //           source: parentId,
  //           target: node.id,
  //           type: "smoothstep",
  //         });
  //       }

  //       // Recursively traverse the children
  //       if (node.children && node.children.length > 0) {
  //         node.children.forEach((child) => traverse(child, node.id));
  //       }
  //     }

  //     tree.forEach((rootNode) => traverse(rootNode));

  //     return { nodes, edges, context };
  //   }

  function loadStatesFromTree(tree: any) {
    let nodes: any = [];
    let edges: any = [];
    const context = {};

    function traverse(node: any, parentId = null) {
      nodes.push({
        id: node.id,
        data: node.data || {},
        position: node.position || { x: 0, y: 0 },
        type: "customNode",
      });

      if (node.title || node.description) {
        //@ts-ignore
        context[node.id] = {
          title: node.title || "",
          description: node.description || "",
        };
      }

      if (parentId) {
        edges.push({
          type: "smoothstep",
          animated: true,
          source: parentId,
          target: node.id,
          id: `${parentId}-${node.id}`,
        });
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => traverse(child, node.id));
      }
    }

    tree.forEach((rootNode: any) => traverse(rootNode));

    const uniqueEdges = Array.from(
      new Set(edges.map((e: any) => JSON.stringify(e)))
    ).map((e: any) => JSON.parse(e));

    return {
      nodes: nodes.map((n: any) => {
        return { ...n, key: n.id };
      }),
      edges: uniqueEdges.map((e) => {
        return { ...e, key: e.id };
      }),
      context,
    };
  }

  function loadTree() {
    const tree = localStorage.getItem("react-flow-tree");
    if (tree) {
      const { nodes, edges, context } = loadStatesFromTree(JSON.parse(tree));
      setNodes(nodes);
      setEdges(edges);
      setUserInput(context);
    }
  }
  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
      onClick={() => loadTree()}
    >
      Load Tree
    </button>
  );
}

export default LoadTree;
