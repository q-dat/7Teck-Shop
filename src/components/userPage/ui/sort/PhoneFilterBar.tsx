'use client';

import { useEffect, useState } from 'react';
import { FaSortAmountDown, FaMemory, FaHdd, FaPalette, FaFilter, FaUndo, FaMoneyBill } from 'react-icons/fa';
import { PhoneFilterParams } from '@/types/type/products/phone/phone';
import { motion, AnimatePresence } from 'framer-motion';

const PRICE_MAX_QUERY = 50_000;
const COLOR_OPTIONS = ['Đen', 'Trắng', 'Xanh', 'Đỏ', 'Vàng', 'Tím'];
const RAM_OPTIONS = ['4GB', '6GB', '8GB', '12GB'];
const STORAGE_OPTIONS = ['64GB', '128GB', '256GB', '512GB'];

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

  const handleSortToggle = () => {
    const nextSort = activeFilters.sort === 'newest' ? 'price_asc' : activeFilters.sort === 'price_asc' ? 'price_desc' : 'newest';
    onChange({ ...activeFilters, sort: nextSort });
  };

  const handleApply = () => {
    onChange({ ...activeFilters, ...filters });
    setOpen(false);
  };

  const handleReset = () => {
    const emptyFilters = { minPrice: '', maxPrice: '', color: '', ram: '', storage: '' };
    setFilters(emptyFilters);
    onChange({ ...activeFilters, ...emptyFilters });
  };

  return (
    <div className="relative flex items-center gap-2 text-black">
      <button
        onClick={handleSortToggle}
        className="flex h-8 items-center gap-1.5 rounded-[4px] border border-black/10 bg-white px-3 text-[11px] font-semibold tracking-wide text-black/70 shadow-sm transition-all hover:border-primary/40 hover:text-primary"
      >
        <FaSortAmountDown size={12} />
        {activeFilters.sort === 'price_asc' ? 'GIÁ TĂNG DẦN' : activeFilters.sort === 'price_desc' ? 'GIÁ GIẢM DẦN' : 'MỚI NHẤT'}
      </button>

      <div className="relative">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-8 items-center gap-1.5 rounded-[4px] border px-3 text-[11px] font-semibold tracking-wide shadow-sm transition-all ${
            open
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-black/10 bg-white text-black/70 hover:border-primary/40 hover:text-primary'
          }`}
        >
          <FaFilter size={12} />
          BỘ LỌC
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-0 z-50 mt-2 w-[320px] space-y-5 rounded-md border border-primary/10 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black/50">
                  <FaPalette size={12} />
                  <span>Màu sắc</span>
                </div>
                <input
                  type="text"
                  placeholder="Nhập màu cần tìm..."
                  list="color-options"
                  value={filters.color}
                  onChange={(e) => setFilters((p) => ({ ...p, color: e.target.value }))}
                  className="w-full rounded-[4px] border border-black/10 bg-black/5 px-3 py-1.5 text-xs font-medium text-black/90 outline-none transition-all focus:border-primary/50 focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
                <datalist id="color-options">
                  {COLOR_OPTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black/50">
                  <FaMemory size={12} />
                  <span>RAM</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {RAM_OPTIONS.map((ram) => (
                    <button
                      key={ram}
                      onClick={() => setFilters((p) => ({ ...p, ram: p.ram === ram ? '' : ram }))}
                      className={`min-w-[40px] rounded-[3px] border px-2 py-1 text-[11px] font-medium transition-all ${
                        filters.ram === ram
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-black/10 bg-white text-black/70 hover:border-primary/40'
                      }`}
                    >
                      {ram}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black/50">
                  <FaHdd size={12} />
                  <span>Bộ nhớ</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {STORAGE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilters((p) => ({ ...p, storage: p.storage === s ? '' : s }))}
                      className={`min-w-[48px] rounded-[3px] border px-2 py-1 text-[11px] font-medium transition-all ${
                        filters.storage === s
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-black/10 bg-white text-black/70 hover:border-primary/40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-black/50">
                    <FaMoneyBill size={12} />
                    <span>Mức giá</span>
                  </div>
                  <span className="text-[11px] font-bold text-primary">
                    {min / 1000}tr - {max / 1000}tr
                  </span>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX_QUERY}
                    step={500}
                    value={min}
                    onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-primary outline-none"
                  />
                  <input
                    type="range"
                    min={0}
                    max={PRICE_MAX_QUERY}
                    step={500}
                    value={max}
                    onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/10 accent-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-black/5">
                <button
                  onClick={handleReset}
                  title="Đặt lại"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] bg-black/5 text-black/50 transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <FaUndo size={12} />
                </button>
                <button
                  onClick={handleApply}
                  className="h-8 w-full rounded-[4px] bg-primary text-[11px] font-bold uppercase tracking-wide text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}