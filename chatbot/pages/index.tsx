"use client";

import dynamic from "next/dynamic";

const ChatbotWidget = dynamic(() => import("../components/ChatbotWidget"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <ChatbotWidget apiBaseUrl="http://localhost:8000/ai" userId={"user-1"} />
      hi cả nhà
    </>
  );
}
