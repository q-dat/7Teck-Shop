'use client';
import { useEffect, useState } from 'react';
import { FaSortAmountDown, FaMemory, FaHdd, FaPalette, FaFilter, FaUndo } from 'react-icons/fa';
import { PhoneFilterParams } from '@/types/type/products/phone/phone';

interface PhoneFilterBarProps {
  activeFilters: PhoneFilterParams;
  onChange: (filters: PhoneFilterParams) => void;
}

const PRICE_MAX_QUERY = 50_000;

const COLOR_OPTIONS: readonly string[] = ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Tím'];

interface LocalFilters {
  minPrice: string;
  maxPrice: string;
  color: string;
  ram: string;
  storage: string;
}

export default function PhoneFilterBar({ activeFilters, onChange }: PhoneFilterBarProps) {
  const [filters, setFilters] = useState<LocalFilters>({
    minPrice: '',
    maxPrice: '',
    color: '',
    ram: '',
    storage: '',
  });

  /* Sync khi parent đổi filter (VD: đổi brand, reset từ ngoài) */
  useEffect(() => {
    setFilters({
      minPrice: activeFilters.minPrice ?? '',
      maxPrice: activeFilters.maxPrice ?? '',
      color: activeFilters.color ?? '',
      ram: activeFilters.ram ?? '',
      storage: activeFilters.storage ?? '',
    });
  }, [activeFilters.minPrice, activeFilters.maxPrice, activeFilters.color, activeFilters.ram, activeFilters.storage]);

  const applyFilters = () => {
    onChange({
      ...activeFilters,
      ...filters,
    });
  };

  const resetFilters = () => {
    const empty: LocalFilters = {
      minPrice: '',
      maxPrice: '',
      color: '',
      ram: '',
      storage: '',
    };

    setFilters(empty);

    onChange({
      ...activeFilters,
      ...empty,
    });
  };

  return (
    <div className="my-4 flex flex-wrap items-center gap-6">
      {/* Sort */}
      <div className="relative">
        <FaSortAmountDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary" />
        <select
          className="h-10 rounded-full bg-white pl-10 pr-6 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={activeFilters.sort ?? 'newest'}
          onChange={(e) =>
            onChange({
              ...activeFilters,
              sort: e.target.value as 'price_asc' | 'price_desc' | 'newest',
            })
          }
        >
          <option value="newest">Mới nhất</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Price Range */}
      <div className="flex min-w-[220px] flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-medium text-primary">
          <span>{Number(filters.minPrice || 0) / 1000} triệu</span>
          <span>{Number(filters.maxPrice || PRICE_MAX_QUERY) / 1000} triệu</span>
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="range"
            min={0}
            max={PRICE_MAX_QUERY}
            step={500}
            value={filters.minPrice || 0}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                minPrice: e.target.value,
              }))
            }
            className="range range-primary h-2"
          />

          <input
            type="range"
            min={0}
            max={PRICE_MAX_QUERY}
            step={500}
            value={filters.maxPrice || PRICE_MAX_QUERY}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: e.target.value,
              }))
            }
            className="range range-primary h-2"
          />
        </div>
      </div>

      {/* RAM */}
      <div className="relative">
        <FaMemory className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary" />
        <select
          className="h-10 rounded-full bg-white pl-10 pr-6 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.ram}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              ram: e.target.value,
            }))
          }
        >
          <option value="">RAM</option>
          <option value="4GB">4GB</option>
          <option value="6GB">6GB</option>
          <option value="8GB">8GB</option>
          <option value="12GB">12GB</option>
        </select>
      </div>

      {/* Storage */}
      <div className="relative">
        <FaHdd className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary" />
        <select
          className="h-10 rounded-full bg-white pl-10 pr-6 text-sm font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.storage}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              storage: e.target.value,
            }))
          }
        >
          <option value="">Bộ nhớ</option>
          <option value="64GB">64GB</option>
          <option value="128GB">128GB</option>
          <option value="256GB">256GB</option>
          <option value="512GB">512GB</option>
        </select>
      </div>

      {/* Color */}
      <div className="relative">
        <FaPalette className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-primary" />
        <input
          list="color-options"
          type="text"
          placeholder="Màu sắc"
          className="h-10 w-36 rounded-full bg-white pl-10 pr-4 text-sm font-medium text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={filters.color}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              color: e.target.value,
            }))
          }
        />
        <datalist id="color-options">
          {COLOR_OPTIONS.map((color) => (
            <option key={color} value={color} />
          ))}
        </datalist>
      </div>

      {/* Actions */}
      <div className="ml-auto flex gap-3">
        <button
          className="flex h-10 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-white transition-all hover:opacity-90"
          onClick={applyFilters}
        >
          <FaFilter className="text-xs" />
          Áp dụng
        </button>

        <button
          className="flex h-10 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-primary transition-all hover:bg-primary/5"
          onClick={resetFilters}
        >
          <FaUndo className="text-xs" />
          Đặt lại
        </button>
      </div>
    </div>
  );
}
