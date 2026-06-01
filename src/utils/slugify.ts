import slugifyLib from 'slugify';

export const slugify = (text: string): string => {
  const normalized = text
    .replace(/[\/|_]/g, '-') // thay các ký tự phân cách phổ biến
    .replace(/\s+/g, ' ') // normalize space
    .normalize('NFD') // tách ký tự có dấu thành ký tự thường + dấu
    .replace(/[\u0300-\u036f]/g, ''); // loại bỏ dấu

  return slugifyLib(normalized, {
    lower: true,
    strict: true,
    trim: true,
    locale: 'vi',
  });
};
