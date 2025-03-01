export function FeedSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="w-24 h-3 bg-gray-200 animate-pulse" />
              <div className="w-16 h-2 bg-gray-200 animate-pulse" />
            </div>
          </div>
          <div className="aspect-square bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-gray-200 animate-pulse" />
            <div className="w-3/4 h-4 bg-gray-200 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

