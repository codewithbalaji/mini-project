export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_STATUS_CHANGED"
  | "TASK_DUE_SOON"
  | "TASK_OVERDUE"
  | "PROJECT_CREATED"
  | "PROJECT_STATUS_CHANGED"
  | "COMMENT_ADDED"
  | "MEMBER_ADDED";

export interface Notification {
  _id: string;
  userId: string;
  organizationId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntity: {
    entityType: "TASK" | "PROJECT" | null;
    entityId: string | null;
  };
  createdAt: string;
  updatedAt: string;
}
