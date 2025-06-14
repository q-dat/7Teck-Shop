'use client';
import React from 'react';
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
          <button
            className="rounded-md p-2 shadow-headerMenu shadow-gray-50"
            color="primary"
            // disabled={currentPage === 1}
            onClick={onPrevPage}
          >
            <IoIosArrowDropleft className="text-xl" /> Trang Trước
          </button>
        ) : (
          <div className="h-[36px] w-[120px]"></div>
        )}
      </div>

      <div className="mx-2 flex flex-row items-center justify-center text-primary">
        <p>{currentPage}</p> / <p>{totalPages}</p>
      </div>

      <div className="text-primary">
        {currentPage < totalPages ? (
          <button
            className="rounded-md p-2 shadow-headerMenu shadow-gray-50"
            color="primary"
            // disabled={currentPage === totalPages}
            onClick={onNextPage}
          >
            Trang Tiếp <IoIosArrowDropright className="text-xl" />
          </button>
        ) : (
          <div className="h-[36px] w-[120px]"></div>
        )}
      </div>
    </div>
  );
};

export default Pagination;
