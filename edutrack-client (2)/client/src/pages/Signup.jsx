import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Logo from "../components/Logo.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email, password, role });
      localStorage.setItem("edutrack_token", res.data.token);
      localStorage.setItem("edutrack_user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F5F0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 20px",
      }}
    >
      <div
        className="et-fade-in"
        style={{
          width: "100%",
          maxWidth: 1020,
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          padding: 12,
          gap: 12,
        }}
      >
        {/* LEFT COLUMN: REFERENCE SHOWCASE PANEL */}
        <div
          style={{
            background: "#F0F4FE",
            borderRadius: 14,
            padding: "40px 36px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            minHeight: 520,
          }}
        >
          {/* Top Logo */}
          <div>
            <Logo size="md" />

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 32,
                lineHeight: 1.2,
                color: "#111827",
                marginTop: 32,
                marginBottom: 16,
                letterSpacing: "-0.03em",
              }}
            >
              Teach courses.
              <br />
              Track every lesson.
            </h1>

            <p
              style={{
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 1.6,
                maxWidth: 320,
              }}
            >
              One space for lessons, quizzes, and real progress — whether you're teaching or learning.
            </p>
          </div>

          {/* Bottom Floating Cards Preview */}
          <div
            style={{
              position: "relative",
              height: 180,
              width: "100%",
              marginTop: 20,
            }}
          >
            {/* Card 1: Data Structures */}
            <div
              className="floating-course-card"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 220,
                background: "#FFFFFF",
                borderRadius: 10,
                padding: "14px 16px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                borderLeft: "4px solid #1D4ED8",
                zIndex: 1,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 12 }}>
                Data Structures
              </div>
              <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: "60%", height: "100%", background: "#1D4ED8", borderRadius: 4 }} />
              </div>
            </div>

            {/* Card 2: Operating Systems */}
            <div
              className="floating-course-card"
              style={{
                position: "absolute",
                top: 60,
                left: 40,
                width: 230,
                background: "#FFFFFF",
                borderRadius: 10,
                padding: "14px 16px",
                boxShadow: "0 12px 28px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                borderLeft: "4px solid #059669",
                zIndex: 2,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 12 }}>
                Operating Systems
              </div>
              <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "#059669", borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGNUP FORM */}
        <div
          style={{
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Header */}
            <div style={{ marginBottom: 22 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 24,
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                Create your account
              </h2>
              <p style={{ fontSize: 14, color: "#6B7280" }}>
                Join as a student or instructor
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Role Selection ("I am a...") */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4B5563", marginBottom: 8 }}>
                  I am a...
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: role === "student" ? "1px solid #1D1D1B" : "1px solid #E5E7EB",
                      background: role === "student" ? "#1D1D1B" : "#FFFFFF",
                      color: role === "student" ? "#FFFFFF" : "#374151",
                      fontWeight: role === "student" ? 700 : 600,
                      fontSize: 13,
                      textAlign: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("instructor")}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: role === "instructor" ? "1px solid #1D1D1B" : "1px solid #E5E7EB",
                      background: role === "instructor" ? "#1D1D1B" : "#FFFFFF",
                      color: role === "instructor" ? "#FFFFFF" : "#374151",
                      fontWeight: role === "instructor" ? 700 : 600,
                      fontSize: 13,
                      textAlign: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    Instructor
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="lms-input"
                />
              </div>

              {/* Email Field */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="lms-input"
                />
              </div>

              {/* Password Field */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: "none", border: "none", color: "#6B7280", fontSize: 12, fontWeight: 600, padding: 0 }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="lms-input"
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 6,
                    background: "#FEF2F2",
                    border: "1px solid #FCA5A5",
                    color: "#991B1B",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#1D1D1B",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>
          </div>

          <div style={{ marginTop: 20, fontSize: 13, color: "#6B7280", textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "#1D4ED8", fontWeight: 700 }}>
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
