import { useEffect, useState } from "react";
import commentService from "@/services/commentService";
import type { Comment } from "@/types/task.types";
import type { User } from "@/types/user.types";
import { useAuthStore } from "@/store/authStore";
import UserAvatar from "@/components/shared/UserAvatar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";

interface CommentSectionProps {
  entityType: "TASK" | "PROJECT";
  entityId: string;
}

const CommentSection = ({ entityType, entityId }: CommentSectionProps) => {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      const data = await commentService.getComments(entityType, entityId);
      setComments(data);
    } catch {}
  };

  useEffect(() => { fetchComments(); }, [entityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const comment = await commentService.addComment({ entityType, entityId, content });
      setComments((prev) => [...prev, comment]);
      setContent("");
    } catch {}
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await commentService.deleteComment(deleteTarget);
      setComments((prev) => prev.filter((c) => c._id !== deleteTarget));
    } catch {}
    setDeleteTarget(null);
  };

  const canDelete = (comment: Comment) => {
    const author = comment.author as User;
    return author._id === user?._id || user?.role === "ADMIN" || user?.role === "MANAGER";
  };

  return (
    <div className="space-y-4">
      {/* Comment list */}
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No comments yet. Start the conversation!</p>
        )}
        {comments.map((c) => {
          const author = c.author as User;
          return (
            <div key={c._id} className="flex items-start gap-3 group">
              {author?.name && <UserAvatar name={author.name} size="sm" className="flex-shrink-0 mt-0.5" />}
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{author?.name}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  {canDelete(c) && (
                    <button
                      onClick={() => setDeleteTarget(c._id)}
                      className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1">{c.content}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add comment */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        {user?.name && <UserAvatar name={user.name} size="sm" className="flex-shrink-0 mt-2" />}
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={loading || !content.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors">
            Post
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Comment?"
        description="This comment will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default CommentSection;
