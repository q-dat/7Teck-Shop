'use client';
import { useCallback, useEffect, useState } from 'react';
import ErrorLoading from '@/components/orther/error/ErrorLoading';
import HeaderResponsive from '@/components/userPage/ui/HeaderResponsive';
import { IGallery } from '@/types/type/gallery/gallery';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Images, Quote, X } from 'lucide-react';

const FALLBACK = '/logo.png';

export default function ClientGalleryPage({ galleries }: { galleries: IGallery[] }) {
  // Gom TẤT CẢ ảnh từ mọi document thành 1 album thống nhất
  // (data thực tế: mỗi doc có name:"" và chỉ chứa 1 ảnh trong gallery[])
  const images = galleries
    .filter((g) => Array.isArray(g.gallery) && g.gallery.length > 0)
    .flatMap((g) => g.gallery)
    .filter((src): src is string => Boolean(src));

  if (images.length === 0) return <ErrorLoading />;

  const albumTitle = 'Hành Trình Cùng Khách Hàng';

  // Chia ảnh thành từng cặp (2 ảnh/cặp) để hiển thị dạng carousel chéo
  const pairs: string[][] = [];
  for (let i = 0; i < images.length; i += 2) {
    pairs.push(images.slice(i, i + 2));
  }

  const [offset, setOffset] = useState(0); // chỉ số cặp đang hiển thị
  const [lightbox, setLightbox] = useState<number | null>(null);

  // Auto-rotate kiểu tab Android: trượt sang cặp tiếp theo, vòng lặp
  useEffect(() => {
    if (pairs.length <= 1) return;
    const id = setInterval(() => {
      setOffset((o) => (o >= pairs.length - 1 ? 0 : o + 1));
    }, 3800);
    return () => clearInterval(id);
  }, [pairs.length]);

  return (
    <div className="min-h-screen bg-white">
      <HeaderResponsive Title_NavbarMobile="7teck.vn" />
      <div className="py-[60px] xl:pt-0">
        {/* --- Breadcrumbs --- */}
        <div className="breadcrumbs border-b border-gray-100 px-[10px] py-3 text-sm text-gray-500 xl:px-desktop-padding">
          <ul className="font-medium">
            <li>
              <Link aria-label="Trang chủ" href="/" className="transition-colors xl:hover:text-black">
                Trang Chủ
              </Link>
            </li>
            <li>
              <span className="font-semibold text-black">{albumTitle}</span>
            </li>
          </ul>
        </div>

        {/* --- Hero --- */}
        <section className="overflow-hidden px-2 py-14 text-center xl:px-desktop-padding xl:py-20">
          <div className="w-full">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <Images size={14} /> {images.length} khoảnh khắc
            </span>
            <h1 className="mb-4 text-4xl font-black uppercase tracking-tighter text-black xl:text-6xl">{albumTitle}</h1>
            <p className="mx-auto text-base font-medium text-gray-600 xl:text-lg">
              Những khoảnh khắc đáng nhớ và câu chuyện thành công — chúng tôi tự hào đồng hành cùng hàng ngàn khách hàng trên hành trình công nghệ.
            </p>
          </div>
        </section>

        {/* --- Unified album viewer --- */}
        <div className="w-full p-2 xl:px-desktop-padding">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {/* Main stage — carousel 2 ảnh chéo, xoay vòng, slide ngang kiểu tab Android */}
            <div className="relative overflow-hidden">
              {/* viewport cố định chiều cao, nội dung trượt ngang */}
              <div className="relative aspect-[3/2] w-full bg-slate-50 xl:aspect-[3/1]">
                {/* track chứa toàn bộ cặp ảnh, trượt theo offset */}
                <div
                  className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(-${offset * 50}%)` }}
                >
                  {pairs.map((pair, pi) => (
                    <div key={pi} className="grid h-full w-1/2 shrink-0 grid-cols-2 gap-2 p-2">
                      {pair.map((img, j) => {
                        const globalIndex = pi * 2 + j;
                        const isLeft = j === 0;
                        return (
                          <button
                            key={`${img}-${globalIndex}`}
                            type="button"
                            onClick={() => setLightbox(globalIndex)}
                            className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-white shadow-sm transition-transform duration-500 hover:shadow-lg ${
                              isLeft ? '-translate-y-2 -rotate-2' : 'translate-y-2 rotate-2'
                            }`}
                            aria-label={`Xem ảnh ${globalIndex + 1}`}
                          >
                            <Image
                              src={img || FALLBACK}
                              alt={`${albumTitle} - ảnh ${globalIndex + 1}`}
                              fill
                              sizes="(max-width: 1024px) 50vw, 512px"
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              quality={85}
                              priority={pi < 1}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* prev / next */}
                {pairs.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOffset((o) => (o <= 0 ? pairs.length - 1 : o - 1))}
                      className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
                      aria-label="Cặp ảnh trước"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setOffset((o) => (o >= pairs.length - 1 ? 0 : o + 1))}
                      className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-md transition hover:bg-white"
                      aria-label="Cặp ảnh sau"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* counter */}
                <span className="absolute right-3 top-3 z-10 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {offset * 2 + 1}–{Math.min(offset * 2 + 2, images.length)} / {images.length}
                </span>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 overflow-x-auto border-t border-slate-100 p-3 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setOffset(Math.floor(i / 2))}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    Math.floor(i / 2) === offset ? 'border-secondary ring-2 ring-secondary/25' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Xem ảnh ${i + 1}`}
                >
                  <Image src={img || FALLBACK} alt="" fill sizes="64px" className="object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Call to Action --- */}
      <section className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50 py-14 text-center xl:py-20">
        <div className="w-full px-2 xl:px-desktop-padding">
          <h2 className="mb-3 text-3xl font-black uppercase tracking-tighter text-gray-900 xl:text-4xl">Sẵn Sàng Cho Hành Trình Của Bạn?</h2>
          <p className="mb-7 text-sm font-medium text-gray-600 xl:text-base">
            Hãy liên hệ với chúng tôi để trải nghiệm dịch vụ hàng đầu và trở thành một phần của cộng đồng khách hàng hài lòng.
          </p>
          <Link
            href="/dien-thoai"
            className="inline-block rounded-full border border-black bg-black px-7 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-black"
          >
            Khám Phá Sản Phẩm
          </Link>
        </div>
      </section>

      {lightbox !== null && <Lightbox images={images} index={lightbox} onClose={() => setLightbox(null)} />}
    </div>
  );
}

/* ----------------------------- Lightbox ----------------------------- */
function Lightbox({ images, index, onClose }: { images: string[]; index: number; onClose: () => void }) {
  const [current, setCurrent] = useState(index);
  useEffect(() => setCurrent(index), [index]);

  const count = images.length;
  const go = useCallback(
    (dir: 1 | -1) =>
      setCurrent((i) => (i <= 0 && dir === -1 ? count - 1 : i >= count - 1 && dir === 1 ? 0 : i + dir)),
    [count]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';  
    };
  }, [go, onClose]);

  const src = images[current] || FALLBACK;

  return (
    <div className="fixed inset-0 z-gallery flex flex-col bg-black/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Quote size={16} className="text-secondary" />
          Hành Trình Cùng Khách Hàng
        </div>
        <button type="button" onClick={onClose} className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-bold text-white shadow-md backdrop-blur transition hover:bg-white hover:text-black" aria-label="Đóng (Esc)">
          <X size={22} /> Đóng
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-12">
        <button
          type="button"
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:left-4"
          aria-label="Ảnh trước"
        >
          <ChevronLeft size={26} />
        </button>

        <div className="relative h-full max-h-full w-full max-w-5xl overflow-hidden">
          <Image src={src} alt={`Hình ảnh khách hàng ${current + 1}`} fill sizes="100vw" className="object-contain" quality={90} />
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25 sm:right-4"
          aria-label="Ảnh sau"
        >
          <ChevronRight size={26} />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3 px-4 pb-5">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white">{current + 1} / {count}</span>
        {count > 1 && (
          <div className="flex max-w-full gap-1.5 overflow-x-auto scrollbar-hide pb-1">
            {images.map((img, i) => (
              <button
                key={`${img}-${i}`}
                type="button"
                onClick={() => setCurrent(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all ${current === i ? 'border-secondary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                aria-label={`Xem ảnh ${i + 1}`}
              >
                <Image src={img || FALLBACK} alt="" fill sizes="56px" className="object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
