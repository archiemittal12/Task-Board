const members = [
  { name: "Archie", role: "Admin" },
  { name: "Rahul", role: "Member" },
  { name: "Priya", role: "Viewer" },
];

export default function MembersTab() {
  return (
    <div className="card">
      <h3>Project Members</h3>

      <div style={{ marginTop: 20 }}>
        {members.map((m, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span>{m.name}</span>
            <span>{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}