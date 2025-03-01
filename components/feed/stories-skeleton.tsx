export function StoriesSkeleton() {
  return (
    <div className="bg-white p-4">
      <div className="flex gap-4 overflow-x-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-15 h-15 rounded-full bg-gray-200 animate-pulse" />
            <div className="w-12 h-2 mt-2 bg-gray-200 animate-pulse mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

