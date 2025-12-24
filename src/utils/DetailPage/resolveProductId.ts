import { decodeObjectId } from './objectIdCodec';

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;

export function resolveProductId(raw: string): string | null {
  // 1. ObjectId nguyên bản
  if (OBJECT_ID_REGEX.test(raw)) {
    return raw.toLowerCase();
  }

  // 2. Thử decode base62
  const decoded = decodeObjectId(raw);
  if (decoded) return decoded;

  return null;
}
