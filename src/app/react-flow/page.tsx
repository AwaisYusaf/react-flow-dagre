"use client";
import React from "react";
import Flow from "./_components/ReactFlowTree";
import { ReactFlowUserProvider } from "./context/ReactFlowUserInputContext";

type Props = {};

function Page({}: Props) {
  return (
    <main className="h-screen w-screen">
      <ReactFlowUserProvider>
        <Flow />
      </ReactFlowUserProvider>
    </main>
  );
}

export default Page;
