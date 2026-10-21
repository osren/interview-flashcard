export function PageLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-[#ebebeb]" />
        <div className="h-4 w-72 max-w-full rounded-lg bg-[#f0f0f0]" />
      </div>
      <div className="h-14 rounded-2xl bg-[#f7f7f7] border-2 border-[#e5e5e5]" />
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-2xl bg-[#f7f7f7] border-2 border-[#e5e5e5]" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-[#f7f7f7] border-2 border-[#e5e5e5]" />
    </div>
  );
}
