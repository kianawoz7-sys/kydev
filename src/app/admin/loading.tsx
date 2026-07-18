export default function AdminLoading() {
  return (
    <div className="animate-pulse pt-10 sm:pt-14" role="status">
      <span className="sr-only">Memuat dashboard...</span>
      <div className="h-4 w-28 rounded bg-ink/15" />
      <div className="mt-3 h-12 w-full max-w-md rounded bg-ink/15" />
      <div className="mt-4 h-5 w-full max-w-xl rounded bg-ink/10" />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="brutal-card h-40 bg-surface" key={index} />
        ))}
      </div>
      <div className="brutal-card mt-8 h-96 bg-surface" />
    </div>
  );
}
