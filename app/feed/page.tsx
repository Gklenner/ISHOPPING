import { Suspense } from "react"
import { Stories } from "@/components/feed/stories"
import { FeedList } from "@/components/feed/feed-list"
import { StoriesSkeleton } from "@/components/feed/stories-skeleton"
import { FeedSkeleton } from "@/components/feed/feed-skeleton"

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-[390px] mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Feed</h1>
        </div>
      </header>

      <main className="max-w-[390px] mx-auto">
        <Suspense fallback={<StoriesSkeleton />}>
          <Stories />
        </Suspense>

        <Suspense fallback={<FeedSkeleton />}>
          <FeedList />
        </Suspense>
      </main>
    </div>
  )
}

