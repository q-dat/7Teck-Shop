'use client';
import { useEffect, useState } from 'react';
import AnimatedCursor from 'react-animated-cursor';

export default function CustomCursor() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleMouseMove = () => {
      // Khi có chuyển động chuột thì hiện lại
      setVisible(true);
      // Reset timer
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setVisible(false);
      }, 3000); // 3 giây không di chuyển -> ẩn
    };

    // Lắng nghe sự kiện chuột
    window.addEventListener('mousemove', handleMouseMove);

    // Khởi tạo timer từ lúc bắt đầu
    timeout = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div
      className="hidden xl:block"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <AnimatedCursor
        innerSize={8} // kích thước vòng tròn nhỏ
        outerSize={32} // kích thước vòng tròn ngoài
        color="169,45,48" // màu sắc
        outerAlpha={0.1} // độ mờ của vòng tròn ngoài
        innerScale={0.7} // scale khi hover
        outerScale={2} // scale vòng ngoài khi hover
        showSystemCursor={true} // hiển thị con trỏ hệ thống
        trailingSpeed={2} // tốc độ theo sau
        outerStyle={{
          border: '1px solid #ffffff', // viền trắng
        }}
        innerStyle={{
          backgroundColor: '#a92d30',
          border: '1px solid #ffffff',
        }}
        clickables={[
          'a',
          'button',
          '.link', // class tuỳ chọn
          'input[type="text"]',
          'input[type="email"]',
          'input[type="submit"]',
        ]}
      />
    </div>
  );
}
