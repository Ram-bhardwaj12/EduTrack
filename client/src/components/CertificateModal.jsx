import React from "react";

export default function CertificateModal({ studentName, courseTitle, instructorName, onClose }) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(17, 20, 26, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
      }}
    >
      <div
        className="et-fade-in"
        style={{
          background: "#FFFFFF",
          borderRadius: 20,
          width: "100%",
          maxWidth: 680,
          padding: "40px 48px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          border: "8px solid #FAF5E4",
          position: "relative",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            background: "#F1F3F5",
            width: 32,
            height: 32,
            borderRadius: "50%",
            fontSize: 18,
            color: "#666",
            cursor: "pointer",
          }}
        >
          &times;
        </button>

        {/* Certificate Decorative Outer Border */}
        <div style={{ border: "2px solid #D4952A", padding: 30, borderRadius: 12, background: "#FCFAF4" }}>
          {/* Header Seal */}
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "#D4952A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              margin: "0 auto 16px auto",
              boxShadow: "0 4px 12px rgba(212,149,42,0.3)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 2, color: "#D4952A", marginBottom: 6 }}>
            Certificate of Completion
          </div>

          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 20 }}>
            This certifies that
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "#0F172A", borderBottom: "2px solid #E2E8F0", paddingBottom: 10, display: "inline-block", minWidth: 260, marginBottom: 20 }}>
            {studentName || "Student"}
          </div>

          <div style={{ fontSize: 14, color: "#64748B", marginBottom: 8 }}>
            has successfully completed the course
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#4463C4", marginBottom: 28 }}>
            "{courseTitle}"
          </div>

          {/* Footer Dates & Signature */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 30, paddingTop: 20, borderTop: "1px dashed #CBD5E1" }}>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700 }}>Date Issued</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginTop: 2 }}>{currentDate}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 700, color: "#0F172A", fontStyle: "italic" }}>
                {instructorName || "EduTrack Instructor"}
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, marginTop: 2 }}>Course Instructor</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => window.print()}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: "#181B22",
              color: "#FFFFFF",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
