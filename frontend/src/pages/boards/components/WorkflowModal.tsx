import { useState, useEffect } from "react";
import apiClient from "../../../api/client";
import type { ColumnType } from "../types";

type WorkflowModalProps = {
  projectId: string;
  boardId: string;
  columns: ColumnType[];
  onClose: () => void;
};

interface Transition {
  fromColumnId: string;
  toColumnId: string;
  boardId: string;
}

export default function WorkflowModal({
  projectId,
  boardId,
  columns,
  onClose,
}: WorkflowModalProps) {
  const [transitions, setTransitions] = useState<Transition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // key being toggled

  const fetchTransitions = async () => {
    try {
      const res = await apiClient.get(`/projects/${projectId}/boards/${boardId}/transitions`);
      if (res.data.success) setTransitions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch transitions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransitions();
  }, []);

  const isAllowed = (fromId: string, toId: string) =>
    transitions.some((t) => t.fromColumnId === fromId && t.toColumnId === toId);

  const handleToggle = async (fromId: string, toId: string) => {
    const key = `${fromId}-${toId}`;
    setSaving(key);
    try {
      if (isAllowed(fromId, toId)) {
        await apiClient.delete(`/projects/${projectId}/boards/${boardId}/transitions`, {
          data: { fromColumnId: fromId, toColumnId: toId },
        });
        setTransitions((prev) =>
          prev.filter((t) => !(t.fromColumnId === fromId && t.toColumnId === toId))
        );
      } else {
        await apiClient.post(`/projects/${projectId}/boards/${boardId}/transitions`, {
          fromColumnId: fromId,
          toColumnId: toId,
        });
        setTransitions((prev) => [...prev, { fromColumnId: fromId, toColumnId: toId, boardId }]);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update transition");
    } finally {
      setSaving(null);
    }
  };

  const hasRules = transitions.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "min(720px, 96vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "24px 24px 0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
              Edit Workflow
            </h2>
            <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#64748b" }}>
              Define which column transitions are allowed. If any rules are set,{" "}
              <strong>only those moves will be permitted</strong>. If no rules are set, all moves
              are allowed.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: 8,
              width: 32,
              height: 32,
              cursor: "pointer",
              fontSize: 16,
              color: "#64748b",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* STATUS BANNER */}
        <div
          style={{
            margin: "16px 24px 0 24px",
            padding: "10px 14px",
            borderRadius: 10,
            background: hasRules ? "#fef3c7" : "#dcfce7",
            border: `1px solid ${hasRules ? "#fcd34d" : "#86efac"}`,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: hasRules ? "#92400e" : "#166534" }}>
            {hasRules
              ? `⚠️ ${transitions.length} rule${transitions.length !== 1 ? "s" : ""} active — only checked transitions are allowed`
              : "✅ No rules set — all column moves are currently allowed"}
          </span>
        </div>

        {/* MATRIX */}
        <div style={{ padding: "20px 24px 24px 24px" }}>
          {loading ? (
            <p style={{ color: "#94a3b8" }}>Loading transitions...</p>
          ) : columns.length < 2 ? (
            <p style={{ color: "#94a3b8" }}>
              You need at least 2 columns to define transition rules.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>
                Each row is the <strong>source</strong> column. Each column header is the{" "}
                <strong>destination</strong>. Check a cell to allow that move.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          color: "#64748b",
                          fontWeight: 600,
                          borderBottom: "2px solid #e2e8f0",
                          minWidth: 120,
                        }}
                      >
                        From ↓ / To →
                      </th>
                      {columns.map((col) => (
                        <th
                          key={col.id}
                          style={{
                            padding: "8px 12px",
                            color: "#1e293b",
                            fontWeight: 700,
                            borderBottom: "2px solid #e2e8f0",
                            textAlign: "center",
                            minWidth: 100,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 3,
                            }}
                          >
                            <span>{col.title}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>
                              {(col.status as string).replace("_", " ")}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {columns.map((fromCol, rowIdx) => (
                      <tr
                        key={fromCol.id}
                        style={{ background: rowIdx % 2 === 0 ? "#f8fafc" : "#fff" }}
                      >
                        <td
                          style={{
                            padding: "10px 12px",
                            fontWeight: 700,
                            color: "#1e293b",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <span>{fromCol.title}</span>
                            <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>
                              {(fromCol.status as string).replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        {columns.map((toCol) => {
                          const isSame = fromCol.id === toCol.id;
                          const allowed = isAllowed(fromCol.id, toCol.id);
                          const key = `${fromCol.id}-${toCol.id}`;
                          const isSaving = saving === key;

                          return (
                            <td
                              key={toCol.id}
                              style={{
                                textAlign: "center",
                                padding: "10px 12px",
                                borderBottom: "1px solid #e2e8f0",
                              }}
                            >
                              {isSame ? (
                                <span style={{ color: "#cbd5e1", fontSize: 16 }}>—</span>
                              ) : (
                                <button
                                  onClick={() => handleToggle(fromCol.id, toCol.id)}
                                  disabled={isSaving}
                                  title={
                                    allowed
                                      ? `Remove: ${fromCol.title} → ${toCol.title}`
                                      : `Allow: ${fromCol.title} → ${toCol.title}`
                                  }
                                  style={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 6,
                                    border: allowed ? "2px solid #6366f1" : "2px solid #e2e8f0",
                                    background: allowed ? "#6366f1" : "#fff",
                                    cursor: isSaving ? "not-allowed" : "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 14,
                                    color: allowed ? "#fff" : "#cbd5e1",
                                    transition: "all 0.15s",
                                    opacity: isSaving ? 0.5 : 1,
                                    margin: "0 auto",
                                  }}
                                >
                                  {isSaving ? "..." : allowed ? "✓" : ""}
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* QUICK ACTIONS */}
              <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  onClick={async () => {
                    // Add all sequential transitions A→B, B→C, C→D
                    for (let i = 0; i < columns.length - 1; i++) {
                      const from = columns[i];
                      const to = columns[i + 1];
                      if (!isAllowed(from.id, to.id)) {
                        await handleToggle(from.id, to.id);
                      }
                    }
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #6366f1",
                    background: "#eef2ff",
                    color: "#6366f1",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  ⚡ Add Sequential Flow
                </button>
                <button
                  onClick={async () => {
                    // Remove all transitions
                    for (const t of [...transitions]) {
                      await handleToggle(t.fromColumnId, t.toColumnId);
                    }
                  }}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "1px solid #fee2e2",
                    background: "#fef2f2",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  🗑 Clear All Rules
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ padding: "0 24px 24px 24px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "#6366f1",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
