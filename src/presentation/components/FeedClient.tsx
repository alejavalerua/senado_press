"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Header } from "./Header";
import { LiveBar } from "./LiveBar";
import { SenatePanel } from "./SenatePanel";
import { ComposeBox } from "./ComposeBox";
import { PostCard } from "./PostCard";
import { FeedFilters, FeedFilter } from "./FeedFilters";
import { Footer } from "./Footer";
import { SessionPayload } from "@/infrastructure/auth/session";
import { PostWithAuthor } from "@/domain/entities/Post";
import { SenateState } from "@/domain/entities/SenateState";
import { Senator } from "@/domain/entities/Senator";
import { Profile } from "@/domain/entities/Profile";

interface FeedClientProps {
  user: SessionPayload;
  initialState: SenateState;
  senators: Senator[];
  journalists: Profile[];
}

export function FeedClient({ user, initialState, senators, journalists }: FeedClientProps) {
  const [state, setState] = useState(initialState);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [filter, setFilter] = useState<FeedFilter>("todo");
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<PostWithAuthor | null>(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?filter=${filter}`);
      const data = await res.json();
      if (res.ok) setPosts(data.posts);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const refreshState = useCallback(async () => {
    const res = await fetch("/api/senate-state");
    const data = await res.json();
    if (res.ok) setState(data.state);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  useEffect(() => {
    const interval = setInterval(refreshState, 30000);
    return () => clearInterval(interval);
  }, [refreshState]);

  function handleReply(post: PostWithAuthor) {
    setReplyTo(post);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} />
      <LiveBar state={state} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <SenatePanel state={state} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="lg:hidden">
              <SenatePanel state={state} />
            </div>

            <ComposeBox
              senators={senators}
              journalists={journalists.filter((j) => j.id !== user.userId)}
              onPublished={() => { loadPosts(); setReplyTo(null); }}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
            />

            <div className="flex items-center justify-between">
              <FeedFilters active={filter} onChange={setFilter} />
              <button
                onClick={loadPosts}
                className="p-2 rounded-lg hover:bg-white/80 text-gray-500 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {loading && posts.length === 0 ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-senate-600" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-lg font-medium">No hay despachos aún</p>
                <p className="text-sm mt-1">Sé el primero en publicar una observación del debate</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onReaction={loadPosts}
                    onReply={handleReply}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}