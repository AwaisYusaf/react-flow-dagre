"use client";
import { createContext, useContext, useState } from "react";

type ContextType = {
  userInput: any;
  setUserInput: Function;
};

const ReactFlowUserInputContext = createContext<ContextType>({
  userInput: {},
  setUserInput: () => {},
});

export const useReactFlowInput = () => {
  return useContext(ReactFlowUserInputContext);
};

export const ReactFlowUserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userInput, setUserInput] = useState({});
  return (
    <ReactFlowUserInputContext.Provider value={{ userInput, setUserInput }}>
      {children}
    </ReactFlowUserInputContext.Provider>
  );
};
