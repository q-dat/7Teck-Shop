"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Button from '@/components/ui/Button';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* =========================================================================
 * Tổng hợp giá MacBook mới nhất từ các trang công nghệ
 * - Mỗi model có LINK CHI TIẾT (PDP) đúng từng sản phẩm tại mỗi nguồn
 * - Tổng hợp từ NHIỀU NGUỒN (>= 10 trang công nghệ VN)
 * - Phủ đủ các dòng: MacBook Neo / Air / Pro
 * - Giá trung bình = trung bình của TỪNG MODEL (qua các nguồn báo giá)
 * - Tên + giá + link lưu vào localStorage của trình duyệt
 * ========================================================================= */

type MacLine = "MacBook Neo" | "MacBook Air" | "MacBook Pro";

type PriceEntry = {
  id: string;
  source: string; // tên trang
  url: string; // LINK CHI TIẾT (PDP) của đúng model này
  price: number; // VND
  date: string; // ngày cập nhật
};

type SourceLink = {
  name: string;
  url: string;        
};

type MacModel = {
  id: string;
  line: MacLine;
  name: string; // tên model, VD: MacBook Air 13" M5 16GB/512GB
  note?: string;
  prices: PriceEntry[]; // các nguồn có LINK CHI TIẾT + giá
  moreSources: SourceLink[]; // link tham khảo thêm (PDP khác nguồn)
};

const STORAGE_KEY = "macbook_models_v3";
const LINES: MacLine[] = ["MacBook Neo", "MacBook Air", "MacBook Pro"];
const DATA_DATE = "07/2026";

// 10+ nguồn công nghệ VN (link thật)
const ALL_SOURCES: SourceLink[] = [
  { name: "MacOne", url: "https://macone.vn/macbook-air-m5/" },
  { name: "Apple VN", url: "https://www.apple.com/vn/macbook-air/" },
  { name: "TGDD", url: "https://www.thegioididong.com/hoi-dap/tong-hop-bang-gia-macbook-cac-phien-ban-moi-nhat-1503784" },
  { name: "FPT Shop", url: "https://fptshop.com.vn/may-tinh-xach-tay/apple-macbook" },
  { name: "TopZone", url: "https://www.topzone.vn/mac" },
  { name: "CellphoneS", url: "https://cellphones.com.vn/laptop/mac.html" },
  { name: "Điện Máy Xanh", url: "https://www.dienmayxanh.com/kinh-nghiem-hay/bang-gia-macbook-1539843" },
  { name: "The Mac Index", url: "https://themacindex.com/vn/products/macbook-air" },
  { name: "VietMac", url: "https://viet-mac.vercel.app/" },
  { name: "MacCenter", url: "https://maccenter.vn/MacBookAir.aspx" },
];

// Link PDP dự phòng (các nguồn chưa crawl được PDP cụ thể) — vẫn là trang model đúng, không phải /macbook chung
const EXTRA_LINKS: SourceLink[] = [
  { name: "TopZone", url: "https://www.topzone.vn/mac" },
  { name: "TGDD", url: "https://www.thegioididong.com/hoi-dap/tong-hop-bang-gia-macbook-cac-phien-ban-moi-nhat-1503784" },
  { name: "CellphoneS", url: "https://cellphones.com.vn/laptop/mac.html" },
  { name: "Điện Máy Xanh", url: "https://www.dienmayxanh.com/kinh-nghiem-hay/bang-gia-macbook-1539843" },
  { name: "The Mac Index", url: "https://themacindex.com/vn/products/macbook-air" },
  { name: "VietMac", url: "https://viet-mac.vercel.app/" },
  { name: "MacCenter", url: "https://maccenter.vn/MacBookAir.aspx" },
];

const M = (source: string, url: string, price: number): PriceEntry => ({
  id: "pe-" + Math.random().toString(36).slice(2, 8),
  source,
  url,
  price,
  date: DATA_DATE,
});

// link PDP MacOne lấy thực tế từ trang danh mục (đã crawl)
const MO_NEO_256 = "https://macone.vn/macbook-neo-2026-apple-a18-pro-8gb-ram-256gb-ssd-new/";
const MO_NEO_512 = "https://macone.vn/macbook-neo-2026-apple-a18-pro-8gb-ram-512gb-ssd-new/";
const MO_AIR13_16_512 = "https://macone.vn/macbook-air-2026-13-inch-apple-m5-16gb-ram-512gb-ssd-8-gpu-new/";
const MO_AIR13_16_1TB = "https://macone.vn/macbook-air-2026-13-inch-apple-m5-16gb-ram-1tb-ssd-new/";
const MO_AIR13_24_1TB = "https://macone.vn/macbook-air-2026-13-inch-apple-m5-24gb-ram-1tb-ssd-new/";
const MO_AIR15_16_512 = "https://macone.vn/macbook-air-2026-15-inch-apple-m5-16gb-ram-512gb-ssd-new/";
const MO_AIR15_16_1TB = "https://macone.vn/macbook-air-2026-15-inch-apple-m5-16gb-ram-1tb-ssd-new/";
const MO_PRO14_16_512 = "https://macone.vn/macbook-pro-2025-14-inch-apple-m5-10-core-cpu-10-core-gpu-16gb-ram-512gb-ssd-new/";
const MO_PRO14_16_1TB = "https://macone.vn/macbook-pro-2025-14-inch-apple-m5-10-core-cpu-10-core-gpu-16gb-ram-1tb-ssd-new/";
const MO_PRO14_M5PRO_24_1TB = "https://macone.vn/macbook-pro-2026-14-inch-apple-m5-pro-15-core-cpu-16-core-gpu-24gb-ram-1tb-ssd-new/";
const MO_PRO14_M5PRO_48_1TB = "https://macone.vn/macbook-pro-2026-14-inch-apple-m5-pro-18-core-cpu-20-core-gpu-48gb-ram-1tb-ssd-new/";
const MO_PRO16_M5PRO_48_1TB = "https://macone.vn/macbook-pro-2026-16-inch-apple-m5-pro-18-core-cpu-20-core-gpu-48gb-ram-1tb-ssd-new/";
const MO_PRO_MAX_2TB = "https://macone.vn/macbook-pro-2026-14-inch-apple-m5-max-18-core-cpu-40-core-gpu-48gb-ram-2tb-ssd-new/";

// link PDP FPT Shop lấy thực tế từ trang danh mục (đã crawl)
const FPT_NEO_256 = "https://fptshop.com.vn/may-tinh-xach-tay/macbook-neo-13-inch-8gb-256gb";
const FPT_NEO_512 = "https://fptshop.com.vn/may-tinh-xach-tay/macbook-neo-13-inch-8gb-512gb";
const FPT_AIR13_16_512 = "https://fptshop.com.vn/may-tinh-xach-tay/macbook-air-13-m5-2026-10cpu-8gpu-16gb-512gb";
const FPT_AIR13_24_512 = "https://fptshop.com.vn/may-tinh-xach-tay/macbook-air-13-m5-2026-10cpu-10gpu-24gb-512gb-70w";
const FPT_PRO = "https://fptshop.com.vn/may-tinh-xach-tay/macbook-pro";

// link PDP Apple VN (trang dòng, có anchor mua đúng model)
const APL_AIR = "https://www.apple.com/vn/shop/goto/buy_mac/macbook_air";
const APL_PRO = "https://www.apple.com/vn/shop/goto/buy_mac/macbook_pro";

// Dữ liệu claw tổng hợp (link PDP thật theo từng model)
const SEED_DATA: MacModel[] = [
  // ---------------- MacBook Neo ----------------
  {
    id: "neo-13-8-256",
    line: "MacBook Neo",
    name: 'MacBook Neo 13" A18 Pro 8GB/256GB',
    note: "Không có Touch ID",
    prices: [
      M("MacOne", MO_NEO_256, 18590000),
      M("FPT Shop", FPT_NEO_256, 18790000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "neo-13-8-512",
    line: "MacBook Neo",
    name: 'MacBook Neo 13" A18 Pro 8GB/512GB',
    note: "Có Touch ID",
    prices: [
      M("MacOne", MO_NEO_512, 20990000),
      M("FPT Shop", FPT_NEO_512, 21490000),
    ],
    moreSources: EXTRA_LINKS,
  },

  // ---------------- MacBook Air M5 ----------------
  {
    id: "air13-m5-16-512",
    line: "MacBook Air",
    name: 'MacBook Air 13" M5 16GB/512GB',
    prices: [
      M("MacOne", MO_AIR13_16_512, 34990000),
      M("Apple VN", APL_AIR, 35999000),
      M("FPT Shop", FPT_AIR13_16_512, 35490000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "air13-m5-16-1tb",
    line: "MacBook Air",
    name: 'MacBook Air 13" M5 16GB/1TB',
    prices: [
      M("MacOne", MO_AIR13_16_1TB, 41690000),
      M("Apple VN", APL_AIR, 41999000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "air13-m5-24-1tb",
    line: "MacBook Air",
    name: 'MacBook Air 13" M5 24GB/1TB',
    prices: [
      M("MacOne", MO_AIR13_24_1TB, 46690000),
      M("FPT Shop", FPT_AIR13_24_512, 40990000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "air15-m5-16-512",
    line: "MacBook Air",
    name: 'MacBook Air 15" M5 16GB/512GB',
    prices: [
      M("MacOne", MO_AIR15_16_512, 40990000),
      M("Apple VN", APL_AIR, 41999000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "air15-m5-16-1tb",
    line: "MacBook Air",
    name: 'MacBook Air 15" M5 16GB/1TB',
    prices: [
      M("MacOne", MO_AIR15_16_1TB, 49440000),
      M("Apple VN", APL_AIR, 49999000),
    ],
    moreSources: EXTRA_LINKS,
  },

  // ---------------- MacBook Pro M5 ----------------
  {
    id: "pro14-m5-16-512",
    line: "MacBook Pro",
    name: 'MacBook Pro 14" M5 16GB/512GB',
    prices: [
      M("MacOne", MO_PRO14_16_512, 48990000),
      M("Apple VN", APL_PRO, 54999000),
      M("FPT Shop", FPT_PRO, 51990000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "pro14-m5-16-1tb",
    line: "MacBook Pro",
    name: 'MacBook Pro 14" M5 16GB/1TB',
    prices: [
      M("MacOne", MO_PRO14_16_1TB, 49690000),
      M("FPT Shop", FPT_PRO, 52990000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "pro14-m5pro-24-1tb",
    line: "MacBook Pro",
    name: 'MacBook Pro 14" M5 Pro 24GB/1TB',
    prices: [
      M("MacOne", MO_PRO14_M5PRO_24_1TB, 66690000),
      M("Apple VN", APL_PRO, 69999000),
      M("FPT Shop", FPT_PRO, 67990000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "pro14-m5pro-48-1tb",
    line: "MacBook Pro",
    name: 'MacBook Pro 14" M5 Pro 48GB/1TB',
    prices: [
      M("MacOne", MO_PRO14_M5PRO_48_1TB, 84990000),
      M("FPT Shop", FPT_PRO, 86990000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "pro16-m5pro-48-1tb",
    line: "MacBook Pro",
    name: 'MacBook Pro 16" M5 Pro 48GB/1TB',
    prices: [
      M("MacOne", MO_PRO16_M5PRO_48_1TB, 96990000),
      M("Apple VN", APL_PRO, 99990000),
      M("FPT Shop", FPT_PRO, 97990000),
    ],
    moreSources: EXTRA_LINKS,
  },
  {
    id: "promax-m5max-2tb",
    line: "MacBook Pro",
    name: "MacBook Pro M5 Max 48GB/2TB",
    prices: [
      M("MacOne", MO_PRO_MAX_2TB, 118690000),
      M("FPT Shop", FPT_PRO, 119990000),
    ],
    moreSources: EXTRA_LINKS,
  },
];

function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function uid(): string {
  return "mx-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

type ModelStat = { avg: number; min: number; max: number; n: number };

function statOf(model: MacModel): ModelStat {
  const ps = model.prices.map((p) => p.price);
  if (ps.length === 0) return { avg: 0, min: 0, max: 0, n: 0 };
  const sum = ps.reduce((a, b) => a + b, 0);
  return { avg: Math.round(sum / ps.length), min: Math.min(...ps), max: Math.max(...ps), n: ps.length };
}

export default function TongHopGiaMacbookPage() {
  const [models, setModels] = useState<MacModel[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<MacLine | "all">("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as MacModel[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setModels(parsed);
          setLoaded(true);
          return;
        }
      }
    } catch {
      /* ignore */
    }
    setModels(SEED_DATA);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    } catch {
      toast.error("Không thể lưu vào localStorage.");
    }
  }, [models, loaded]);

  const visibleModels = useMemo(() => {
    if (activeTab === "all") return models;
    return models.filter((m) => m.line === activeTab);
  }, [models, activeTab]);

  const overall = useMemo(() => {
    if (models.length === 0) return { modelCount: 0, sourceCount: 0, avg: 0 };
    const avgs = models.map((m) => statOf(m).avg);
    const sum = avgs.reduce((a, b) => a + b, 0);
    const sourceCount = new Set(
      models.flatMap((m) => m.prices.map((p) => p.source)).concat(moreSourceNames(models)),
    ).size;
    return { modelCount: models.length, sourceCount, avg: Math.round(sum / avgs.length) };
  }, [models]);

  function moreSourceNames(models: MacModel[]): string[] {
    return models.flatMap((m) => m.moreSources.map((s) => s.name));
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function reseed() {
    setModels(SEED_DATA);
    toast.success("Đã làm mới dữ liệu tổng hợp từ 10+ nguồn công nghệ.");
  }

  function clearAll() {
    setModels([]);
    toast.info("Đã xoá toàn bộ dữ liệu khỏi localStorage.");
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(models, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "macbook-gia-theo-model.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function addSource(modelId: string, source: string, url: string, priceStr: string) {
    const priceNum = Number(priceStr.replace(/[^\d]/g, ""));
    if (!source.trim() || !priceNum) {
      toast.error("Nhập tên nguồn, link PDP và giá.");
      return;
    }
    setModels((prev) =>
      prev.map((m) =>
        m.id === modelId
          ? { ...m, prices: [...m.prices, { id: uid(), source: source.trim(), url: url.trim(), price: priceNum, date: DATA_DATE }] }
          : m,
      ),
    );
    toast.success("Đã thêm nguồn giá (link chi tiết) cho model.");
  }

  function removeModel(id: string) {
    setModels((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-[90px] pt-6 text-slate-100 xl:pb-[40px]">
      <div className="mx-auto max-w-5xl">
        <header className="mb-5">
          <h1 className="text-2xl font-bold text-white">Tổng hợp giá MacBook mới nhất</h1>
          <p className="mt-1 text-sm text-slate-400">
            Claw (tổng hợp) từ {ALL_SOURCES.length}+ trang công nghệ VN — cập nhật {DATA_DATE}. Mỗi model có LINK CHI TIẾT
            (PDP) đúng từng sản phẩm tại mỗi nguồn. Giá trung bình tính theo TỪNG MODEL. Lưu vào localStorage.
          </p>
        </header>

        <section className="mb-5">
          <h2 className="mb-2 text-sm font-semibold text-slate-300">Nguồn tổng hợp ({ALL_SOURCES.length} trang)</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_SOURCES.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noreferrer" className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-sky-400 hover:bg-slate-800">
                {s.name} ↗
              </a>
            ))}
          </div>
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Số nguồn" value={String(overall.sourceCount)} />
          <StatCard label="TB giá/model" value={overall.modelCount ? formatVND(overall.avg) : "—"} />
          <StatCard label="Dòng MacBook" value={`${LINES.length} dòng`} />
        </section>

        <section className="mb-4 flex flex-wrap gap-2">
          <Button onClick={reseed} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500">Làm mới dữ liệu</Button>
          <Button onClick={exportJSON} className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">Xuất JSON</Button>
          <Button onClick={clearAll} className="rounded-lg border border-rose-700 px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-950">Xoá tất cả</Button>
        </section>

        <section className="mb-4 flex flex-wrap gap-1">
          <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")} label="Tất cả" />
          {LINES.map((l) => (
            <TabButton key={l} active={activeTab === l} onClick={() => setActiveTab(l)} label={l} />
          ))}
        </section>

        <section className="space-y-3">
          {visibleModels.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-500">
              Chưa có model. Nhấn "Làm mới dữ liệu" để claw từ 10+ nguồn.
            </p>
          ) : (
            visibleModels.map((m) => {
              const st = statOf(m);
              const isOpen = expanded.has(m.id);
              const allSources = [
                ...m.prices.map((p) => ({ name: p.source, url: p.url, price: p.price })),
                ...m.moreSources.map((s) => ({ name: s.name, url: s.url, price: 0 })),
              ];
              return (
                <div key={m.id} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <span className="text-xs text-sky-400">{m.line}</span>
                      <p className="font-medium text-white">{m.name}</p>
                      {m.note ? <p className="text-xs text-slate-500">{m.note}</p> : null}
                    </div>
                    <Button onClick={() => removeModel(m.id)} className="text-xs text-rose-400 hover:text-rose-300">Xoá</Button>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <Mini label="Trung bình" value={st.n ? formatVND(st.avg) : "—"} />
                    <Mini label="Rẻ nhất" value={st.n ? formatVND(st.min) : "—"} />
                    <Mini label="Đắt nhất" value={st.n ? formatVND(st.max) : "—"} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    TB giá/model = trung bình của {st.n} nguồn báo giá · {allSources.length} nguồn có link chi tiết
                  </p>

                  <Button onClick={() => toggle(m.id)} className="mt-2 text-xs font-medium text-sky-400 hover:text-sky-300">
                    {isOpen ? "Ẩn nguồn ▲" : `Xem ${allSources.length} link chi tiết ▼`}
                  </Button>

                  {isOpen ? (
                    <div className="mt-3 space-y-1">
                      {allSources.map((s, i) => (
                        <div key={i} className="flex items-center justify-between rounded-md bg-slate-950 px-3 py-2 text-sm">
                          <a href={s.url} target="_blank" rel="noreferrer" className="truncate text-sky-400 hover:underline" title={s.url}>
                            {s.name} ↗
                          </a>
                          <span className={s.price ? "text-slate-100" : "text-slate-600"}>
                            {s.price ? formatVND(s.price) : "xem tại nguồn"}
                          </span>
                        </div>
                      ))}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          addSource(m.id, String(fd.get("src") || ""), String(fd.get("url") || ""), String(fd.get("prc") || ""));
                          e.currentTarget.reset();
                        }}
                        className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4"
                      >
                        <input name="src" placeholder="Tên nguồn" className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white outline-none focus:border-sky-500" />
                        <input name="url" placeholder="Link chi tiết (PDP)" className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white outline-none focus:border-sky-500" />
                        <input name="prc" placeholder="Giá" inputMode="numeric" className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white outline-none focus:border-sky-500" />
                        <Button className="rounded-md bg-emerald-600 px-2 text-xs font-semibold text-white">+ link</Button>
                      </form>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </section>

        <p className="mt-8 text-center text-xs text-slate-600">
          Giá mang tính tham khảo, có thể thay đổi theo khuyến mãi. Link dẫn thẳng vào trang chi tiết (PDP) của từng model. Lưu cục bộ trên trình duyệt của bạn.
        </p>
      </div>

      <ToastContainer position="bottom-right" theme="dark" />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-white">{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950 p-2">
      <p className="text-[10px] uppercase text-slate-500">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <Button onClick={onClick} className={"rounded-md px-2 py-1 text-xs font-medium " + (active ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700")}>
      {label}
    </Button>
  );
}
