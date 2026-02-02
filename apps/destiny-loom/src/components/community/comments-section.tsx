"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@cyberfaith/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Comment {
  id: string;
  readingId: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  deletedAt: string | null;
  authorName: string;
  authorUsername: string | null;
  authorAvatar: string | null;
  replies: Comment[];
}

interface CommentsSectionProps {
  readingId: string;
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  currentUserId,
  t,
}: {
  comment: Comment;
  onReply: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  currentUserId?: string;
  t: any;
}) {
  const isDeleted = !!comment.deletedAt;

  return (
    <div className="space-y-2">
      <div className="flex gap-3 group">
        {comment.authorAvatar ? (
          <img src={comment.authorAvatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs flex-shrink-0">
            👤
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.authorName}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className={`text-sm mt-0.5 ${isDeleted ? "text-muted-foreground italic" : "text-foreground/80"}`}>
            {isDeleted ? t("deleted") : comment.content}
          </p>
          {!isDeleted && (
            <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => onReply(comment.id, comment.authorName)}
                className="text-xs text-primary hover:underline"
              >
                {t("reply")}
              </button>
              {currentUserId === comment.userId && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs text-red-400 hover:underline"
                >
                  {t("delete")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="ml-11 space-y-2 border-l border-primary/10 pl-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              currentUserId={currentUserId}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentsSection({ readingId }: CommentsSectionProps) {
  const t = useTranslations("comments");
  const { isAuthenticated, session, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = session?.tokens?.accessToken;

  const loadComments = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/readings/${readingId}/comments`);
      if (res.ok) {
        const json = await res.json();
        setComments(json.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [readingId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async () => {
    if (!content.trim() || submitting || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/readings/${readingId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: content.trim(),
          parentId: replyTo?.id ?? undefined,
        }),
      });
      if (res.ok) {
        setContent("");
        setReplyTo(null);
        await loadComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    const res = await fetch(`${API_URL}/comments/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) await loadComments();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        💬 {t("title")}
      </h3>

      {isAuthenticated ? (
        <div className="space-y-2">
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-primary">
              <span>{t("replyTo", { name: replyTo.name })}</span>
              <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 500))}
              placeholder={t("placeholder")}
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-lg bg-muted/30 border border-primary/10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || submitting}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/80 disabled:opacity-50 transition"
            >
              {t("submit")}
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-right">{content.length}/500</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("loginToComment")}</p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground animate-pulse">{t("loading")}</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={(id, name) => setReplyTo({ id, name })}
              onDelete={handleDelete}
              currentUserId={(user as any)?.id}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}
