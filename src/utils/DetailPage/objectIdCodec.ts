import baseX from 'base-x';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const base62 = baseX(BASE62);

export function encodeObjectId(objectId: string): string {
  return base62.encode(Buffer.from(objectId, 'hex'));
}

export function decodeObjectId(encoded: string): string | null {
  try {
    const hex = Buffer.from(base62.decode(encoded)).toString('hex');
    return /^[a-f0-9]{24}$/.test(hex) ? hex : null;
  } catch {
    return null;
  }
}
