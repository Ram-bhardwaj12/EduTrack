import React from "react";

export default function RosterModal({ courseTitle, enrolledCount, onTrack, stalled, quizAvg, onClose }) {
  // Generate roster list for instructor view
  const mockStudents = Array.from({ length: enrolledCount || 3 }).map((_, i) => ({
    id: i + 1,
    name: ["Alex Morgan", "Rahul Sharma", "Jessica Chen", "David Miller", "Priya Patel"][i % 5],
    email: `student${i + 1}@example.com`,
    progress: Math.min(100, (i + 1) * 35),
    status: (i + 1) % 2 === 0 ? "on_track" : "stalled",
  }));

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(17, 20, 26, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 16,
      }}
    >
      <div
        className="et-fade-in"
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          width: "100%",
          maxWidth: 540,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          border: "1px solid #EAECEF",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#11141A" }}>
              Enrolled Students Roster
            </div>
            <div style={{ fontSize: 12, color: "#8C919E", marginTop: 2 }}>
              "{courseTitle}" · {enrolledCount} active student{enrolledCount === 1 ? "" : "s"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#F1F3F5",
              width: 30,
              height: 30,
              borderRadius: "50%",
              fontSize: 16,
              color: "#666",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {/* Metric Summary Badges */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          <div style={{ background: "#F8FAFC", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>ON TRACK</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#31A390", marginTop: 2 }}>{onTrack ?? 0}</div>
          </div>
          <div style={{ background: "#F8FAFC", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>STALLED</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#C86943", marginTop: 2 }}>{stalled ?? 0}</div>
          </div>
          <div style={{ background: "#F8FAFC", padding: "10px 12px", borderRadius: 10, border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700 }}>QUIZ AVG</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#4463C4", marginTop: 2 }}>{quizAvg !== null ? `${quizAvg}%` : "N/A"}</div>
          </div>
        </div>

        {/* Student List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
          {mockStudents.map((s) => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "#F8FAFC", border: "1px solid #F1F3F5" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#11141A" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "#8C919E" }}>{s.email}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: s.progress === 100 ? "#31A390" : "#4463C4" }}>{s.progress}% complete</div>
                <div style={{ fontSize: 10, color: "#8C919E", marginTop: 2 }}>{s.progress === 100 ? "Completed" : "Active"}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 20, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              background: "#181B22",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
