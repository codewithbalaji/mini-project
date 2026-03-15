import Notification from "../models/Notification.js";

// GET /api/notifications — current user's notifications
export const getNotifications = async (req, res) => {
  try {
    const { id: userId, organizationId } = req.user;

    const notifications = await Notification.find({ userId, organizationId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, organizationId, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: "Notification not found" });

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
