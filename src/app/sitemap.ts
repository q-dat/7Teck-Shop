import { MetadataRoute } from 'next';
import { getServerApiUrl } from '../../hooks/useApiUrl';
import { SITE_URL, postPath } from '@/app/(SEO)/lib/seo';

// Sitemap chính: LẤY DỮ LIỆU QUA API NỘI BỘ (getServerApiUrl) — cùng cơ chế với
// services của shop, KHÔNG gọi thẳng external BE. URL trong sitemap PHẢI khớp
// chính xác canonical thực tế của từng loại trang (nếu lệch, Google index sai).
export const revalidate = 3600;

type AnyItem = Record<string, unknown> & { _id?: string; updatedAt?: string };

const buildEntry = (
  path: string,
  lastModified: Date,
  priority = 0.7,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] = 'daily'
): MetadataRoute.Sitemap[number] => ({
  url: `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`,
  lastModified,
  changeFrequency,
  priority,
});

async function fetchList(endpoint: string, dataField: string): Promise<AnyItem[]> {
  try {
    const res = await fetch(getServerApiUrl(endpoint), { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const json = await res.json();
    if (Array.isArray(json)) return json as AnyItem[];
    if (Array.isArray(json?.[dataField])) return json[dataField] as AnyItem[];
    if (Array.isArray(json?.data)) return json.data as AnyItem[];
    return [];
  } catch (err) {
    console.error(`sitemap: lỗi lấy ${endpoint}:`, (err as Error).message);
    return [];
  }
}

function lastMod(item: AnyItem): Date {
  const raw = typeof item.updatedAt === 'string' ? item.updatedAt : undefined;
  const d = raw ? new Date(raw) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

async function fetchListAll(endpoint: string, dataField: string): Promise<AnyItem[]> {
  // Hỗ trợ API có phân trang (vd /api/phones mặc định limit 20, max 100).
  // Quét hết các page cho tới khi API hết dữ liệu (pagination.hasNextPage = false).
  const out: AnyItem[] = [];
  let page = 1;
  const MAX_PAGES = 200; // tránh vòng lặp vô hạn nếu API lỗi
  while (page <= MAX_PAGES) {
    const qs = endpoint.includes('?') ? `&page=${page}&limit=100` : `?page=${page}&limit=100`;
    let json: any = null;
    try {
      const res = await fetch(getServerApiUrl(`${endpoint}${qs}`), { next: { revalidate: 3600 } });
      if (!res.ok) break;
      json = await res.json();
    } catch (err) {
      console.error(`sitemap: lỗi lấy ${endpoint} (page ${page}):`, (err as Error).message);
      break;
    }
    const items: AnyItem[] =
      Array.isArray(json?.[dataField]) ? json[dataField]
      : Array.isArray(json?.data) ? json.data
      : Array.isArray(json) ? json
      : [];
    if (!items.length) break;
    out.push(...items);
    if (!json?.pagination?.hasNextPage) break;
    page++;
  }
  return out;
}

async function getDynamicPaths(): Promise<MetadataRoute.Sitemap[number][]> {
  const paths: MetadataRoute.Sitemap[number][] = [];

  const [phones, tablets, macbooks, windows, posts] = await Promise.all([
    fetchListAll('/api/phones', 'phones'),
    fetchList('/api/tablets', 'tablets'),
    fetchList('/api/laptop-macbook', 'macbook'),
    fetchList('/api/laptop-windows', 'windows'),
    fetchList('/api/posts', 'posts'),
  ]);

  // PHONE — canonical là route `/dien-thoai/${slug}/${_id}` (KHỚP UI + JSON-LD thực tế)
  for (const p of phones) {
    const slug = p.slug as string | undefined;
    if (slug && p._id) paths.push(buildEntry(`/dien-thoai/${slug}/${p._id}`, lastMod(p), 0.8));
  }

  // TABLET — `/may-tinh-bang/${slug}/${id}`
  for (const t of tablets) {
    const slug = t.tablet_slug as string | undefined;
    if (slug && t._id) paths.push(buildEntry(`/may-tinh-bang/${slug}/${t._id}`, lastMod(t), 0.8));
  }

  // MACBOOK — `/macbook/${slug}/${id}`
  for (const m of macbooks) {
    const slug = m.macbook_slug as string | undefined;
    if (slug && m._id) paths.push(buildEntry(`/macbook/${slug}/${m._id}`, lastMod(m), 0.8));
  }

  // WINDOWS — `/windows/${slug}/${id}`
  for (const w of windows) {
    const slug = w.windows_slug as string | undefined;
    if (slug && w._id) paths.push(buildEntry(`/windows/${slug}/${w._id}`, lastMod(w), 0.8));
  }

  // POST — `/tin-tuc/${slugify(title)}/${id}` (KHỚP link UI thực tế qua postPath)
  for (const post of posts) {
    const title = post.title as string | undefined;
    if (title && post._id) {
      // slugify được bọc trong postPath; đảm bảo có title + _id
      paths.push(buildEntry(postPath({ _id: post._id as string, title }), lastMod(post), 0.6, 'daily'));
    }
  }

  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { path: '', priority: 1.0 },
    { path: '/dien-thoai', priority: 0.9 },
    { path: '/may-tinh-bang', priority: 0.9 },
    { path: '/macbook', priority: 0.9 },
    { path: '/windows', priority: 0.9 },
    { path: '/thiet-bi-da-qua-su-dung', priority: 0.7 },
    { path: '/bang-gia-thu-mua', priority: 0.7 },
    { path: '/tin-tuc-moi-nhat', priority: 0.8 },
    { path: '/thu-thuat-va-meo-hay', priority: 0.7 },
    { path: '/hanh-trinh-khach-hang', priority: 0.6 },
    { path: '/thanh-toan', priority: 0.5 },
    { path: '/chinh-sach-quyen-rieng-tu', priority: 0.3 },
    { path: '/dieu-khoan-dich-vu', priority: 0.3 },
    { path: '/chinh-sach-bao-hanh', priority: 0.3 },
  ].map(({ path, priority }) => buildEntry(path, now, priority, 'weekly'));

  const dynamicPages = await getDynamicPaths();

  const allPages = [...staticPages, ...dynamicPages].filter((p) => !p.url.includes('/cms/'));

  // Google chấp nhận sitemap tối đa 50.000 URL / 50MB. Nới an toàn,
  // danh sách hiện tại (<2k) không bị cắt. Nếu vượt, nên tách sitemap index.
  return allPages.slice(0, 50000);
}
