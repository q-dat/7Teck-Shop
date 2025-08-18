'use client';
import AnimatedCursor from 'react-animated-cursor';

export default function CustomCursor() {
  return (
    <AnimatedCursor
      innerSize={8} // kích thước vòng tròn nhỏ
      outerSize={32} // kích thước vòng tròn ngoài
      color="169,45,48" // màu sắc
      outerAlpha={0.3} // độ mờ của vòng tròn ngoài
      innerScale={0.7} // scale khi hover
      outerScale={2} // scale vòng ngoài khi hover
      showSystemCursor={true} // hiển thị con trỏ hệ thống
      trailingSpeed={5} // tốc độ theo sau
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
  );
}
