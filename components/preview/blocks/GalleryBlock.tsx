export default function GalleryBlock({ data }: any) {
  return (
    <section>
      <h3 className="font-semibold mb-4">{data.heading}</h3>

      <div className="grid grid-cols-3 gap-2">
        {data.items?.map((img: any) => (
          <img
            key={img.id}
            src={img.url}
            className="rounded-lg object-cover w-full h-24"
          />
        ))}
      </div>
    </section>
  );
}