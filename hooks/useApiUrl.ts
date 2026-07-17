export function getServerApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (typeof window !== 'undefined') {
    return normalizedEndpoint;
  }   

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl && process.env.NODE_ENV === 'production') {
    return `${siteUrl.replace(/\/$/, '')}${normalizedEndpoint}`;
  }

  return `http://localhost:${process.env.PORT ?? 3000}${normalizedEndpoint}`;
}
