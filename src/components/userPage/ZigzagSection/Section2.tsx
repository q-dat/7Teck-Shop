'use client';
export default function Section2() {
  return (
    <section className="relative z-20 flex h-[100vh] w-full items-start justify-center px-desktop-padding">
      <div className="flex w-full flex-row-reverse items-center">
        <div className="mb-4 w-1/2 text-left">
          <h1 className="mb-4 text-7xl font-bold">Camera Pro 48MP</h1>
          <p className="mb-4 text-2xl">Bộ 3 camera 48MP đồng bộ, zoom quang học 8x, quay video ProRes 8K chuyên nghiệp.</p>
          <p className="mb-4 text-sm italic text-gray-100 2xl:text-xl">
            Photonic Engine + AI giữ chi tiết và màu sắc nhất quán trên cả 3 ống kính, chụp đêm rõ ràng hơn bao giờ hết.
          </p>
          <p className="text-sm italic text-gray-100 2xl:text-xl">
            Camera trước 18MP với Center Stage, đảm bảo bạn luôn nổi bật trong mọi cuộc gọi video.
          </p>
        </div>
        <div className="relative w-1/2">{''}</div>
      </div>
    </section>
  );
}
