export default function SummaryTab({
  createdAt = "20 March 2026",
  updatedAt = "21 March 2026",
}: any) {
  return (
    <div>
      {/* 🔥 TITLE */}
      <h3 style={{ marginBottom: "10px" }}>Project Overview</h3>

      <p style={{ color: "#64748b", marginBottom: "20px" }}>
        This section shows project statistics and activity.
      </p>

      {/* 🔥 TOP SECTION (PROJECT INFO) */}
      <div
        style={{
          background: "#ffffff",
          padding: "18px",
          borderRadius: "14px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ marginBottom: "10px" }}>Project Info</h4>

        <p>
          <strong>Created At:</strong> {createdAt}
        </p>

        <p>
          <strong>Last Updated:</strong> {updatedAt}
        </p>
      </div>

      {/* 🔥 STATS SECTION */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
        }}
      >
        {/* TASKS */}
        <div
          style={{
            background: "#ffffff",
            padding: "18px",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <h4 style={{ marginBottom: "5px" }}>Tasks</h4>
          <p style={{ fontSize: "22px", fontWeight: "700" }}>
            24
          </p>
        </div>

        {/* IN PROGRESS */}
        <div
          style={{
            background: "#ffffff",
            padding: "18px",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <h4 style={{ marginBottom: "5px" }}>
            In Progress
          </h4>
          <p style={{ fontSize: "22px", fontWeight: "700" }}>
            8
          </p>
        </div>

        {/* COMPLETED */}
        <div
          style={{
            background: "#ffffff",
            padding: "18px",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            textAlign: "center",
          }}
        >
          <h4 style={{ marginBottom: "5px" }}>
            Completed
          </h4>
          <p style={{ fontSize: "22px", fontWeight: "700" }}>
            12
          </p>
        </div>
      </div>
    </div>
  );
}