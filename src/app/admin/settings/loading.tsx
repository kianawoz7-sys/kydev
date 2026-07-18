export default function SettingsLoading() {
  return (
    <div className="animate-pulse pt-10 sm:pt-14" role="status">
      <span className="sr-only">Memuat pengaturan admin...</span>
      <div className="h-4 w-28 rounded bg-ink/15" />
      <div className="mt-3 h-12 w-full max-w-sm rounded bg-ink/15" />
      <div className="mt-4 h-5 w-full max-w-2xl rounded bg-ink/10" />
      <div className="brutal-card mt-8 h-72 bg-surface" />
      <div className="brutal-card mt-8 h-[34rem] bg-surface" />
      <div className="brutal-card mt-8 h-80 bg-surface" />
    </div>
  );
}
