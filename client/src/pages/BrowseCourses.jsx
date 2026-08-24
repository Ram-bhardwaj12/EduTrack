import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Header from "../components/Header.jsx";
import CourseTile from "../components/CourseTile.jsx";
import { useRealtimeSync } from "../utils/realtime.js";

export default function BrowseCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrollingId, setEnrollingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/courses");
      setCourses(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load courses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeSync(load);

  async function handleEnroll(courseId) {
    setEnrollingId(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not enroll");
    } finally {
      setEnrollingId(null);
    }
  }

  const filteredCourses = courses.filter((c) => {
    const titleText = (c.title || "").toLowerCase();
    const instructorText = (c.instructorName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return titleText.includes(query) || instructorText.includes(query);
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F6F6F4", padding: "28px 16px 60px 16px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Header active="browse" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "#11141A" }}>
            Explore All Courses
          </div>
          <span style={{ fontSize: 13, color: "#8C919E", fontWeight: 500 }}>
            {filteredCourses.length} available
          </span>
        </div>

        {/* Search Box */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#8C919E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search courses by name or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px 10px 40px",
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
              fontSize: 14,
              outline: "none",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          />
        </div>

        {error && <div style={{ color: "#B5502F", fontSize: 13, marginBottom: 14 }}>{error}</div>}

        {loading ? (
          <div style={{ fontSize: 13, color: "#8C919E" }}>Loading catalog...</div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ background: "#FFFFFF", border: "1px solid #EAECEF", borderRadius: 14, padding: "36px 20px", textAlign: "center", color: "#8C919E", fontSize: 14 }}>
            No courses found matching "{searchQuery}".
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {filteredCourses.map((c) => (
              <CourseTile key={c._id} course={c} mode="student-browse" onEnroll={handleEnroll} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
