import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Header from "../components/Header.jsx";
import StudentCourseView from "../components/StudentCourseView.jsx";
import InstructorCourseView from "../components/InstructorCourseView.jsx";
import { useRealtimeSync } from "../utils/realtime.js";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("edutrack_user") || "null");
  const isInstructor = user?.role === "instructor";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/courses/${id}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "This course is no longer available.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeSync(load);

  return (
    <div style={{ minHeight: "100vh", padding: "28px 16px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Header active="mine" />

        {error ? (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "24px 20px", textAlign: "center", marginTop: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>
              Course Unavailable
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>{error}</div>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "var(--ink)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : loading ? (
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Loading...</div>
        ) : !data ? null : isInstructor ? (
          <InstructorCourseView course={data.course} lessons={data.lessons} quiz={data.quiz} onReload={load} />
        ) : (
          <StudentCourseView course={data.course} lessons={data.lessons} quiz={data.quiz} onReload={load} />
        )}
      </div>
    </div>
  );
}
