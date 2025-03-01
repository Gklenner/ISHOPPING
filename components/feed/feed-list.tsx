"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PullToRefresh } from "@/components/pull-to-refresh"
import { cn } from "@/lib/utils"

type Post = {
  id: string
  user: {
    id: string
    name: string
    image: string
    verified?: boolean
  }
  images: string[]
  caption: string
  likes: number
  comments: number
  createdAt: string
  liked?: boolean
  saved?: boolean
}

export function FeedList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const { user } = useAuth()
  const loadingRef = useRef(false)

  const { ref: lastPostRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  const fetchPosts = useCallback(async (pageNumber: number) => {
    if (loadingRef.current) return
    loadingRef.current = true

    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newPosts: Post[] = Array.from({ length: 5 }, (_, i) => ({
        id: `${pageNumber}-${i}`,
        user: {
          id: `user-${i}`,
          name: `User ${i}`,
          image: "/placeholder.svg?height=40&width=40",
          verified: Math.random() > 0.5,
        },
        images: ["/placeholder.svg?height=400&width=390"],
        caption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. #fashion #style",
        likes: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 100),
        createdAt: new Date().toISOString(),
      }))

      setPosts((prev) => [...prev, ...newPosts])
      setPage((prev) => prev + 1)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts(page)
  }, [page, fetchPosts])

  useEffect(() => {
    if (inView) {
      fetchPosts(page)
    }
  }, [inView, page, fetchPosts])

  const handleRefresh = async () => {
    setPosts([])
    setPage(1)
    await fetchPosts(1)
  }

  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              liked: !post.liked,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    )
  }

  const handleSave = async (postId: string) => {
    setPosts((prev) => prev.map((post) => (post.id === postId ? { ...post, saved: !post.saved } : post)))
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="divide-y">
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              ref={index === posts.length - 1 ? lastPostRef : undefined}
              className="bg-white"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Image
                    src={post.user.image || "/placeholder.svg"}
                    alt={post.user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{post.user.name}</span>
                      {post.user.verified && (
                        <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square">
                <Image src={post.images[0] || "/placeholder.svg"} alt="Post" fill className="object-cover" />
              </div>

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => handleLike(post.id)}>
                      <Heart className={cn("h-6 w-6", post.liked && "fill-red-500 text-red-500")} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleSave(post.id)}>
                    <Bookmark className={cn("h-6 w-6", post.saved && "fill-primary text-primary")} />
                  </Button>
                </div>

                {/* Likes Count */}
                <div className="mb-2">
                  <span className="font-medium">{post.likes.toLocaleString()}</span> curtidas
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <p>
                    <span className="font-medium mr-2">{post.user.name}</span>
                    {post.caption}
                  </p>
                  <button className="text-muted-foreground text-sm">Ver {post.comments} comentários</button>
                </div>

                {/* Comment Input */}
                <div className="mt-4 flex items-center gap-2">
                  <Image
                    src={user?.image || "/placeholder.svg?height=32&width=32"}
                    alt="Your avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <input
                    type="text"
                    placeholder="Adicione um comentário..."
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                  <Button variant="ghost" className="text-primary text-sm">
                    Publicar
                  </Button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>

        {/* Loading More Posts */}
        {loading && (
          <div className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-[400px] w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}
      </div>
    </PullToRefresh>
  )
}

