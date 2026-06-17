export type PaginationMeta = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

type PaginationOptions = {
  defaultPage: number;
  defaultLimit: number;
  maxLimit: number;
};

function toPositiveInteger(value: string | null, fallback: number): number {
  if (!value) return fallback;

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.floor(parsedValue);
}

export function getPaginationParams(searchParams: URLSearchParams, options: PaginationOptions): PaginationParams {
  const page = toPositiveInteger(searchParams.get('page'), options.defaultPage);
  const rawLimit = toPositiveInteger(searchParams.get('limit'), options.defaultLimit);
  const limit = Math.min(rawLimit, options.maxLimit);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
}

export function buildPaginationMeta(params: { page: number; limit: number; totalItems: number }): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(params.totalItems / params.limit));

  return {
    page: params.page,
    limit: params.limit,
    totalItems: params.totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPrevPage: params.page > 1,
  };
}

export function paginateArray<T>(items: T[], searchParams: URLSearchParams, options: PaginationOptions) {
  const { page, limit, skip } = getPaginationParams(searchParams, options);
  const paginatedItems = items.slice(skip, skip + limit);

  return {
    items: paginatedItems,
    pagination: buildPaginationMeta({
      page,
      limit,
      totalItems: items.length,
    }),
  };
}
