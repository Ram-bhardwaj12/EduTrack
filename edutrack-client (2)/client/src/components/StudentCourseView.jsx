import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { colorFor, initials } from "../courseColors.js";
import { getYoutubeEmbedUrl } from "../utils/youtube.js";
import CertificateModal from "./CertificateModal.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function StudentCourseView({ course, lessons, quiz, onReload }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const color = colorFor(course._id);
  const user = JSON.parse(localStorage.getItem("edutrack_user") || "null");

  const [openLessonId, setOpenLessonId] = useState(lessons[0]?._id ?? null);
  const [completedMap, setCompletedMap] = useState({});
  const [completing, setCompleting] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Lesson Personal Notes state
  const [notesMap, setNotesMap] = useState({});

  useEffect(() => {
    // Load local saved notes for lessons
    const initialNotes = {};
    lessons.forEach((l) => {
      const saved = localStorage.getItem(`edutrack_note_${l._id}`);
      if (saved) initialNotes[l._id] = saved;
    });
    setNotesMap(initialNotes);
  }, [lessons]);

  function handleSaveNote(lessonId, text) {
    setNotesMap({ ...notesMap, [lessonId]: text });
    localStorage.setItem(`edutrack_note_${lessonId}`, text);
    showToast("Personal note saved!", "info");
  }

  const completedCount = Object.keys(completedMap).length;
  const is100Completed = lessons.length > 0 && completedCount === lessons.length;

  async function markComplete(lessonId) {
    setCompleting(lessonId);
    try {
      await api.post(`/courses/${course._id}/lessons/${lessonId}/complete`);
      const newMap = { ...completedMap, [lessonId]: true };
      setCompletedMap(newMap);
      showToast("Lesson marked as complete", "success");
      if (onReload) onReload();

      if (Object.keys(newMap).length === lessons.length) {
        showToast("Congratulations! You completed 100% of this course!", "success");
      }
    } finally {
      setCompleting(null);
    }
  }

  async function submitQuiz(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post(`/courses/${course._id}/quiz/submit`, { answers });
      setResult(res.data);
      showToast(`Quiz submitted! Score: ${res.data.score}/${res.data.total}`, "success");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate("/dashboard")}
        style={{
          border: "none",
          background: "none",
          color: "var(--muted)",
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        &larr; Back to courses
      </button>

      {/* Hero Header Banner */}
      <div
        style={{
          background: color.headerBg,
          borderRadius: 16,
          padding: "26px 28px",
          color: "#FFFFFF",
          marginBottom: 24,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              {initials(course.instructorName)}
            </div>
            <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}>
              {course.instructorName || "Instructor"}
            </span>
            <span style={{ color: "rgba(255, 255, 255, 0.4)" }}>·</span>
            <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}>
              {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
            </span>
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, lineHeight: 1.25, marginBottom: 10 }}>
            {course.title}
          </div>

          {course.description && (
            <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.5, maxWidth: 560 }}>
              {course.description}
            </div>
          )}
        </div>

        {/* Certificate Button */}
        <div>
          <button
            onClick={() => setShowCertModal(true)}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#FFFFFF",
              color: "#11141A",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            Certificate
          </button>
        </div>
      </div>

      {/* Lessons Section Header */}
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--ink)", marginBottom: 14 }}>
        Course Lessons
      </div>

      {/* Lessons Accordion */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          marginBottom: 28,
        }}
      >
        {lessons.map((lesson, i) => {
          const isOpen = openLessonId === lesson._id;
          const isDone = Boolean(completedMap[lesson._id]);

          return (
            <div key={lesson._id} style={{ borderBottom: i < lessons.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div
                onClick={() => setOpenLessonId(isOpen ? null : lesson._id)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 20px",
                  cursor: "pointer",
                  background: isOpen ? "var(--bg)" : "var(--card)",
                  transition: "background 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--muted)", width: 22 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{lesson.title}</span>
                  {isDone && (
                    <span style={{ background: "#E6F6F3", color: "#31A390", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>
                      Completed
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: isOpen ? color.headerBg : "var(--muted)" }}>
                  {isOpen ? "Hide" : "View"}
                </span>
              </div>

              {isOpen && (
                <div className="et-fade-in" style={{ padding: "16px 20px 22px 56px", background: "var(--card)" }}>
                  {lesson.videoUrl && (() => {
                    const embedUrl = getYoutubeEmbedUrl(lesson.videoUrl);
                    return embedUrl ? (
                      <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, marginBottom: 16, borderRadius: 10, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                        <iframe
                          src={embedUrl}
                          title={lesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                        />
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, marginBottom: 12 }}>
                        <a href={lesson.videoUrl} target="_blank" rel="noreferrer" style={{ color: color.headerBg, fontWeight: 700 }}>
                          Watch video lesson &rarr;
                        </a>
                      </div>
                    );
                  })()}

                  <div style={{ fontSize: 14, color: "var(--ink)", lineHeight: 1.65, whiteSpace: "pre-wrap", marginBottom: 16 }}>
                    {lesson.content || "No written notes for this lesson."}
                  </div>

                  {/* Personal Lesson Notes Area */}
                  <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)", marginBottom: 6 }}>
                      Personal Study Notes
                    </div>
                    <textarea
                      placeholder="Write your study notes and key takeaways here..."
                      value={notesMap[lesson._id] || ""}
                      onChange={(e) => setNotesMap({ ...notesMap, [lesson._id]: e.target.value })}
                      rows={2}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        fontSize: 13,
                        outline: "none",
                        resize: "vertical",
                        background: "var(--card)",
                        color: "var(--ink)",
                        marginBottom: 8,
                      }}
                    />
                    <button
                      onClick={() => handleSaveNote(lesson._id, notesMap[lesson._id] || "")}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 6,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                        color: "var(--ink)",
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Save Note
                    </button>
                  </div>

                  <button
                    onClick={() => markComplete(lesson._id)}
                    disabled={completing === lesson._id || isDone}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: "none",
                      background: isDone ? "#E6F6F3" : "#181B22",
                      color: isDone ? "#31A390" : "#FFFFFF",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: isDone ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {completing === lesson._id ? "Updating..." : isDone ? "Completed" : "Mark as complete"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {lessons.length === 0 && <div style={{ padding: 20, fontSize: 13, color: "#8C919E" }}>No lessons available yet.</div>}
      </div>

      {/* Quiz Section */}
      {quiz && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EAECEF", borderRadius: 14, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: showQuiz ? 20 : 0 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#11141A" }}>{quiz.title}</div>
              <div style={{ fontSize: 12, color: "#8C919E", marginTop: 2 }}>{quiz.questions.length} questions included</div>
            </div>
            {!showQuiz && (
              <button
                onClick={() => setShowQuiz(true)}
                style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: color.headerBg, color: "#FFFFFF", fontWeight: 700, fontSize: 13, cursor: "pointer" }}
              >
                Take Quiz &rarr;
              </button>
            )}
          </div>

          {showQuiz && !result && (
            <form onSubmit={submitQuiz}>
              {quiz.questions.map((q, qi) => (
                <div key={q._id} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#11141A", marginBottom: 10 }}>
                    {qi + 1}. {q.text}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[q._id] === oi;
                      return (
                        <div
                          key={oi}
                          onClick={() => setAnswers({ ...answers, [q._id]: oi })}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: isSelected ? `2px solid ${color.headerBg}` : "1px solid #E2E8F0",
                            background: isSelected ? color.tint : "#F8FAFC",
                            color: isSelected ? "#11141A" : "#334155",
                            fontWeight: isSelected ? 600 : 400,
                            fontSize: 13,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              border: isSelected ? `5px solid ${color.headerBg}` : "2px solid #CBD5E1",
                              background: "#FFFFFF",
                              flexShrink: 0,
                            }}
                          />
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  border: "none",
                  background: "#181B22",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  marginTop: 6,
                }}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </form>
          )}

          {result && (
            <div className="et-fade-in" style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#8C919E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>
                🎉 Quiz Result
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: color.headerBg }}>
                {result.score} / {result.total}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#11141A", marginTop: 4 }}>
                {Math.round((result.score / result.total) * 100)}% Correct
              </div>
            </div>
          )}
        </div>
      )}

      {showCertModal && (
        <CertificateModal
          studentName={user?.name}
          courseTitle={course.title}
          instructorName={course.instructorName}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </div>
  );
}
