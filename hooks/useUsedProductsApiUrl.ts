/**
 * Resolves URLs for the external Used Products API.
 *
 * This is a plain URL helper rather than a React hook because it is called by
 * server-side data fetching code in the App Router. Do not use getServerApiUrl
 * here: that helper intentionally targets this Next.js app itself.
 */
const DEFAULT_USED_PRODUCTS_API_BASE_URL = 'https://7teck-tools.vercel.app';

export function getUsedProductsApiUrl(endpoint: string): string {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const configuredBaseUrl =
    process.env.USED_PRODUCTS_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_USED_PRODUCTS_API_BASE_URL?.trim() ||
    DEFAULT_USED_PRODUCTS_API_BASE_URL;

  return `${configuredBaseUrl.replace(/\/+$/, '')}${normalizedEndpoint}`;
}
