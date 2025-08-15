'use client';

import React from 'react';

interface LoadingSpinnerProps {
  text?: string; // Nội dung hiển thị dưới spinner
  size?: number; // Kích thước icon (px)
}

export default function LoadingSpinner({ text = 'Đang tải dữ liệu, vui lòng chờ...', size = 32 }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-600">
      {/* Spinner */}
      <svg className="mb-4 animate-spin text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" width={size} height={size} viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"></path>
      </svg>

      {/* Text */}
      <p className="text-center text-sm md:text-base">{text}</p>
    </div>
  );
}
