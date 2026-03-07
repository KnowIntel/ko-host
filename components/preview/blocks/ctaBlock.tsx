export default function CtaBlock({ data }: any) {
  return (
    <section className="text-center space-y-3">
      <h3 className="text-xl font-semibold">{data.heading}</h3>

      <p className="text-neutral-600">{data.body}</p>

      <button className="rounded-xl bg-neutral-900 text-white px-4 py-2">
        {data.buttonText}
      </button>
    </section>
  );
}