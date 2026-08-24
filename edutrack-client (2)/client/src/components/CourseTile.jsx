import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { colorFor, initials } from "../courseColors.js";
import api from "../api/client.js";
import { broadcastLocalUpdate } from "../utils/realtime.js";

// mode: "student-mine" | "student-browse" | "instructor"
export default function CourseTile({ course, mode, onEnroll, onReload }) {
  const navigate = useNavigate();
  const color = colorFor(course._id);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const lessonCount = course.lessonCount ?? course.totalLessons ?? 0;
  const completedCount = course.completedCount ?? 0;
  const progress = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

  function openCourse() {
    navigate(`/courses/${course._id}`);
  }

  async function handleToggleHide(e) {
    e.stopPropagation();
    setToggling(true);
    try {
      await api.put(`/courses/${course._id}`, { isHidden: !course.isHidden });
      broadcastLocalUpdate("COURSE_MUTATED", { action: "update", courseId: course._id });
      if (onReload) onReload();
    } catch (err) {
      alert(err.response?.data?.error || "Could not update course visibility");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete(e) {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This will permanently remove all lessons, quizzes, and student enrollments.`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/courses/${course._id}`);
      broadcastLocalUpdate("COURSE_MUTATED", { action: "delete", courseId: course._id });
      if (onReload) onReload();
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete course");
      setDeleting(false);
    }
  }

  return (
    <div
      className="et-fade-in floating-course-card"
      style={{
        background: "var(--card)",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid var(--border)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.03)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Header Colored Banner */}
      <div
        style={{
          background: color.headerBg,
          padding: "24px 24px 22px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          minHeight: 88,
        }}
      >
        <div
          onClick={openCourse}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1.3,
            cursor: "pointer",
            flex: 1,
            paddingRight: 10,
          }}
        >
          {course.title}
        </div>
        {mode === "instructor" && course.isHidden && (
          <span
            style={{
              background: "rgba(255, 255, 255, 0.25)",
              color: "#FFFFFF",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 4,
              flexShrink: 0,
            }}
          >
            Hidden
          </span>
        )}
      </div>

      {/* Bottom Content Section */}
      <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--card)" }}>
        {mode === "instructor" ? (
          <div>
            <div style={{ fontSize: 13, marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
              <span>
                <strong style={{ fontWeight: 700, color: "var(--ink)" }}>{lessonCount}</strong>{" "}
                <span style={{ color: "var(--muted)" }}>lessons</span>
              </span>
              <span>
                <strong style={{ fontWeight: 700, color: "var(--ink)" }}>{course.enrolledCount ?? 0}</strong>{" "}
                <span style={{ color: "var(--muted)" }}>enrolled</span>
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={openCourse}
                style={{
                  padding: "9px 18px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "var(--bg)",
                  color: "var(--ink)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Manage →
              </button>

              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={handleToggleHide}
                  disabled={toggling}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    color: "var(--muted)",
                    fontWeight: 500,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {toggling ? "..." : course.isHidden ? "Unhide" : "Hide"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: "1px solid #FED7D7",
                    background: "#FFF5F5",
                    color: "#E53E3E",
                    fontWeight: 500,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {deleting ? "..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        ) : mode === "student-browse" ? (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              {course.instructorName || "Instructor"} · {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
            </div>
            <button
              onClick={() => onEnroll(course._id)}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: "#4463C4",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Enroll →
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
              {course.instructorName || "Instructor"}
            </div>
            <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${progress}%`, height: "100%", background: color.headerBg, transition: "width 0.4s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 16 }}>
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--muted)" }}>
                {completedCount} / {lessonCount} lessons
              </span>
              <span style={{ fontFamily: "var(--font-mono)", color: color.headerBg, fontWeight: 700 }}>
                {progress}%
              </span>
            </div>
            <button
              onClick={openCourse}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--bg)",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {progress === 100 ? "Review →" : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
