"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, User, AtSign, MessageCircle, Reply } from "lucide-react";
import { PostWithAuthor, POST_TAG_LABELS, POST_TAG_COLORS } from "@/domain/entities/Post";

interface PostCardProps {
  post: PostWithAuthor;
  onReaction?: () => void;
  onReply?: (post: PostWithAuthor) => void;
  isReply?: boolean;
}

export function PostCard({ post, onReaction, onReply, isReply = false }: PostCardProps) {
  const [likes, setLikes] = useState(post.likesCount);
  const [dislikes, setDislikes] = useState(post.dislikesCount);
  const [userReaction, setUserReaction] = useState(post.userReaction);
  const [reacting, setReacting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const timeAgo = getTimeAgo(post.createdAt);
  const hasReplies = (post.replies?.length ?? 0) > 0;

  async function handleReaction(type: "like" | "dislike") {
    if (reacting) return;
    setReacting(true);

    try {
      const res = await fetch(`/api/posts/${post.id}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      const data = await res.json();
      if (res.ok && data.post) {
        setLikes(data.post.likesCount);
        setDislikes(data.post.dislikesCount);
        setUserReaction(data.reaction);
        onReaction?.();
      }
    } finally {
      setReacting(false);
    }
  }

  return (
    <div className={isReply ? "ml-8 border-l-2 border-senate-200 pl-4" : ""}>
      <article className={`bg-white rounded-2xl card-shadow p-5 ${!isReply ? "card-hover" : ""}`}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-senate-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-senate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{post.author.displayName}</span>
              <span className="text-gray-400 text-sm">@{post.author.username}</span>
              {post.author.mediaOutlet && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {post.author.mediaOutlet}
                </span>
              )}
              {!isReply && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${POST_TAG_COLORS[post.tag]}`}>
                  {POST_TAG_LABELS[post.tag]}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{timeAgo}</p>
          </div>
        </div>

        {post.parentPost && isReply && (
          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <Reply className="w-3 h-3" />
            En respuesta a @{post.parentPost.author.username}
          </p>
        )}

        <p className="mt-3 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Imagen adjunta"
            className="mt-3 rounded-xl max-h-64 w-full object-cover border border-gray-100"
          />
        )}

        {(post.targetSenator || post.targetJournalist) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.targetSenator && (
              <span className="inline-flex items-center gap-1 text-xs bg-parliament-50 text-parliament-700 px-2.5 py-1 rounded-full border border-parliament-200">
                <AtSign className="w-3 h-3" />
                Sen. {post.targetSenator.fullName}
              </span>
            )}
            {post.targetJournalist && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                <AtSign className="w-3 h-3" />
                {post.targetJournalist.displayName}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center gap-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleReaction("like")}
            disabled={reacting}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              userReaction === "like"
                ? "text-emerald-600 font-semibold"
                : "text-gray-500 hover:text-emerald-600"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            {likes}
          </button>
          <button
            onClick={() => handleReaction("dislike")}
            disabled={reacting}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              userReaction === "dislike"
                ? "text-rose-600 font-semibold"
                : "text-gray-500 hover:text-rose-600"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            {dislikes}
          </button>
          {onReply && !isReply && (
            <button
              onClick={() => onReply(post)}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-senate-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Responder
              {(post.replyCount ?? post.replies?.length ?? 0) > 0 && (
                <span className="text-xs">({post.replyCount ?? post.replies?.length})</span>
              )}
            </button>
          )}
        </div>
      </article>

      {hasReplies && !isReply && (
        <div className="mt-3 space-y-3">
          {showReplies && post.replies?.map((reply) => (
            <PostCard
              key={reply.id}
              post={reply}
              onReaction={onReaction}
              isReply
            />
          ))}
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-senate-600 hover:underline ml-8"
          >
            {showReplies ? "Ocultar respuestas" : `Ver ${post.replies?.length} respuestas`}
          </button>
        </div>
      )}
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days}d`;
}