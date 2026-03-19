const domain = process.env.NEXT_PUBLIC_SITE_URL;
const fbShareUrl = process.env.NEXT_PUBLIC_FACEBOOK_SHARE_URL;

export const handleProductShare = (slug: string) => {
  const shareUrl = `${fbShareUrl}${encodeURIComponent(`${domain}/${slug}`)}`;
  window.open(shareUrl, '_blank', 'width=700,height=500');
};
