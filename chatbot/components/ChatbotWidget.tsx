'use client'

import { useState, useEffect, useRef } from "react";
import MarkdownMessage from "./MarkdownMessage";
import { useChatbot } from "../hooks/useChatbot"; 

export interface ChatbotWidgetProps {
  userId?: string;
  apiBaseUrl: string;
}

export default function ChatbotWidget({ userId, apiBaseUrl }: ChatbotWidgetProps) {
  const { messages, sendMessage, loading } = useChatbot({ 
    userId, 
    apiBaseUrl 
  });

  // --- 2. UI STATE (Chỉ những gì liên quan đến hiển thị) ---
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- 3. AUTO SCROLL (Vẫn giữ ở UI vì liên quan đến DOM) ---
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  // --- 4. WRAPPER GỬI TIN ---
  const handleSendClick = () => {
    if (!inputValue.trim() || loading) return;
    
    // Gọi hàm từ hook
    sendMessage(inputValue.trim());
    
    // Xóa ô nhập liệu ngay lập tức
    setInputValue(""); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendClick();
  };

  // ================= RENDER UI (GIỮ NGUYÊN) =================

  // --- TRẠNG THÁI ĐÓNG ---
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 z-50 transition-transform hover:scale-110"
      >
        <span className="text-2xl">💬</span>
      </button>
    );
  }

  // --- TRẠNG THÁI MỞ ---
  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50 animate-fade-in-up font-sans">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 text-lg">
            🤖
          </div>
          <div>
            <div className="text-sm font-bold">Trợ lý du lịch</div>
            <div className="text-[10px] text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
        >
          ✕
        </button>
      </div>

      {/* MESSAGE LIST */}
      <div className="flex-1 px-3 py-4 overflow-y-auto bg-gray-50 space-y-4">
        
        {messages.length === 0 && !loading && (
           <div className="text-center text-xs text-gray-400 mt-4">
              👋 Chào bạn! Mình có thể giúp gì cho chuyến đi sắp tới?
           </div>
        )}

        {messages.map((m, index) => {
          const isUser = m.role === "user";
          return (
            <div
              key={index}
              className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                      🤖
                  </div>
              )}

              <div
                className={`
                  max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm
                  ${isUser 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}
                `}
              >
                 <MarkdownMessage content={m.message} /> 
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">🤖</div>
            <div className="px-3 py-2 rounded-2xl bg-white border border-gray-200 rounded-bl-none shadow-sm">
               <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
               </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1 py-1 border border-transparent focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập tin nhắn..."
            disabled={loading}
            className="flex-1 bg-transparent text-gray-700 text-sm px-3 py-2 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSendClick}
            disabled={!inputValue.trim() || loading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                inputValue.trim() && !loading 
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md" 
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            👉
          </button>
        </div>
      </div>
    </div>
  );
}