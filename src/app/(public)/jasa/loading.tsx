export default function PublicServicesLoading() {
  return (
    <section className="site-container animate-pulse py-14 sm:py-20" role="status">
      <span className="sr-only">Memuat jasa...</span>
      <div className="h-4 w-24 rounded bg-ink/15" />
      <div className="mt-3 h-12 w-full max-w-xl rounded bg-ink/15" />
      <div className="mt-4 h-5 w-full max-w-2xl rounded bg-ink/10" />
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="brutal-card h-[32rem] bg-surface" />
        <div className="brutal-card h-[32rem] bg-surface" />
      </div>
    </section>
  );
}
