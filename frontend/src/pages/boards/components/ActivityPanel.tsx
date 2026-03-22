import { useState, useEffect } from "react";
import apiClient from "../../../api/client";
import type { ColumnType } from "../types";

interface ActivityItem {
  type: "comment" | "audit";
  createdAt: string;
  data: any;
}

type Props = {
  projectId: string;
  boardId: string;
  columnId: string;
  taskId: string;
  columns: ColumnType[];
};

const fieldLabels: Record<string, string> = {
  columnId: "Status",
  assigneeId: "Assignee",
  priority: "Priority",
  dueDate: "Due Date",
  comment: "Comment",
};

const BACKEND = "http://localhost:3000";

export default function ActivityPanel({ projectId, boardId, columnId, taskId, columns }: Props) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await apiClient.get(
          `/projects/${projectId}/boards/${boardId}/columns/${columnId}/tasks/${taskId}/activity`
        );
        if (res.data.success) setActivity(res.data.data);
      } catch (err) {
        console.error("Failed to fetch activity", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [taskId]);

  const formatTime = (d: string) =>
    new Date(d).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const resolveValue = (field: string, value: string | null): string => {
    if (!value) return "—";
    if (field === "columnId") {
      return columns.find((c) => c.id === value)?.title || value;
    }
    if (field === "assigneeId") {
      return value; // just show the id for now, could resolve to name
    }
    return value;
  };
  const renderItem = (item: ActivityItem) => {
    if (item.type === "comment") {
      const c = item.data;
      return (
        <div key={`c-${c.id}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "#6366f1",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {c.user?.avatarUrl ? (
              <img
                src={`${BACKEND}${c.user.avatarUrl}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (c.user?.name || "U")[0].toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
                {c.user?.name || "User"}
              </span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                commented · {formatTime(c.createdAt)}
              </span>
            </div>
            <div
              style={{
                marginTop: 4,
                padding: "8px 12px",
                background: "#fff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                fontSize: 13,
                color: "#334155",
                lineHeight: 1.5,
              }}
            >
              {c.content.split(/(@\w+)/g).map((part: string, i: number) =>
                part.startsWith("@") ? (
                  <strong key={i} style={{ color: "#6366f1" }}>
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </div>
          </div>
        </div>
      );
    }

    // Audit log
    const a = item.data;
    const field = fieldLabels[a.field] || a.field;
    const isComment = a.field === "comment";

    return (
      <div key={`a-${a.id}`} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "#e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          {isComment
            ? "💬"
            : a.field === "columnId"
              ? "🔄"
              : a.field === "assigneeId"
                ? "👤"
                : "✏️"}
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>
          <span style={{ fontSize: 13, color: "#475569" }}>
            <strong style={{ color: "#1e293b" }}>{field}</strong> changed
            {a.oldValue && (
              <>
                {" "}
                from{" "}
                <span
                  style={{
                    background: "#fee2e2",
                    color: "#ef4444",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {resolveValue(a.field, a.oldValue)}
                </span>
              </>
            )}
            {a.newValue && (
              <>
                {" "}
                to{" "}
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#16a34a",
                    padding: "1px 6px",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                >
                  {resolveValue(a.field, a.newValue)}
                </span>
              </>
            )}
          </span>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            {formatTime(a.createdAt)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
        Activity Timeline
      </h4>
      {loading ? (
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Loading activity...</p>
      ) : activity.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 13 }}>No activity yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {activity.map((item) => renderItem(item))}
        </div>
      )}
    </div>
  );
}
