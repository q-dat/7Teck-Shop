export async function getWithFallback<T extends { _id: string }>(
    id: string,
    getAll: () => Promise<T[]>,
    getById: (id: string) => Promise<T | null>
  ): Promise<T | null> {
    const all = await getAll();
    const cached = all.find(item => item._id === id);
    if (cached) return cached;
  
    const fresh = await getById(id);
    return fresh;
  }
  