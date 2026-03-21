import { useState } from "react";

type Notification = {
  id: number;
  text: string;
  read: boolean;
  time: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      text: "You were assigned a task 'Design UI'",
      read: false,
      time: "2 mins ago",
    },
    {
      id: 2,
      text: "Task 'API Integration' moved to In Progress",
      read: false,
      time: "10 mins ago",
    },
    {
      id: 3,
      text: "Comment added on 'Login Page'",
      read: true,
      time: "1 hour ago",
    },
  ]);

  // ✅ TOGGLE READ/UNREAD
  const toggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: !n.read } : n
      )
    );
  };

  // ✅ MARK ALL AS READ
  const markAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  };

  return (
    <div>
      {/* 🔥 HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <h2 style={{ fontSize: 28 }}>Notifications</h2>

        <button
          onClick={markAllRead}
          style={{
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Mark All as Read
        </button>
      </div>

      {/* 🔔 LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            style={{
              padding: "14px 16px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              background: notif.read ? "#ffffff" : "#eef2ff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: notif.read
                ? "0 2px 6px rgba(0,0,0,0.05)"
                : "0 4px 12px rgba(99,102,241,0.2)",
              transition: "0.2s",
            }}
          >
            {/* TEXT */}
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: notif.read ? 500 : 700,
                }}
              >
                {notif.text}
              </p>

              <span
                style={{
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                {notif.time}
              </span>
            </div>

            {/* TOGGLE BUTTON */}
            <button
              onClick={() => toggleRead(notif.id)}
              style={{
                background: notif.read ? "#e2e8f0" : "#6366f1",
                color: notif.read ? "#0f172a" : "white",
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {notif.read ? "Mark Unread" : "Mark Read"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}