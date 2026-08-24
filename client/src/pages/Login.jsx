import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/client.js";
import Logo from "../components/Logo.jsx";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("edutrack_token", res.data.token);
      localStorage.setItem("edutrack_user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  }

  function handleQuickFill(role) {
    setSelectedRole(role);
    if (role === "student") {
      setEmail("student@edutrack.com");
      setPassword("password123");
    } else if (role === "instructor") {
      setEmail("instructor@edutrack.com");
      setPassword("password123");
    }
    setError("");
  }

  function handleForgotSubmit(e) {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotModal(false);
      setForgotEmail("");
    }, 2500);
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
          maxWidth: 1060,
          background: "#FFFFFF",
          borderRadius: 20,
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          overflow: "hidden",
          padding: 12,
          gap: 12,
        }}
      >
        {/* LEFT COLUMN: REFERENCE SHOWCASE PANEL */}
        <div
          style={{
            background: "#F7F7F4",
            borderRadius: 14,
            padding: "44px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            minHeight: 520,
          }}
        >
          {/* Upper Text & Showcase Content */}
          <div>
            {/* Top Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 20,
                background: "#EEF2FF",
                color: "#4338CA",
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4338CA",
                  display: "inline-block",
                }}
              />
              Built for instructors & students
            </div>

            {/* Headline & Subhead + Floating Cards Stack Layout */}
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20, alignItems: "center" }}>
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 34,
                    lineHeight: 1.18,
                    color: "#111827",
                    marginBottom: 18,
                    letterSpacing: "-0.03em",
                  }}
                >
                  Teach courses.
                  <br />
                  <span style={{ color: "#1D4ED8" }}>Track every lesson.</span>
                </h1>

                <p
                  style={{
                    fontSize: 14,
                    color: "#6B7280",
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}
                >
                  EduTrack brings course content, quizzes, and progress into one clear space — for the people teaching and the people learning.
                </p>
              </div>

              {/* Floating Cards Stack (Right side of left panel) */}
              <div
                style={{
                  position: "relative",
                  height: 290,
                  width: "100%",
                }}
              >
                {/* Card 1: Data Structures */}
                <div
                  className="floating-course-card"
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 0,
                    width: 215,
                    background: "#FFFFFF",
                    borderRadius: 10,
                    padding: "16px 16px 14px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                    borderLeft: "4px solid #1D4ED8",
                    zIndex: 1,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 16 }}>
                    Data Structures
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: "60%", height: "100%", background: "#1D4ED8", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#1D4ED8" }}>
                    60%
                  </div>
                </div>

                {/* Card 2: Operating Systems (Middle overlapping) */}
                <div
                  className="floating-course-card"
                  style={{
                    position: "absolute",
                    top: 95,
                    left: 0,
                    width: 220,
                    background: "#FFFFFF",
                    borderRadius: 10,
                    padding: "16px 16px 14px",
                    boxShadow: "0 12px 28px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                    borderLeft: "4px solid #059669",
                    zIndex: 2,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 16 }}>
                    Operating Systems
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: "100%", height: "100%", background: "#059669", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#059669" }}>
                    100%
                  </div>
                </div>

                {/* Card 3: Computer Networks (Bottom overlapping) */}
                <div
                  className="floating-course-card"
                  style={{
                    position: "absolute",
                    top: 180,
                    right: 10,
                    width: 220,
                    background: "#FFFFFF",
                    borderRadius: 10,
                    padding: "16px 16px 14px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
                    borderLeft: "4px solid #C2410C",
                    zIndex: 3,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827", marginBottom: 16 }}>
                    Computer Networks
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: "24%", height: "100%", background: "#C2410C", borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#C2410C" }}>
                    24%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Link Bar */}
          <div
            style={{
              borderTop: "1px solid #E5E7EB",
              paddingTop: 20,
              marginTop: 32,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "#6B7280",
            }}
          >
            <span>New to EduTrack?</span>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                background: "none",
                border: "none",
                color: "#111827",
                fontWeight: 700,
                fontSize: 14,
                padding: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
            >
              Sign up →
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: SIGN IN FORM */}
        <div
          style={{
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Logo */}
            <div style={{ marginBottom: 28 }}>
              <Logo size="md" />
            </div>

            {/* Title & Subtitle */}
            <div style={{ marginBottom: 24 }}>
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "#111827",
                  marginBottom: 6,
                }}
              >
                Welcome back
              </h2>
              <p style={{ fontSize: 14, color: "#6B7280" }}>
                Log in to access your course dashboard
              </p>
            </div>

            {/* Quick Role Fill Pills */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Select Role:
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => handleQuickFill("student")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: selectedRole === "student" ? "1px solid #1D1D1B" : "1px solid #E5E7EB",
                    background: selectedRole === "student" ? "#1D1D1B" : "#F9FAFB",
                    color: selectedRole === "student" ? "#FFFFFF" : "#374151",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill("instructor")}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: selectedRole === "instructor" ? "1px solid #1D1D1B" : "1px solid #E5E7EB",
                    background: selectedRole === "instructor" ? "#1D1D1B" : "#F9FAFB",
                    color: selectedRole === "instructor" ? "#FFFFFF" : "#374151",
                    fontSize: 12,
                    fontWeight: 600,
                    textAlign: "center",
                    transition: "all 0.15s ease",
                  }}
                >
                  Instructor
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="lms-input"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    style={{ background: "none", border: "none", color: "#1D4ED8", fontSize: 12, fontWeight: 500, padding: 0 }}
                  >
                    Forgot?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lms-input"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#6B7280",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: "#1D1D1B", width: 15, height: 15, cursor: "pointer" }}
                />
                <label htmlFor="remember" style={{ fontSize: 13, color: "#4B5563", cursor: "pointer" }}>
                  Remember me
                </label>
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
                  padding: "11px 16px",
                  borderRadius: 8,
                  border: "none",
                  background: "#1D1D1B",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          </div>

          <div style={{ marginTop: 24, fontSize: 13, color: "#6B7280", textAlign: "center" }}>
            No account?{" "}
            <Link to="/signup" style={{ color: "#1D1D1B", fontWeight: 700 }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* ABOUT MODAL */}
      {showAboutModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          className="et-fade-in"
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 28,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowAboutModal(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "none",
                border: "none",
                color: "#6B7280",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: 16 }}>
              <Logo size="md" />
            </div>

            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 10 }}>
              About EduTrack
            </h3>
            <p style={{ fontSize: 14, color: "#4B5569", lineHeight: 1.6, marginBottom: 14 }}>
              EduTrack is a modern Learning Management System built for students and instructors to track courses, quizzes, and learning progress seamlessly.
            </p>

            <div style={{ background: "#F7F7F4", borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 13, color: "#374151", lineHeight: 1.5 }}>
              • <strong>Students:</strong> View enrolled courses, track completion percentages, and access study materials.
              <br />
              • <strong>Instructors:</strong> Publish courses, manage student progress, and organize assignments.
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid #F3F4F6" }}>
              <button
                onClick={() => setShowAboutModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#6B7280",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowAboutModal(false)}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 6,
                    background: "#1D1D1B",
                    border: "none",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setShowAboutModal(false);
                    navigate("/signup");
                  }}
                  style={{
                    padding: "9px 16px",
                    borderRadius: 6,
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    color: "#111827",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17, 24, 39, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
          className="et-fade-in"
        >
          <div
            style={{
              width: "100%",
              maxWidth: 400,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 14,
              padding: 24,
              position: "relative",
            }}
          >
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "none",
                border: "none",
                color: "#6B7280",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "#111827", marginBottom: 8 }}>
              Password Reset
            </h3>
            <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
              Enter your email address to receive password reset instructions.
            </p>

            {forgotSent ? (
              <div style={{ padding: 12, borderRadius: 6, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontSize: 13, textAlign: "center" }}>
                Password reset email sent!
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="lms-input"
                  style={{ marginBottom: 16 }}
                />
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "#1D1D1B",
                    color: "#FFFFFF",
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}





