'use client';
import { useState } from 'react';

type Message = { role: 'user' | 'bot'; text: string };

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([{ role: 'bot', text: 'Xin chào 👋, mình là ChatBot 7Teck. Bạn muốn tìm sản phẩm nào?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply || 'Xin lỗi, mình không hiểu câu hỏi 🤔' }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: '❌ Có lỗi xảy ra, vui lòng thử lại.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="z-[88888] w-full overflow-hidden rounded-lg border border-primary bg-[#fafafa] xl:w-[400px]">
      <div className="bg-primary-white">
        {/* Header */}
        <p className="bg-primary p-3 font-semibold text-white">7Teck.vn</p>
        {/* Messages */}
        <div className="h-96 space-y-2 overflow-y-auto p-3 text-sm">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] break-words rounded-lg p-2 ${
                m.role === 'user' ? 'ml-auto bg-primary text-white' : 'bg-primary-lighter text-primary'
              }`}
              dangerouslySetInnerHTML={{ __html: m.text }}
            />
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang xử lý...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            className="flex-1 p-2 text-sm outline-none"
          />
          <button onClick={sendMessage} className="bg-primary px-3 text-sm text-white" disabled={loading}>
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
