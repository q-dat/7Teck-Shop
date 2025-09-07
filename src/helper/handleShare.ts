import { slugify } from '@/utils/slugify';

const domain = process.env.NEXT_PUBLIC_SITE_URL;
const fbShareUrl = process.env.NEXT_PUBLIC_FACEBOOK_SHARE_URL;

export const handleProductShare = (basePath: string, name: string, id: string) => {
  const shareUrl = `${fbShareUrl}${encodeURIComponent(`${domain}/${basePath}/${slugify(name)}/${id}`)}`;
  window.open(shareUrl, '_blank', 'width=700,height=500');
};
