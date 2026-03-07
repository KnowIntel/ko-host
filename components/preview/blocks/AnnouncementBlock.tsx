export default function AnnouncementBlock({ data }: any) {
  return (
    <section className="text-center space-y-3">
      <h2 className="text-2xl font-bold">{data.headline}</h2>
      <p className="text-neutral-600">{data.body}</p>
    </section>
  );
}