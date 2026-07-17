import { getAllNews } from '@/services/postService';
import { SITE_NAME, postUrl } from '@/app/(SEO)/lib/seo';
import { IPost } from '@/types/type/products/post/post';

// Google News sitemap: CHỈ chứa bài đăng trong 48 giờ gần nhất (yêu cầu của Google News).
// Namespace news: không có trong MetadataRoute.Sitemap nên phải tự dựng XML.
export const revalidate = 900; // làm mới mỗi 15 phút cho tin tức

const TWO_DAYS_MS = 48 * 60 * 60 * 1000;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  let posts: IPost[] = [];
  try {
    posts = await getAllNews();
  } catch {
    posts = [];
  }

  const now = Date.now();
  const recent = posts
    .filter((p) => {
      const published = new Date(p.createdAt).getTime();
      return !Number.isNaN(published) && now - published <= TWO_DAYS_MS;
    })
    .slice(0, 1000);

  const urls = recent
    .map((post) => {
      const loc = escapeXml(postUrl(post));
      const pubDate = new Date(post.createdAt).toISOString();
      const title = escapeXml(post.title);
      return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>vi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=900, s-maxage=900',
    },
  });
}
