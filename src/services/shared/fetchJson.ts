export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  const contentType = response.headers.get('content-type') ?? '';
  const rawText = await response.text();

  if (!response.ok) {
    throw new Error(`API failed: ${response.status} ${response.statusText} | ${url} | ${rawText.slice(0, 300)}`);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(`API did not return JSON | ${url} | content-type: ${contentType} | ${rawText.slice(0, 300)}`);
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    throw new Error(`Invalid JSON response | ${url} | ${rawText.slice(0, 300)}`);
  }
}
