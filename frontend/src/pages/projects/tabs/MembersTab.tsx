export default function MembersTab({ members }: any) {
  return (
    <div className="card">
      <h3>Project Members</h3>

      <div style={{ marginTop: "15px" }}>
        {members.map((m: any, i: number) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "10px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <span>{m.name}</span>

            <select defaultValue={m.role}>
              <option>Admin</option>
              <option>Member</option>
              <option>Viewer</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}