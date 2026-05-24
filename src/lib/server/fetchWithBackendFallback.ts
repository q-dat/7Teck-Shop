type FetchBackendParams<TFallbackData> = {
  backendPath: string;
  fallback: () => Promise<TFallbackData>;
  timeoutMs?: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function fetchWithBackendFallback<TResponse>({
  backendPath,
  fallback,
  timeoutMs = 3500,
}: FetchBackendParams<TResponse>): Promise<TResponse> {
  if (!API_BASE_URL) {
    return fallback();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${API_BASE_URL}${backendPath}`, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Backend failed: ${response.status}`);
    }

    return (await response.json()) as TResponse;
  } catch {
    return fallback();
  }
}
