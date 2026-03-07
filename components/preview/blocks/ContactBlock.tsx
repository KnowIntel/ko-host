export default function ContactBlock({ data }: any) {
  return (
    <section>
      <h3 className="font-semibold mb-2">{data.heading}</h3>

      <div className="text-sm space-y-1">
        {data.name && <div>{data.name}</div>}
        {data.email && <div>{data.email}</div>}
        {data.phone && <div>{data.phone}</div>}
      </div>
    </section>
  );
}