"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MessageCircle, AlertCircle } from "lucide-react"

// This component will fetch and display Instagram posts
export function InstagramFeed({ username }: { username: string }) {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstagramPosts = async () => {
      try {
        setLoading(true)

        // In a real implementation, you would fetch from Instagram's API
        // For now, we'll use a placeholder API endpoint that would be implemented
        // to fetch from Instagram's Graph API
        const response = await fetch(`/api/instagram?username=${username}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch Instagram posts: ${response.status}`)
        }

        const data = await response.json()

        if (data.posts && Array.isArray(data.posts)) {
          setPosts(data.posts)
        } else {
          // If no posts or invalid response, use mock data
          setPosts(mockPosts)
          setError("Using demo posts. Connect Instagram for real posts.")
        }
      } catch (err) {
        console.error("Error fetching Instagram posts:", err)
        setPosts(mockPosts)
        setError("Using demo posts. Connect Instagram for real posts.")
      } finally {
        setLoading(false)
      }
    }

    fetchInstagramPosts()
  }, [username])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="aspect-square" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm flex items-center">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group overflow-hidden rounded-lg"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={post.image || "/placeholder.svg"}
                alt={post.caption}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="line-clamp-2 text-sm text-white">{post.caption}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-white">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-white">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// Mock Instagram post data - in a real implementation, this would come from Instagram API
const mockPosts = [
  {
    id: "1",
    caption: "Just tapped our new seasonal IPA! Come try it this weekend. #craftbeer #ipa",
    image: "/images/instagram-1.jpg",
    likes: 124,
    comments: 18,
    url: "https://instagram.com/p/abc123",
  },
  {
    id: "2",
    caption: "Live music tonight with @localband starting at 7pm! #livemusic #brewery",
    image: "/images/instagram-2.jpg",
    likes: 98,
    comments: 12,
    url: "https://instagram.com/p/def456",
  },
  {
    id: "3",
    caption: "Beautiful day for our outdoor beer garden! #sunshine #beergarden",
    image: "/images/instagram-3.jpg",
    likes: 156,
    comments: 24,
    url: "https://instagram.com/p/ghi789",
  },
  {
    id: "4",
    caption: "New merch just arrived! Stop by and grab yours while supplies last. #brewerytees",
    image: "/images/instagram-4.jpg",
    likes: 87,
    comments: 9,
    url: "https://instagram.com/p/jkl012",
  },
  {
    id: "5",
    caption: "Brewing day! Sneak peek at our upcoming summer ale. #brewingprocess #craftbeer",
    image: "/images/instagram-5.jpg",
    likes: 112,
    comments: 15,
    url: "https://instagram.com/p/mno345",
  },
  {
    id: "6",
    caption: "Thanks to everyone who came out for our anniversary celebration! #breweryfamily",
    image: "/images/instagram-6.jpg",
    likes: 203,
    comments: 32,
    url: "https://instagram.com/p/pqr678",
  },
]
