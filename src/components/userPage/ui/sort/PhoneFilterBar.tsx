'use client';
import { useEffect, useState } from 'react';
import { FaSortAmountDown, FaMemory, FaHdd, FaPalette, FaFilter, FaUndo } from 'react-icons/fa';
import { PhoneFilterParams } from '@/types/type/products/phone/phone';
import { Button, Input, Select } from 'react-daisyui';

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

  const min = Number(filters.minPrice || 0);
  const max = Number(filters.maxPrice || PRICE_MAX_QUERY);

  const selectStyle =
    'w-full rounded-sm border border-primary-lighter bg-white pl-8 font-medium text-black focus:outline-none hover:border-primary placeholder:text-black';
  const iconStyle = 'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black';

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
    <div className="my-2 grid grid-cols-2 items-end gap-1 text-xs md:grid-cols-4 xl:grid-cols-7">
      {/* Sort */}
      <div className="relative">
        <FaSortAmountDown className={iconStyle} />
        <Select
          size="sm"
          className={selectStyle}
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
        </Select>
      </div>

      {/* Color */}
      <div className="relative">
        <FaPalette className={iconStyle} />
        <Input
          className={selectStyle}
          size="sm"
          list="color-options"
          type="text"
          placeholder="Màu sắc"
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

      {/* RAM */}
      <div className="relative">
        <FaMemory className={iconStyle} />
        <Select
          size="sm"
          className={selectStyle}
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
        </Select>
      </div>

      {/* Storage */}
      <div className="relative">
        <FaHdd className={iconStyle} />
        <Select
          size="sm"
          className={selectStyle}
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
        </Select>
      </div>

      {/* Price */}
      <div className="relative col-span-2 w-full md:col-span-3 xl:col-span-2">
        <div className="flex h-8 items-center rounded-sm border border-primary-lighter bg-white shadow-sm transition-all hover:border-primary">
          {/* Value */}
          <div className="flex w-full items-center justify-between px-1 font-medium text-black">
            <span className="pointer-events-none z-40">
              Từ <b>{min / 1000}tr</b>
            </span>
            <b className="pointer-events-none z-40">{max / 1000}tr</b>
          </div>

          {/* Sliders overlay */}
          <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 pl-14 pr-10">
            <div className="relative h-1 w-full rounded-full bg-primary-lighter">
              {/* Selected range */}
              <div
                className="absolute h-1 rounded-full bg-primary"
                style={{
                  left: `${(min / PRICE_MAX_QUERY) * 100}%`,
                  right: `${100 - (max / PRICE_MAX_QUERY) * 100}%`,
                }}
              />

              {/* Min */}
              <input
                type="range"
                min={0}
                max={PRICE_MAX_QUERY}
                step={500}
                value={min}
                onChange={(e) => {
                  const val = Math.min(Number(e.target.value), max - 500);
                  setFilters((prev) => ({
                    ...prev,
                    minPrice: String(val),
                  }));
                }}
                className="pointer-events-none absolute z-20 h-1 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary-lighter/30 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110"
              />

              {/* Max */}
              <input
                type="range"
                min={0}
                max={PRICE_MAX_QUERY}
                step={500}
                value={max}
                onChange={(e) => {
                  const val = Math.max(Number(e.target.value), min + 500);
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: String(val),
                  }));
                }}
                className="pointer-events-none absolute z-30 h-1 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-primary-lighter/30 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="col-span-2 flex justify-end gap-1 md:col-span-1">
        <Button
          size="xs"
          className="flex items-center gap-1 rounded-full border border-black bg-success font-medium text-white transition-all hover:bg-primary/90"
          onClick={applyFilters}
        >
          <FaFilter className="" />
          Áp dụng
        </Button>

        <Button
          size="xs"
          className="flex items-center gap-1 rounded-full bg-white font-medium text-black transition-all hover:bg-primary/5"
          onClick={resetFilters}
        >
          <FaUndo className="" />
          Đặt lại
        </Button>
      </div>
    </div>
  );
}
