export const handleProductShare = (slug: string) => {
  const domain = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  const fbShareUrl = process.env.NEXT_PUBLIC_FACEBOOK_SHARE_URL;

  const url = `${domain}/${slug}`;
  const shareUrl = `${fbShareUrl}${url}`;

  window.open(shareUrl, '_blank', 'width=700,height=500');
};
