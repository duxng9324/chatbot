import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  role: 'user' | 'bot';
  message: string;
}

interface UseChatbotProps {
  userId?: string;
  apiBaseUrl: string;
}

export function useChatbot({ userId, apiBaseUrl }: UseChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Hàm tải lịch sử chat (Chạy 1 lần khi userId thay đổi)
  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Lưu ý: Backend Python của bạn dùng prefix /ai
        const res = await fetch(`${apiBaseUrl}/ai/history/${userId}`);
        
        if (!res.ok) throw new Error('Không thể tải lịch sử chat');
        
        const data = await res.json();

        if (data.history && Array.isArray(data.history)) {
          // Map dữ liệu từ Backend -> Frontend
          const mappedHistory = data.history.map((msg: any) => ({
            role: msg.role === 'ai' ? 'bot' : 'user', // Backend trả về 'ai', Frontend dùng 'bot'
            message: msg.content,                     // Backend trả về 'content', Frontend dùng 'message'
          }));
          setMessages(mappedHistory);
        }
      } catch (err) {
        console.error("Lỗi tải history:", err);
        // Không set error state ở đây để tránh chặn người dùng chat tiếp
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, apiBaseUrl]);

  // 2. Hàm gửi tin nhắn
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    setError(null);
    
    // Optimistic Update: Hiển thị tin nhắn user ngay lập tức
    const userMsg: ChatMessage = { role: 'user', message: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          user_id: userId ?? "guest", // Fallback nếu không có userId
        }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      // Thêm phản hồi của bot vào list
      const botMsg: ChatMessage = { role: 'bot', message: data.reply };
      setMessages((prev) => [...prev, botMsg]);

    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
      setError("Không thể kết nối với server. Vui lòng thử lại.");
      
      // (Tùy chọn) Thêm tin nhắn lỗi vào giao diện chat
      setMessages((prev) => [
        ...prev, 
        { role: 'bot', message: "⚠️ *Hệ thống đang bận hoặc mất kết nối.*" }
      ]);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, userId]);

  // 3. Hàm xóa lịch sử (Optional)
  const clearChat = useCallback(() => {
      setMessages([]);
      // Gọi API xóa history nếu cần
      if(userId) {
          fetch(`${apiBaseUrl}/ai/reset/${userId}`, { method: 'DELETE' }).catch(console.error);
      }
  }, [apiBaseUrl, userId]);

  return { 
    messages, 
    sendMessage, 
    loading, 
    error,
    clearChat 
  };
}