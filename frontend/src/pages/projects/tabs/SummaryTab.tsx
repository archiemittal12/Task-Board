export default function SummaryTab() {
  return (
    <div className="card">
      <h3>Project Overview</h3>

      <p style={{ color: "#64748b", marginTop: 10 }}>
        This section shows project statistics and recent activity.
      </p>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
        }}
      >
        <div className="card" style={{ flex: 1 }}>
          <h4>Tasks</h4>
          <p>24</p>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h4>In Progress</h4>
          <p>8</p>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h4>Completed</h4>
          <p>12</p>
        </div>
      </div>
    </div>
  );
}