import { useEffect, useState } from "react";
import apiClient from "../../api/client";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const typeIcon: Record<string, string> = {
  TASK_ASSIGNED: "👤",
  TASK_STATUS_CHANGED: "🔄",
  COMMENT_ADDED: "💬",
  USER_MENTIONED: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get(`/notifications${showAll ? "?all=true" : ""}`);
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [showAll]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Notifications</h1>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#6366f1",
                color: "#fff",
                borderRadius: 999,
                padding: "2px 10px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {unreadCount} unread
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setShowAll((prev) => !prev)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "1px solid #e2e8f0",
              background: "#fff",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
              color: "#475569",
            }}
          >
            {showAll ? "Unread Only" : "Show All"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#6366f1",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ fontSize: 16, margin: 0 }}>
            {showAll ? "No notifications yet." : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                background: n.read ? "#fff" : "#f0f4ff",
                border: n.read ? "1px solid #e2e8f0" : "1px solid #c7d2fe",
                borderLeft: n.read ? "4px solid #e2e8f0" : "4px solid #6366f1",
                borderRadius: 12,
                padding: "14px 18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Icon */}
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: n.read ? "#f1f5f9" : "#e0e7ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {typeIcon[n.type] || "🔔"}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      color: "#1e293b",
                      fontWeight: n.read ? 400 : 600,
                    }}
                  >
                    {n.message}
                  </p>
                  <p style={{ margin: "3px 0 0 0", fontSize: 12, color: "#94a3b8" }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
              </div>

              {/* Mark as read button — only if unread */}
              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #c7d2fe",
                    background: "#fff",
                    color: "#6366f1",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 12,
                    flexShrink: 0,
                    marginLeft: 16,
                  }}
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
