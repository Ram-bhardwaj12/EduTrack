import React, { useEffect, useState } from "react";
import api from "../api/client.js";
import { colorFor } from "../courseColors.js";
import { broadcastLocalUpdate } from "../utils/realtime.js";
import RosterModal from "./RosterModal.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function InstructorCourseView({ course, lessons, quiz, onReload }) {
  const { showToast } = useToast();
  const color = colorFor(course._id);
  const [progress, setProgress] = useState(null);
  const [showRosterModal, setShowRosterModal] = useState(false);

  const [showAddLesson, setShowAddLesson] = useState(false);
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonVideo, setLessonVideo] = useState("");
  const [savingLesson, setSavingLesson] = useState(false);

  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [quizTitle, setQuizTitle] = useState(quiz?.title || "");
  const [questions, setQuestions] = useState([{ text: "", options: ["", ""], correctIndex: 0 }]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [course._id]);

  async function loadProgress() {
    try {
      const res = await api.get(`/courses/${course._id}/progress`);
      setProgress(res.data);
    } catch {
      // Non-fatal — progress panel just stays hidden if this fails.
    }
  }

  // The course-detail payload only ever carries the sanitized quiz (no correctIndex,
  // since that endpoint also serves students). Editing needs the real answers, so
  // fetch the instructor-only /quiz/manage endpoint fresh each time the editor opens.
  async function openQuizEditor() {
    setLoadingQuiz(true);
    try {
      const res = await api.get(`/courses/${course._id}/quiz/manage`);
      setQuizTitle(res.data.title);
      setQuestions(res.data.questions.length ? res.data.questions : [{ text: "", options: ["", ""], correctIndex: 0 }]);
    } catch {
      // No quiz yet for this course — start from a blank one.
      setQuizTitle("");
      setQuestions([{ text: "", options: ["", ""], correctIndex: 0 }]);
    } finally {
      setLoadingQuiz(false);
      setShowQuizEditor(true);
    }
  }

  async function handleAddLesson(e) {
    e.preventDefault();
    if (!lessonTitle) return;
    setSavingLesson(true);
    try {
      await api.post(`/courses/${course._id}/lessons`, {
        title: lessonTitle,
        content: lessonContent,
        videoUrl: lessonVideo,
      });
      broadcastLocalUpdate("COURSE_MUTATED", { action: "add_lesson", courseId: course._id });
      setLessonTitle("");
      setLessonContent("");
      setLessonVideo("");
      setShowAddLesson(false);
      onReload();
    } finally {
      setSavingLesson(false);
    }
  }

  async function handleDeleteLesson(lessonId) {
    await api.delete(`/courses/${course._id}/lessons/${lessonId}`);
    broadcastLocalUpdate("COURSE_MUTATED", { action: "delete_lesson", courseId: course._id });
    onReload();
  }

  function updateQuestion(idx, patch) {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function updateOption(qIdx, oIdx, value) {
    setQuestions(
      questions.map((q, i) => (i === qIdx ? { ...q, options: q.options.map((o, j) => (j === oIdx ? value : o)) } : q))
    );
  }

  function addQuestion() {
    setQuestions([...questions, { text: "", options: ["", ""], correctIndex: 0 }]);
  }

  function addOption(qIdx) {
    setQuestions(questions.map((q, i) => (i === qIdx ? { ...q, options: [...q.options, ""] } : q)));
  }

  async function handleSaveQuiz(e) {
    e.preventDefault();
    setSavingQuiz(true);
    try {
      await api.post(`/courses/${course._id}/quiz`, { title: quizTitle, questions });
      broadcastLocalUpdate("COURSE_MUTATED", { action: "upsert_quiz", courseId: course._id });
      setShowQuizEditor(false);
      onReload();
    } finally {
      setSavingQuiz(false);
    }
  }

  const [togglingHide, setTogglingHide] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleToggleHide() {
    setTogglingHide(true);
    try {
      await api.put(`/courses/${course._id}`, { isHidden: !course.isHidden });
      broadcastLocalUpdate("COURSE_MUTATED", { action: "update", courseId: course._id });
      onReload();
    } catch (err) {
      alert(err.response?.data?.error || "Could not update course visibility");
    } finally {
      setTogglingHide(false);
    }
  }

  async function handleDeleteCourse() {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This will permanently remove all lessons, quizzes, and student enrollments.`)) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/courses/${course._id}`);
      broadcastLocalUpdate("COURSE_MUTATED", { action: "delete", courseId: course._id });
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete course");
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{
          border: "none",
          background: "none",
          color: "#8C919E",
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
            <span style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.85)", fontWeight: 500 }}>
              {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
            </span>
            {course.isHidden ? (
              <span style={{ background: "rgba(255, 255, 255, 0.25)", color: "#FFFFFF", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                Hidden
              </span>
            ) : (
              <span style={{ background: "rgba(255, 255, 255, 0.25)", color: "#FFFFFF", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                Public
              </span>
            )}
          </div>

          <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, lineHeight: 1.25, marginBottom: 8 }}>
            {course.title}
          </div>

          {course.description && (
            <div style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.88)", lineHeight: 1.5, maxWidth: 560 }}>
              {course.description}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={handleToggleHide}
            disabled={togglingHide}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "#FFFFFF",
              color: "#11141A",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {togglingHide ? "Updating..." : course.isHidden ? "Publish course" : "Hide course"}
          </button>
          <button
            onClick={handleDeleteCourse}
            disabled={deleting}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              background: "rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {deleting ? "Deleting..." : "Delete course"}
          </button>
        </div>
      </div>

      {progress && (
        <div style={{ background: "#FFFFFF", border: "1px solid #EAECEF", borderRadius: 14, padding: "20px 24px", marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#8C919E", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Class Average Completion
            </div>
            <button
              onClick={() => setShowRosterModal(true)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--ink)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              View Student Roster
            </button>
          </div>
          <div style={{ height: 8, background: "#EAECEF", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ width: `${progress.avgPct}%`, height: "100%", background: color.headerBg, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill label={`${progress.enrolledCount} enrolled`} />
            <Pill label={`${progress.onTrack} on track`} dot="#31A390" />
            <Pill label={`${progress.stalled} stalled`} dot="#C86943" />
            {progress.quizAvg !== null && <Pill label={`Quiz avg: ${progress.quizAvg}%`} mono />}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>Lessons</div>
        <button
          onClick={() => setShowAddLesson(!showAddLesson)}
          style={{ padding: "6px 12px", borderRadius: 5, border: "1px solid var(--border)", background: "#fff", fontSize: 12, fontWeight: 600 }}
        >
          {showAddLesson ? "Cancel" : "+ Lesson"}
        </button>
      </div>

      {showAddLesson && (
        <form onSubmit={handleAddLesson} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 16, marginBottom: 12 }}>
          <input
            placeholder="Lesson title"
            required
            value={lessonTitle}
            onChange={(e) => setLessonTitle(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", marginBottom: 8, borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
          />
          <textarea
            placeholder="Lesson content"
            value={lessonContent}
            onChange={(e) => setLessonContent(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "8px 10px", marginBottom: 8, borderRadius: 6, border: "1px solid var(--border)", fontSize: 13, resize: "vertical" }}
          />
          <input
            placeholder="Video URL (optional)"
            value={lessonVideo}
            onChange={(e) => setLessonVideo(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
          />
          <button type="submit" disabled={savingLesson} style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "var(--ink)", color: "#fff", fontWeight: 600, fontSize: 12 }}>
            {savingLesson ? "Saving..." : "Add lesson"}
          </button>
        </form>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--border)", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
        {lessons.map((lesson, i) => (
          <div key={lesson._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--card)", padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", width: 18 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: 13 }}>{lesson.title}</span>
            </div>
            <button onClick={() => handleDeleteLesson(lesson._id)} style={{ border: "none", background: "none", color: "var(--faint)", fontSize: 11 }}>
              Delete
            </button>
          </div>
        ))}
        {lessons.length === 0 && <div style={{ padding: 16, fontSize: 13, color: "var(--muted)", background: "var(--card)" }}>No lessons yet — add your first one above.</div>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700 }}>Quiz</div>
        <button
          onClick={() => (showQuizEditor ? setShowQuizEditor(false) : openQuizEditor())}
          disabled={loadingQuiz}
          style={{ padding: "6px 12px", borderRadius: 5, border: "1px solid var(--border)", background: "#fff", fontSize: 12, fontWeight: 600 }}
        >
          {loadingQuiz ? "Loading..." : showQuizEditor ? "Cancel" : quiz ? "Edit quiz" : "+ Quiz"}
        </button>
      </div>

      {!showQuizEditor && quiz && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 18px", fontSize: 13 }}>
          {quiz.title} · {quiz.questions.length} questions
        </div>
      )}
      {!showQuizEditor && !quiz && (
        <div style={{ fontSize: 13, color: "var(--muted)" }}>No quiz yet for this course.</div>
      )}

      {showQuizEditor && (
        <form onSubmit={handleSaveQuiz} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
          <input
            placeholder="Quiz title"
            required
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", marginBottom: 14, borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
          />
          {questions.map((q, qi) => (
            <div key={qi} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
              <input
                placeholder={`Question ${qi + 1}`}
                required
                value={q.text}
                onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                style={{ width: "100%", padding: "8px 10px", marginBottom: 8, borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }}
              />
              {q.options.map((opt, oi) => (
                <div key={oi} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctIndex === oi}
                    onChange={() => updateQuestion(qi, { correctIndex: oi })}
                  />
                  <input
                    placeholder={`Option ${oi + 1}`}
                    required
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    style={{ flex: 1, padding: "6px 9px", borderRadius: 5, border: "1px solid var(--border)", fontSize: 12 }}
                  />
                </div>
              ))}
              <button type="button" onClick={() => addOption(qi)} style={{ border: "none", background: "none", color: "var(--muted)", fontSize: 11, padding: 0 }}>
                + Add option
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={addQuestion} style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border)", background: "#fff", fontSize: 12, fontWeight: 600 }}>
              + Add question
            </button>
            <button type="submit" disabled={savingQuiz} style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "var(--ink)", color: "#fff", fontWeight: 600, fontSize: 12 }}>
              {savingQuiz ? "Saving..." : "Save quiz"}
            </button>
          </div>
        </form>
      )}

      {showRosterModal && (
        <RosterModal
          courseTitle={course.title}
          enrolledCount={progress?.enrolledCount || 0}
          onTrack={progress?.onTrack || 0}
          stalled={progress?.stalled || 0}
          quizAvg={progress?.quizAvg}
          onClose={() => setShowRosterModal(false)}
        />
      )}
    </div>
  );
}

function Pill({ label, dot, mono }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 14, background: "var(--track)", fontSize: 11 }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot }} />}
      <span style={{ fontFamily: mono ? "var(--font-mono)" : "inherit", color: "var(--ink)" }}>{label}</span>
    </div>
  );
}
