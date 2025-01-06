// @ts-nocheck

import React from "react";
import { useReactFlowInput } from "../context/ReactFlowUserInputContext";

type Props = {
  nodes: unknown[];
  edges: unknown[];
};

function GenerateButton({ nodes, edges }: Props) {
  const { userInput } = useReactFlowInput();

  function handleGenerate() {
    const tree = buildTreeFromGraph(userInput, nodes, edges);
    localStorage.setItem("react-flow-tree", JSON.stringify(tree));
  }

  function buildTreeFromGraph(context, nodes, edges) {
    const nodeMap = new Map(
      nodes.map((node) => [node.id, { ...node, children: [] }])
    );

    edges.forEach((edge) => {
      const parent = nodeMap.get(edge.source);
      const child = nodeMap.get(edge.target);

      if (parent && child) {
        parent.children.push(child); // Add child to parent's children array
      }
    });

    nodes.forEach((node) => {
      if (context[node.id]) {
        nodeMap.get(node.id).title = context[node.id].title || "";
        nodeMap.get(node.id).description = context[node.id].description || "";
      }
    });

    const childNodeIds = new Set(edges.map((edge) => edge.target));
    const rootNodes = nodes.filter((node) => !childNodeIds.has(node.id));

    const tree = rootNodes.map((rootNode) =>
      buildNodeHierarchy(rootNode, nodeMap)
    );

    return tree;
  }

  function buildNodeHierarchy(node, nodeMap) {
    const { id, data, title, description, position, children } = nodeMap.get(
      node.id
    );
    return {
      id,
      data,
      title,
      description,
      position,
      children: children.map((child) => buildNodeHierarchy(child, nodeMap)),
    };
  }

  return (
    <button
      onClick={() => handleGenerate()}
      className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
    >
      Generate
    </button>
  );
}

export default GenerateButton;
