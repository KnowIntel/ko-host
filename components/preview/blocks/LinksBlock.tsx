export default function LinksBlock({ data }: any) {
  return (
    <section>
      <h3 className="font-semibold mb-2">{data.heading}</h3>

      <ul className="space-y-2">
        {data.items?.map((item: any) => (
          <li key={item.id}>
            <a
              href={item.url}
              className="text-blue-600 underline"
            >
              {item.label || item.url}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}