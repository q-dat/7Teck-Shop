import { NextRequest } from 'next/server';

export type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>;

export function valueFromSearchParams(params: URLSearchParams, key: string): string | undefined {
  const value = params.get(key);
  return value === null || value === '' ? undefined : value;
}

export function requestToObject(request: NextRequest): Record<string, string | undefined> {
  const params = request.nextUrl.searchParams;

  const result: Record<string, string | undefined> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

export function getNumberParam(value: string | undefined, fallback: number): number {
  if (!value) return fallback;

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function normalizeSortParam(value: string | undefined): 'price_asc' | 'price_desc' | 'newest' | undefined {
  if (value === 'price_asc' || value === 'price_desc' || value === 'newest') {
    return value;
  }

  return undefined;
}
