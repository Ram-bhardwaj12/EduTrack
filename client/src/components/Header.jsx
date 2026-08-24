import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import { initials } from "../courseColors.js";
import EditProfileModal from "./EditProfileModal.jsx";

export default function Header({ active, onProfileUpdated }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem("edutrack_user") || "null"));
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Clean up any lingering dark theme setting
  document.documentElement.removeAttribute("data-theme");
  localStorage.removeItem("edutrack_theme");

  const isInstructor = currentUser?.role === "instructor";
  const userInitials = initials(currentUser?.name);

  function handleLogout() {
    localStorage.removeItem("edutrack_token");
    localStorage.removeItem("edutrack_user");
    navigate("/login");
  }

  function handleProfileUpdated(updatedUser) {
    setCurrentUser(updatedUser);
    if (onProfileUpdated) onProfileUpdated(updatedUser);
  }

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, paddingTop: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <Logo />
          </Link>
          <span
            style={{
              background: isInstructor ? "#FBF0EC" : "#EEF2FD",
              color: isInstructor ? "#C86943" : "#4463C4",
              border: `1px solid ${isInstructor ? "#F7D7C8" : "#D0DDFB"}`,
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              letterSpacing: "0.4px",
              textTransform: "uppercase",
            }}
          >
            {isInstructor ? "Instructor" : "Student"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ position: "relative", paddingBottom: 4 }}>
            <Link
              to="/dashboard"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 14,
                fontWeight: active === "mine" ? 700 : 500,
                color: active === "mine" ? "var(--ink)" : "var(--muted)",
                textDecoration: "none",
              }}
            >
              My courses
            </Link>
            {active === "mine" && (
              <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, background: "#4463C4", borderRadius: 1 }} />
            )}
          </div>

          {!isInstructor && (
            <div style={{ position: "relative", paddingBottom: 4 }}>
              <Link
                to="/browse"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: active === "browse" ? 700 : 500,
                  color: active === "browse" ? "var(--ink)" : "var(--muted)",
                  textDecoration: "none",
                }}
              >
                Browse
              </Link>
              {active === "browse" && (
                <div style={{ position: "absolute", bottom: -2, left: 0, right: 0, height: 2, background: "#4463C4", borderRadius: 1 }} />
              )}
            </div>
          )}

          <button onClick={handleLogout} style={{ border: "none", background: "none", color: "var(--muted)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Log out
          </button>

          <div
            onClick={() => setShowProfileModal(true)}
            title={`Edit Profile (${currentUser?.name || "User"})`}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#E8EEFB",
              color: "#4463C4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              flexShrink: 0,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              cursor: "pointer",
              transition: "transform 0.15s ease",
            }}
          >
            {userInitials}
          </div>
        </div>
      </div>

      {showProfileModal && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowProfileModal(false)}
          onUpdated={handleProfileUpdated}
        />
      )}
    </>
  );
}
