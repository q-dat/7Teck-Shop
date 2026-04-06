'use client';

import { useEffect, useState } from 'react';
import { FaSortAmountDown, FaMemory, FaHdd, FaPalette, FaFilter, FaUndo, FaMoneyBill } from 'react-icons/fa';
import { PhoneFilterParams } from '@/types/type/products/phone/phone';
import { Button, Input } from 'react-daisyui';

const PRICE_MAX_QUERY = 50_000;

const COLOR_OPTIONS = ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Tím'];

export default function PhoneFilterBar({
  activeFilters,
  onChange,
}: {
  activeFilters: PhoneFilterParams;
  onChange: (filters: PhoneFilterParams) => void;
}) {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    color: '',
    ram: '',
    storage: '',
  });

  useEffect(() => {
    setFilters({
      minPrice: activeFilters.minPrice ?? '',
      maxPrice: activeFilters.maxPrice ?? '',
      color: activeFilters.color ?? '',
      ram: activeFilters.ram ?? '',
      storage: activeFilters.storage ?? '',
    });
  }, [activeFilters]);

  const min = Number(filters.minPrice || 0);
  const max = Number(filters.maxPrice || PRICE_MAX_QUERY);

  return (
    <div className="flex items-center gap-1">
      {/* Sort */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          className="flex items-center gap-1 rounded-sm border border-transparent bg-primary-lighter p-1 text-xs font-medium shadow-headerMenu hover:border-primary"
          onClick={() =>
            onChange({
              ...activeFilters,
              sort: activeFilters.sort === 'newest' ? 'price_asc' : activeFilters.sort === 'price_asc' ? 'price_desc' : 'newest',
            })
          }
        >
          <FaSortAmountDown />
          {activeFilters.sort === 'price_asc' ? 'Giá tăng dần' : activeFilters.sort === 'price_desc' ? 'Giá giảm dần' : 'Mới nhất'}
        </Button>
      </div>

      {/* Filter Button */}
      <div className="relative">
        <Button
          size="sm"
          className="flex items-center gap-1 rounded-sm border border-transparent bg-primary-lighter p-1 text-xs font-medium shadow-headerMenu hover:border-primary"
          onClick={() => setOpen((v) => !v)}
        >
          <FaFilter />
          Bộ lọc
        </Button>

        {/* Popup */}
        {open && (
          <div className="absolute left-0 z-50 mt-1 w-72 space-y-3 rounded-lg border border-primary bg-white p-3">
            {/* Color */}
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                <FaPalette />
                <span>Màu sắc</span>
              </div>
              <Input
                placeholder="Nhập màu cần tìm"
                size="xs"
                className="w-full rounded-full border border-primary text-xs text-primary placeholder:text-black focus:outline-none"
                list="color-options"
                value={filters.color}
                onChange={(e) => setFilters((p) => ({ ...p, color: e.target.value }))}
              />
              <datalist id="color-options">
                {COLOR_OPTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* RAM */}
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                <FaMemory />
                <span>RAM</span>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                {['4GB', '6GB', '8GB', '12GB'].map((ram) => (
                  <button
                    key={ram}
                    onClick={() => setFilters((p) => ({ ...p, ram }))}
                    className={`rounded border p-0.5 ${filters.ram === ram ? 'bg-primary text-white' : ''} `}
                  >
                    {ram}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                <FaHdd />
                <span>Bộ nhớ</span>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                {['64GB', '128GB', '256GB', '512GB'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters((p) => ({ ...p, storage: s }))}
                    className={`rounded border p-0.5 ${filters.storage === s ? 'bg-primary text-white' : ''} `}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-center gap-1 text-sm font-semibold text-primary">
                <FaMoneyBill />
                <span>Giá</span>
              </div>
              <div className="text-xs">
                {min / 1000}tr - {max / 1000}tr
              </div>

              <input
                type="range"
                min={0}
                max={PRICE_MAX_QUERY}
                step={500}
                value={min}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    minPrice: e.target.value,
                  }))
                }
                className="w-full"
              />

              <input
                type="range"
                min={0}
                max={PRICE_MAX_QUERY}
                step={500}
                value={max}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    maxPrice: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                color="secondary"
                className="text-white"
                size="xs"
                onClick={() => {
                  onChange({ ...activeFilters, ...filters });
                  setOpen(false);
                }}
              >
                Áp dụng
              </Button>

              <Button
                size="xs"
                onClick={() => {
                  const empty = {
                    minPrice: '',
                    maxPrice: '',
                    color: '',
                    ram: '',
                    storage: '',
                  };
                  setFilters(empty);
                  onChange({ ...activeFilters, ...empty });
                }}
              >
                <FaUndo />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
