import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Header from "../components/Header.jsx";
import CourseTile from "../components/CourseTile.jsx";
import EditProfileModal from "../components/EditProfileModal.jsx";
import { useRealtimeSync, broadcastLocalUpdate } from "../utils/realtime.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("edutrack_user") || "null"));
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const isInstructor = currentUser?.role === "instructor";

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0, completedLessons: 0, avgCompletion: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isInstructor) {
        const res = await api.get("/courses/mine");
        if (Array.isArray(res.data)) {
          setCourses(res.data);
          setStats({ totalCourses: res.data.length, totalStudents: res.data.reduce((s, c) => s + (c.enrolledCount || 0), 0), avgCompletion: 0 });
        } else {
          setCourses(res.data.courses || []);
          setStats(res.data.stats || {});
        }
      } else {
        const res = await api.get("/enrollments/me");
        if (Array.isArray(res.data)) {
          setCourses(res.data);
          setStats({ totalCourses: res.data.length, completedLessons: 0, avgCompletion: 0 });
        } else {
          setCourses(res.data.courses || []);
          setStats(res.data.stats || {});
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not load your courses");
    } finally {
      setLoading(false);
    }
  }, [isInstructor]);

  useEffect(() => {
    load();
  }, [load]);

  useRealtimeSync(load);

  const filteredCourses = courses.filter((c) => {
    const titleText = (c.title || c.course?.title || "").toLowerCase();
    const instructorText = (c.instructorName || c.course?.instructorName || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = titleText.includes(query) || instructorText.includes(query);
    if (!matchesQuery) return false;

    if (isInstructor) {
      if (filterTab === "active") return !c.isHidden;
      if (filterTab === "hidden") return c.isHidden;
    } else {
      const lessonCount = c.totalLessons || 0;
      const completedCount = c.completedCount || 0;
      const isFinished = lessonCount > 0 && completedCount === lessonCount;
      if (filterTab === "completed") return isFinished;
      if (filterTab === "in_progress") return !isFinished;
    }
    return true;
  });

  function handleProfileUpdated(updatedUser) {
    setCurrentUser(updatedUser);
    load();
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!newTitle) return;
    setCreating(true);
    try {
      const res = await api.post("/courses", { title: newTitle, description: newDescription });
      broadcastLocalUpdate("COURSE_MUTATED", { action: "create", courseId: res.data._id });
      setShowNewCourse(false);
      setNewTitle("");
      setNewDescription("");
      navigate(`/courses/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create course");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "28px 16px 60px 16px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Header active="mine" onProfileUpdated={handleProfileUpdated} />

        {/* Welcome Section */}
        <div style={{ marginTop: 10, marginBottom: 28 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
            Welcome back {currentUser?.title && `· ${currentUser.title}`}
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginTop: 4 }}>
            {currentUser?.name || "User"}
          </div>
        </div>

        {/* Analytics Metric Cards (3 top summary cards) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
          {/* Card 1: COURSES */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "20px 22px", border: "1px solid #EAECEF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#EEF2FD", color: "#4463C4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8C919E", letterSpacing: 0.6 }}>COURSES</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: "#11141A", marginTop: 14 }}>
              {stats.totalCourses ?? courses.length}
            </div>
          </div>

          {/* Card 2: STUDENTS / LESSONS */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "20px 22px", border: "1px solid #EAECEF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#E6F6F3", color: "#31A390", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isInstructor ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8C919E", letterSpacing: 0.6 }}>
                {isInstructor ? "STUDENTS" : "COMPLETED LESSONS"}
              </span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: "#11141A", marginTop: 14 }}>
              {isInstructor ? (stats.totalStudents ?? 0) : (stats.completedLessons ?? 0)}
            </div>
          </div>

          {/* Card 3: AVG. COMPLETION */}
          <div style={{ background: "#FFFFFF", borderRadius: 14, padding: "20px 22px", border: "1px solid #EAECEF", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "#FBF0EC", color: "#C86943", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#8C919E", letterSpacing: 0.6 }}>AVG. COMPLETION</span>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: "#11141A", marginTop: 14 }}>
              {stats.avgCompletion ?? 0}%
            </div>
          </div>
        </div>

        {/* Your Courses Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#11141A" }}>
            Your courses
          </div>
          {isInstructor && !showNewCourse && (
            <button
              onClick={() => setShowNewCourse(true)}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                border: "none",
                background: "#181B22",
                color: "#FFFFFF",
                fontWeight: 600,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              + New course
            </button>
          )}
        </div>

        {/* Search & Filter Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          {/* Search Box */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8C919E"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search your courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 36px",
                borderRadius: 8,
                border: "1px solid #E2E8F0",
                background: "#FFFFFF",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: 4, background: "#EAECEF", padding: 3, borderRadius: 8 }}>
            <button
              onClick={() => setFilterTab("all")}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: "none",
                background: filterTab === "all" ? "#FFFFFF" : "transparent",
                color: filterTab === "all" ? "#11141A" : "#64748B",
                fontWeight: filterTab === "all" ? 700 : 500,
                fontSize: 12,
                cursor: "pointer",
                boxShadow: filterTab === "all" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
              }}
            >
              All ({courses.length})
            </button>
            {isInstructor ? (
              <>
                <button
                  onClick={() => setFilterTab("active")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: filterTab === "active" ? "#FFFFFF" : "transparent",
                    color: filterTab === "active" ? "#11141A" : "#64748B",
                    fontWeight: filterTab === "active" ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: filterTab === "active" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterTab("hidden")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: filterTab === "hidden" ? "#FFFFFF" : "transparent",
                    color: filterTab === "hidden" ? "#11141A" : "#64748B",
                    fontWeight: filterTab === "hidden" ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: filterTab === "hidden" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Hidden
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setFilterTab("in_progress")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: filterTab === "in_progress" ? "#FFFFFF" : "transparent",
                    color: filterTab === "in_progress" ? "#11141A" : "#64748B",
                    fontWeight: filterTab === "in_progress" ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: filterTab === "in_progress" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilterTab("completed")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 6,
                    border: "none",
                    background: filterTab === "completed" ? "#FFFFFF" : "transparent",
                    color: filterTab === "completed" ? "#11141A" : "#64748B",
                    fontWeight: filterTab === "completed" ? 700 : 500,
                    fontSize: 12,
                    cursor: "pointer",
                    boxShadow: filterTab === "completed" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                  }}
                >
                  Completed
                </button>
              </>
            )}
          </div>
        </div>

        {/* New Course Form */}
        {isInstructor && showNewCourse && (
          <form onSubmit={handleCreateCourse} style={{ background: "#FFFFFF", border: "1px solid #EAECEF", borderRadius: 14, padding: 20, marginBottom: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <input
              placeholder="Course title"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", marginBottom: 10, borderRadius: 8, border: "1px solid #E0E0E0", fontSize: 13 }}
            />
            <textarea
              placeholder="Description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={2}
              style={{ width: "100%", padding: "10px 12px", marginBottom: 12, borderRadius: 8, border: "1px solid #E0E0E0", fontSize: 13, resize: "vertical" }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" disabled={creating} style={{ padding: "9px 16px", borderRadius: 8, border: "none", background: "#181B22", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                {creating ? "Creating..." : "Create course"}
              </button>
              <button type="button" onClick={() => setShowNewCourse(false)} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #E0E0E0", background: "#fff", fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {error && <div style={{ color: "#B5502F", fontSize: 13, marginBottom: 14 }}>{error}</div>}

        {loading ? (
          <div style={{ fontSize: 13, color: "#8C919E" }}>Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div style={{ background: "#FFFFFF", border: "1px solid #EAECEF", borderRadius: 14, padding: "32px 20px", textAlign: "center", color: "#8C919E", fontSize: 13 }}>
            No courses found matching your criteria.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {filteredCourses.map((c) =>
              isInstructor ? (
                <CourseTile key={c._id} course={c} mode="instructor" onReload={load} />
              ) : (
                <CourseTile
                  key={c.course._id}
                  course={{ ...c.course, completedCount: c.completedCount, lessonCount: c.totalLessons }}
                  mode="student-mine"
                />
              )
            )}

            {/* Empty slot / "Create another course" card for instructor */}
            {isInstructor && (
              <div
                onClick={() => setShowNewCourse(true)}
                style={{
                  border: "2px dashed #D2D6DC",
                  borderRadius: 14,
                  background: "transparent",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "30px 20px",
                  minHeight: 180,
                  cursor: "pointer",
                  transition: "border-color 0.2s ease, background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#4463C4")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#D2D6DC")}
              >
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#EAECEF", color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 500 }}>
                  +
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#6B7280", marginTop: 10 }}>
                  Create another course
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showEditProfileModal && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEditProfileModal(false)}
          onUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}
