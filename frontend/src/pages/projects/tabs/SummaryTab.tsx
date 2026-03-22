import { useEffect, useState } from "react";
import apiClient from "../../../api/client";

interface SummaryTabProps {
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  bugs: number;
  stories: number;
}

export default function SummaryTab({ projectId, createdAt, updatedAt }: SummaryTabProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // fetch all boards, then all columns with tasks
        const boardsRes = await apiClient.get(`/projects/${projectId}/boards`);
        if (!boardsRes.data.success) return;

        const boards = boardsRes.data.data;

        // fetch columns (with tasks) for all boards in parallel
        const columnsResults = await Promise.all(
          boards.map((b: any) =>
            apiClient.get(`/projects/${projectId}/boards/${b.id}/columns`)
          )
        );

        const allTasks = columnsResults
          .flatMap(res => res.data.success ? res.data.data : [])
          .flatMap((col: any) => col.tasks || []);

        // also fetch stories
        const storiesRes = await apiClient.get(`/projects/${projectId}/stories`);
        const stories = storiesRes.data.success ? storiesRes.data.data : [];

        setStats({
          total: allTasks.length,
          todo: allTasks.filter((t: any) => t.status === "TODO").length,
          inProgress: allTasks.filter((t: any) => t.status === "IN_PROGRESS").length,
          review: allTasks.filter((t: any) => t.status === "REVIEW").length,
          done: allTasks.filter((t: any) => t.status === "DONE").length,
          bugs: allTasks.filter((t: any) => t.type === "BUG").length,
          stories: stories.length,
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [projectId]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const cardStyle = {
    background: "#ffffff", padding: "18px",
    borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    textAlign: "center" as const,
  };

  const statCards = stats ? [
    { label: "Total Tasks", value: stats.total, color: "#6366f1" },
    { label: "To Do", value: stats.todo, color: "#94a3b8" },
    { label: "In Progress", value: stats.inProgress, color: "#f59e0b" },
    { label: "In Review", value: stats.review, color: "#3b82f6" },
    { label: "Completed", value: stats.done, color: "#22c55e" },
    { label: "Bugs", value: stats.bugs, color: "#ef4444" },
    { label: "Stories", value: stats.stories, color: "#8b5cf6" },
  ] : [];

  return (
    <div>
      <h3 style={{ marginBottom: 10, fontSize: 20 }}>Project Overview</h3>
      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Live project statistics and activity.
      </p>

      {/* Timeline */}
      <div style={{ background: "#fff", padding: 18, borderRadius: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
        <h4 style={{ marginBottom: 10 }}>Project Timeline</h4>
        <p style={{ margin: "5px 0" }}><strong>Created At:</strong> {formatDate(createdAt)}</p>
        <p style={{ margin: "5px 0" }}><strong>Last Updated:</strong> {formatDate(updatedAt)}</p>
      </div>

      {/* Stats */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading stats...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
          {statCards.map(s => (
            <div key={s.label} style={cardStyle}>
              <h4 style={{ marginBottom: 5, color: "#64748b", fontSize: 13 }}>{s.label}</h4>
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}