const position = { x: 0, y: 0 };
const edgeType = "smoothstep";

export const NODE_TYPES = {
  CUSTOM_NODE: "customNode",
} as const;

export const initialNodes = [
  {
    id: "A",
    data: { label: "Start: Visit Website" },
    position,
    type: NODE_TYPES.CUSTOM_NODE,
  },
  // {
  //   id: "B",
  //   data: { label: "Is Logged In?" },
  //   position,
  //   type: NODE_TYPES.CUSTOM_NODE,
  // },
  // {
  //   id: "C",
  //   data: { label: "View Product Catalog" },
  //   position,
  //   type: NODE_TYPES.CUSTOM_NODE,
  // },
  // {
  //   id: "D",
  //   data: { label: "Log In or Sign Up" },
  //   position,
  //   type: NODE_TYPES.CUSTOM_NODE,
  // },
];

export const initialEdges = [
  // { id: "eA-B", source: "A", target: "B", animated: true, type: edgeType },
];
