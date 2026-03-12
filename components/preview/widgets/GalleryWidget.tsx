"use client";

export default function GalleryWidget({ block }: any) {
  const images = block.data?.images || [];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((img: any) => (
        <img
          key={img.id}
          src={img.url}
          alt=""
          className="rounded-xl w-full"
        />
      ))}
    </div>
  );
}