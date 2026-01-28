'use client'

import { useState, useEffect, useRef } from "react";
// Giả sử bạn đã có component này để render markdown
// Nếu chưa có, thay thế bằng thẻ <p>{content}</p> ở dưới
import MarkdownMessage from "./MarkdownMessage"; 

export interface ChatbotWidgetProps {
  userId?: string;     // ID user (ví dụ: "guest" hoặc "user-1")
  apiBaseUrl: string;  // URL backend (ví dụ: "http://localhost:8000")
}

interface ChatMessage {
  role: "user" | "bot";
  message: string;
}

export default function ChatbotWidget({ userId = "guest", apiBaseUrl }: ChatbotWidgetProps) {
  // --- STATE ---
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Ref để auto scroll xuống cuối
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // --- 1. LOAD LỊCH SỬ CHAT KHI MỞ TRANG ---
  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/history/${userId}`);
        const data = await res.json();

        if (data.history && Array.isArray(data.history)) {
          // 🔄 QUAN TRỌNG: Map dữ liệu từ Backend -> Frontend
          // Backend trả về: { role: "ai", content: "..." }
          // Frontend cần:   { role: "bot", message: "..." }
          const mappedHistory = data.history.map((msg: any) => ({
            role: msg.role === "ai" ? "bot" : "user",
            message: msg.content
          }));
          setMessages(mappedHistory);
        }
      } catch (error) {
        console.error("Lỗi tải lịch sử:", error);
      }
    };

    fetchHistory();
  }, [userId, apiBaseUrl]);

  // --- 2. AUTO SCROLL ---
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, loading]);

  // --- 3. GỬI TIN NHẮN ---
  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userText = inputValue.trim();
    setInputValue(""); // Xóa ô nhập liệu

    // 1. Thêm tin nhắn User vào UI ngay lập tức
    const userMsg: ChatMessage = { role: "user", message: userText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 2. Gọi API Backend
      const res = await fetch(`${apiBaseUrl}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          user_id: userId,
        }),
      });

      const data = await res.json();

      // 3. Thêm phản hồi AI vào UI
      const botMsg: ChatMessage = { role: "bot", message: data.reply };
      setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      console.error("Lỗi chat:", error);
      const errorMsg: ChatMessage = { role: "bot", message: "⚠️ Mất kết nối server!" };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  // ================= RENDER UI =================

  // --- TRẠNG THÁI ĐÓNG (NÚT BẤM TRÒN) ---
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

  // --- TRẠNG THÁI MỞ (CỬA SỔ CHAT) ---
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
        
        {/* Tin nhắn chào mừng nếu chưa có lịch sử */}
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
              {/* Avatar Bot nhỏ bên cạnh tin nhắn */}
              {!isUser && (
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs mr-2 mt-1 shrink-0">
                      🤖
                  </div>
              )}

              {/* Bong bóng chat */}
              <div
                className={`
                  max-w-[85%]
                  px-3 py-2
                  rounded-2xl
                  text-sm
                  shadow-sm
                  ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  }
                `}
              >
                {/* Nếu chưa có component MarkdownMessage thì dùng thẻ p */}
                 <MarkdownMessage content={m.message} /> 
                 {/* <p className="whitespace-pre-wrap">{m.message}</p> */}
              </div>
            </div>
          );
        })}

        {/* Hiệu ứng đang gõ... */}
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
            onClick={handleSendMessage}
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