export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-');
  return parts.length > 1 ? parts[parts.length - 1] : null;
}
