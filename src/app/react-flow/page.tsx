"use client";
import React from "react";
import Flow from "./_components/ReactFlowTree";
import { ReactFlowUserProvider } from "./context/ReactFlowUserInputContext";

function Page() {
  return (
    <main className="h-screen w-screen">
      <ReactFlowUserProvider>
        <Flow />
      </ReactFlowUserProvider>
    </main>
  );
}

export default Page;
