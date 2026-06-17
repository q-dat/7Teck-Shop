export type PlainObject = Record<string, unknown>;

export function getNestedValue(source: unknown, path: string[]): unknown {
  let currentValue = source;

  for (const key of path) {
    if (!currentValue || typeof currentValue !== 'object') {
      return undefined;
    }

    currentValue = (currentValue as PlainObject)[key];
  }

  return currentValue;
}

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

export function toComparableString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return null;
}

export function toDateTime(value: unknown): number {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  return 0;
}

export function matchesCatalogStatus(item: unknown, status: string | null, catalogStatusPath: string[]): boolean {
  if (status !== '0' && status !== '1') return true;

  const catalogStatus = getNestedValue(item, catalogStatusPath);
  const comparableStatus = toComparableString(catalogStatus);

  return comparableStatus === status;
}

export function filterByCatalogStatus<T>(items: T[], status: string | null, catalogStatusPath: string[]): T[] {
  return items.filter((item) => matchesCatalogStatus(item, status, catalogStatusPath));
}

export function sortByNewest<T>(items: T[]): T[] {
  return [...items].sort((firstItem, secondItem) => {
    const firstUpdatedAt = toDateTime(getNestedValue(firstItem, ['updatedAt']));
    const secondUpdatedAt = toDateTime(getNestedValue(secondItem, ['updatedAt']));

    if (secondUpdatedAt !== firstUpdatedAt) {
      return secondUpdatedAt - firstUpdatedAt;
    }

    const firstCreatedAt = toDateTime(getNestedValue(firstItem, ['createdAt']));
    const secondCreatedAt = toDateTime(getNestedValue(secondItem, ['createdAt']));

    return secondCreatedAt - firstCreatedAt;
  });
}

export function groupByCatalog<T>(items: T[], catalogPath: string[]) {
  const groupedMap = new Map<string, { catalog: unknown; variants: T[] }>();

  for (const item of items) {
    const catalog = getNestedValue(item, catalogPath);
    const catalogId = getCatalogId(catalog);

    if (!groupedMap.has(catalogId)) {
      groupedMap.set(catalogId, {
        catalog,
        variants: [],
      });
    }

    groupedMap.get(catalogId)?.variants.push(item);
  }

  return Array.from(groupedMap.values());
}

function getCatalogId(catalog: unknown): string {
  if (!catalog || typeof catalog !== 'object') {
    return String(catalog ?? 'unknown');
  }

  const id = (catalog as PlainObject)._id;

  if (typeof id === 'string') return id;

  if (id && typeof id === 'object' && 'toString' in id && typeof id.toString === 'function') {
    return id.toString();
  }

  return String(catalog);
}

export function filterPhoneItems<T>(items: T[], searchParams: URLSearchParams): T[] {
  const status = searchParams.get('status');
  const hasProduct = searchParams.get('hasProduct');
  const price = searchParams.get('price');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const color = searchParams.get('color');
  const ram = searchParams.get('ram');
  const storage = searchParams.get('storage');
  const sort = searchParams.get('sort');

  const shouldFilterStatus = status === '0' || status === '1';
  const shouldFilterProductCount = hasProduct === 'true';
  const shouldFilterSinglePrice = Boolean(price);
  const shouldFilterRangePrice = Boolean(minPrice || maxPrice);
  const shouldFilterColor = Boolean(color);
  const shouldFilterRam = Boolean(ram);
  const shouldFilterStorage = Boolean(storage);

  const maxSingle = toNumber(price);
  const min = toNumber(minPrice);
  const max = toNumber(maxPrice);

  const filteredItems = items.filter((item) => {
    const itemStatus = toComparableString(getNestedValue(item, ['phone_catalog_id', 'status']));
    const itemPrice = toNumber(getNestedValue(item, ['price'])) ?? 0;
    const itemColor = toComparableString(getNestedValue(item, ['color']))?.toLowerCase();
    const itemRam = toComparableString(getNestedValue(item, ['phone_catalog_id', 'configuration_and_memory', 'ram']));
    const itemStorage = toComparableString(getNestedValue(item, ['phone_catalog_id', 'configuration_and_memory', 'storage_capacity']));

    const matchesStatus = shouldFilterStatus ? itemStatus === status : true;
    const matchesProduct = shouldFilterProductCount ? true : true;
    const matchesSinglePrice = shouldFilterSinglePrice ? itemPrice <= (maxSingle ?? 0) : true;
    const matchesRangePrice = shouldFilterRangePrice ? (!min || itemPrice >= min) && (!max || itemPrice <= max) : true;
    const matchesColor = shouldFilterColor ? itemColor?.includes(String(color).toLowerCase()) === true : true;
    const matchesRam = shouldFilterRam ? itemRam === ram : true;
    const matchesStorage = shouldFilterStorage ? itemStorage === storage : true;

    return matchesStatus && matchesProduct && matchesSinglePrice && matchesRangePrice && matchesColor && matchesRam && matchesStorage;
  });

  return [...filteredItems].sort((firstItem, secondItem) => {
    const firstPrice = toNumber(getNestedValue(firstItem, ['price'])) ?? 0;
    const secondPrice = toNumber(getNestedValue(secondItem, ['price'])) ?? 0;

    if (sort === 'price_asc') {
      return firstPrice - secondPrice;
    }

    if (sort === 'price_desc') {
      return secondPrice - firstPrice;
    }

    const firstTime = toDateTime(getNestedValue(firstItem, ['createdAt']));
    const secondTime = toDateTime(getNestedValue(secondItem, ['createdAt']));

    return secondTime - firstTime;
  });
}

export function getModelErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}
