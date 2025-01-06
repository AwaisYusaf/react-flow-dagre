import { Handle, NodeToolbar, Position } from "@xyflow/react";

export const CustomNode = ({
  data,
}: {
  data: {
    label: string;
    description: string;
    isMobileScreen: boolean;
    toolbarPosition: any;
  };
}) => {
  function addChildNode() {}
  return (
    <div>
      <NodeToolbar isVisible={true} position={data.toolbarPosition}>
        <div className="flex items-center space-x-2 text-xs">
          <button className="bg-gray-300 rounded-md px-1.5 py-1">Remove</button>
          <button
            className="bg-gray-300 rounded-md px-1.5 py-1"
            onClick={addChildNode}
          >
            Add Child Node
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
          data.isMobileScreen ? "min-h-80 min-w-20" : "min-h-60 min-w-80"
        }`}
      >
        <input
          className="border-2 px-2 border-gray-300 rounded-md"
          placeholder="Page Title"
        />

        <textarea
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
