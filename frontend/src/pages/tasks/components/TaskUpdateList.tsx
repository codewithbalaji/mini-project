import { Bot } from "lucide-react";
import type { TaskUpdate } from "@/types/task.types";
import type { User } from "@/types/user.types";
import UserAvatar from "@/components/shared/UserAvatar";
import StatusBadge from "@/components/shared/StatusBadge";

interface TaskUpdateListProps {
  updates: TaskUpdate[];
}

const TaskUpdateList = ({ updates }: TaskUpdateListProps) => {
  if (updates.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">No updates yet.</p>;
  }

  return (
    <div className="space-y-3">
      {updates.map((update) => {
        const author = update.submittedBy as User;
        const isAI = update.isAIGenerated;
        const displayName = isAI ? "AI Copilot" : (author?.name || "User");
        
        return (
          <div key={update._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-3">
              {isAI ? (
                <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                  <Bot size={16} className="text-white" />
                </div>
              ) : (
                author?.name && <UserAvatar name={author.name} size="sm" className="flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${isAI ? 'text-violet-700' : 'text-gray-800'}`}>
                    {displayName}
                  </span>
                  {isAI && (
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                      AI Generated
                    </span>
                  )}
                  {update.statusChange && <StatusBadge status={update.statusChange} />}
                  {update.hoursLogged > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      +{update.hoursLogged}h logged
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {new Date(update.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1.5">{update.updateText}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskUpdateList;
