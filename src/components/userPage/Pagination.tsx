'use client';
import { scrollToTopInstantly } from '@/utils/scrollToTop';
import React from 'react';
import { Button } from 'react-daisyui';
import { IoIosArrowDropleft, IoIosArrowDropright } from 'react-icons/io';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onNextPage, onPrevPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex flex-row items-center justify-center gap-x-10 px-2 text-primary">
      <div className="text-primary">
        {currentPage > 1 ? (
          <Button
            className="rounded-md p-1 shadow-headerMenu shadow-gray-50"
            color="primary"
            size="sm"
            // disabled={currentPage === 1}
            onClick={() => {
              onPrevPage();
              scrollToTopInstantly();
            }}
          >
            <span className="flex items-center justify-center gap-1">
              <IoIosArrowDropleft className="text-xl" /> Trang Trước
            </span>
          </Button>
        ) : (
          <div className="h-[36px] w-[120px]"></div>
        )}
      </div>

      <div className="mx-2 flex flex-row items-center justify-center text-primary">
        <p>{currentPage}</p> / <p>{totalPages}</p>
      </div>

      <div className="text-primary">
        {currentPage < totalPages ? (
          <Button
            className="rounded-md p-1 shadow-headerMenu shadow-gray-50"
            color="primary"
            size="sm"
            // disabled={currentPage === totalPages}
            onClick={() => {
              onNextPage();
              scrollToTopInstantly();
            }}
          >
            <span className="flex items-center justify-center gap-1">
              Trang Tiếp <IoIosArrowDropright className="text-xl" />
            </span>
          </Button>
        ) : (
          <div className="h-[36px] w-[120px]"></div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
