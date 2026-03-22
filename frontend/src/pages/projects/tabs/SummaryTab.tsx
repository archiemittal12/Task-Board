export default function SummaryTab({ createdAt, updatedAt }: { createdAt: string, updatedAt: string }) {
  // Format the ISO date strings to readable dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <h3 style={{ marginBottom: "10px", fontSize: "20px" }}>Project Overview</h3>
      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        This section shows project statistics and activity.
      </p>

      {/* PROJECT INFO */}
      <div
        style={{
          background: "#ffffff",
          padding: "18px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Project Timeline</h4>
        <p style={{ margin: "5px 0" }}><strong>Created At:</strong> {formatDate(createdAt)}</p>
        <p style={{ margin: "5px 0" }}><strong>Last Updated:</strong> {formatDate(updatedAt)}</p>
      </div>

      {/* STATS SECTION (Currently Dummy Data) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
        }}
      >
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <h4 style={{ marginBottom: "5px", color: "#64748b" }}>Tasks</h4>
          <p style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>24</p>
        </div>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <h4 style={{ marginBottom: "5px", color: "#64748b" }}>In Progress</h4>
          <p style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>8</p>
        </div>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
          <h4 style={{ marginBottom: "5px", color: "#64748b" }}>Completed</h4>
          <p style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}>12</p>
        </div>
      </div>
    </div>
  );
}