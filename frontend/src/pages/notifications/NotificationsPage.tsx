import { Bell, CheckCircle } from "lucide-react";
import { useState } from "react";

const initialNotifications = [
  {
    id: 1,
    text: "You were assigned to 'Design UI'",
    read: false,
    time: "2 min ago",
  },
  {
    id: 2,
    text: "Rahul commented on 'API Integration'",
    read: false,
    time: "10 min ago",
  },
  {
    id: 3,
    text: "Task 'Login Page' marked as Done",
    read: true,
    time: "1 hour ago",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  return (
    <div>
      <h2>Notifications</h2>

      <div style={{ marginTop: 20 }}>
        {notifications.map((n) => (
          <div
            key={n.id}
            className="notification-card"
            onClick={() => markAsRead(n.id)}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <Bell size={18} />

              <div>
                <p>{n.text}</p>
                <span>{n.time}</span>
              </div>
            </div>

            {!n.read && (
              <span className="unread-dot"></span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}