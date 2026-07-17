// Link sản phẩm chuẩn hóa: luôn dùng route unified /{slug}
// (route group (product-detail)/[slug] tự nhận diện loại sản phẩm).
// Các route /{basePath}/{slug}/{id} vẫn tồn tại song song nhưng UI không trỏ vào đó nữa.
export const productHref = (slug?: string): string => (slug ? `/${slug}` : '/');
