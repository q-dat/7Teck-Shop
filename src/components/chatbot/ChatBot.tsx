'use client';
import { useState } from 'react';
import { images } from '../../../public/images';
import Image from 'next/image';

type Message = { role: 'user' | 'bot'; text: string };
// Gợi ý fallback khi AI không chắc chắn
const GENERIC_FALLBACKS = [
  'Em chưa rõ ý Anh/Chị ạ. Anh/Chị mô tả chi tiết hơn giúp em được không?',
  'Để tư vấn sát nhu cầu, Anh/Chị cho em xin tầm giá và mục đích sử dụng (học tập, văn phòng, chơi game) nhé.',
  'Em có thể gợi ý nhanh theo danh mục: iPhone, Samsung, MacBook, tai nghe… Anh/Chị đang quan tâm dòng nào ạ?',
  'Anh/Chị muốn mình đề xuất theo tiêu chí: hiệu năng, pin, camera hay màn hình ạ?',
];

const ERROR_FALLBACKS = [
  '❌ Em gặp chút trục trặc kết nối. Anh/Chị vui lòng thử lại giúp em ạ.',
  '❌ Hệ thống đang bận. Em xin phép xử lý lại ngay, Anh/Chị vui lòng thao tác lại.',
  '❌ Có lỗi kỹ thuật tạm thời. Anh/Chị thử gửi lại nội dung giúp em nhé.',
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Xin chào Anh/Chị! Em là trợ lý AI của 7Teck.',
    },
    {
      role: 'bot',
      text: 'Em rất sẵn lòng hỗ trợ Anh/Chị.',
    },
  ]);
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
      const botText = (data?.reply && String(data.reply).trim()) || pick(GENERIC_FALLBACKS);

      setMessages((prev) => [...prev, { role: 'bot', text: botText }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: pick(ERROR_FALLBACKS) }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="w-full px-2 xl:px-0">
      <div className="z-[88888] w-full overflow-hidden rounded-lg border border-primary bg-[#fafafa] xl:w-[400px]">
        <div className="bg-primary-white">
          {/* Header */}
          <div className="flex items-center gap-1 bg-primary p-3">
            <Image src={images.Logo} alt="7Teck.vn" width={28} height={28} className="rounded-full bg-white p-1" />
            <span className="text-sm font-medium text-white">Trợ lý AI - 7Teck</span>
          </div>
          {/* Messages */}
          <div className="h-96 space-y-2 overflow-y-auto p-3 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex items-end gap-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <Image src={images.Logo} alt="7Teck.vn" width={22} height={22} className="mb-1 rounded-full bg-white p-[2px] shadow" />
                )}
                <div
                  className={`max-w-[80%] break-words rounded-lg p-2 ${
                    m.role === 'user' ? 'bg-primary text-white' : 'bg-primary-lighter text-primary'
                  }`}
                  dangerouslySetInnerHTML={{ __html: m.text }}
                />
              </div>
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
          <div className="flex border-b border-t">
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
          <div className="w-full text-center">
            <span className="text-[10px] text-gray-700">Thông tin chỉ mang tính tham khảo, được tư vấn bởi Trí Tuệ Nhân Tạo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
