'use client';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import React from 'react';
import { Button } from 'react-daisyui';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onNextPage, onPrevPage }) => {
  if (totalPages <= 1) return null;

  const buttonClass =
    'flex min-w-[80px] items-center justify-center rounded-md border border-black bg-white text-black transition-all duration-300 hover:bg-black hover:text-white';
  const disabledClass = 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed hover:bg-gray-100 hover:text-gray-400 hover:border-gray-300';

  return (
    // THAY ĐỔI CHÍNH: Sticky container
    <div className="sticky bottom-[50px] z-50 w-full rounded-md border-t border-black/10 pb-2 pt-1 backdrop-blur-sm xl:bottom-0">
      <div className="flex flex-row items-center justify-center gap-x-6 px-2 text-black xl:gap-x-12">
        {/* --- Nút Trang Trước (Prev Page) --- */}
        <Button
          className={`${buttonClass} ${currentPage === 1 ? disabledClass : ''}`}
          size="xs"
          disabled={currentPage === 1}
          onClick={() => {
            onPrevPage();
            scrollToTopInstantly();
          }}
        >
          <span className="flex text-[10px] font-semibold uppercase tracking-wider">
            <MdArrowBackIosNew size={12} />
            Trước
          </span>
        </Button>

        {/* --- Hiển thị Trang Hiện tại / Tổng số Trang --- */}
        <div className="mx-2 flex flex-row items-baseline gap-1 text-black">
          <span className="text-lg font-extrabold xl:text-xl">{currentPage}</span>
          <span className="text-lg font-medium">/</span>
          <span className="text-base font-medium">{totalPages}</span>
        </div>

        {/* --- Nút Trang Tiếp (Next Page) --- */}
        <Button
          className={`${buttonClass} ${currentPage === totalPages ? disabledClass : ''}`}
          size="xs"
          disabled={currentPage === totalPages}
          onClick={() => {
            onNextPage();
            scrollToTopInstantly();
          }}
        >
          <span className="flex text-[10px] font-semibold uppercase tracking-wider">
            Tiếp <MdArrowForwardIos size={12} />
          </span>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
