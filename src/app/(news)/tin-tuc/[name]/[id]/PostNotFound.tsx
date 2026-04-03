'use client';
interface PostNotFoundProps {
  title?: string;
  description?: string;
}

export default function PostNotFound({
  title = 'Bài viết này không tồn tại!',
  description = 'Xin lỗi vì sự bất tiện này. Quý độc giả vui lòng theo dõi các bài viết khác trên trang.',
}: PostNotFoundProps) {
  return (
    <p
      aria-label="Bài viết không tồn tại"
      className="my-3 rounded-md bg-white p-4 text-center text-2xl font-light text-primary"
    >
      {title}
      <br />
      <span className="mt-2 block text-xl">
        {description}
      </span>
    </p>
  );
}
