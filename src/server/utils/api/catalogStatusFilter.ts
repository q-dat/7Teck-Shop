export function isStatusQueryValue(value: string | undefined): value is '0' | '1' {
  return value === '0' || value === '1';
}

export function matchesCatalogStatus(catalogStatus: unknown, status: string | undefined): boolean {
  if (!isStatusQueryValue(status)) return true;

  const normalizedCatalogStatus = Number(catalogStatus);
  const normalizedStatus = Number(status);

  return normalizedCatalogStatus === normalizedStatus;
}

export function getStatusFromAlias(query: Record<string, string | undefined>, aliasKey: string): string | undefined {
  return query[aliasKey] ?? query.status;
}
