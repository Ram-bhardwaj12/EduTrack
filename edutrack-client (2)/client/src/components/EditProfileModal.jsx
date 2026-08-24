import React, { useState } from "react";
import api from "../api/client.js";

export default function EditProfileModal({ user, onClose, onUpdated }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [title, setTitle] = useState(user?.title || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isInstructor = user?.role === "instructor";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const res = await api.put("/auth/me", {
        name,
        email,
        title,
        bio,
        newPassword: newPassword || undefined,
      });

      const updatedUser = res.data.user;
      localStorage.setItem("edutrack_user", JSON.stringify(updatedUser));

      setSuccessMsg("Profile updated successfully!");
      if (onUpdated) onUpdated(updatedUser);

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || "Could not update profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(17, 20, 26, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        className="et-fade-in"
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          width: "100%",
          maxWidth: 480,
          padding: 24,
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          border: "1px solid #EAECEF",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#11141A" }}>
              Edit Profile
            </div>
            <div style={{ fontSize: 12, color: "#8C919E", marginTop: 2 }}>
              Update your account details as {isInstructor ? "an Instructor" : "a Student"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#F1F3F5",
              width: 30,
              height: 30,
              borderRadius: "50%",
              fontSize: 16,
              color: "#666",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {error && <div style={{ color: "#C53030", background: "#FFF5F5", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        {successMsg && <div style={{ color: "#276749", background: "#F0FFF4", padding: "8px 12px", borderRadius: 6, fontSize: 13, marginBottom: 14 }}>{successMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#11141A", marginBottom: 6 }}>Full Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ram Bhardwaj"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D2D6DC", fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#11141A", marginBottom: 6 }}>Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D2D6DC", fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#11141A", marginBottom: 6 }}>
              {isInstructor ? "Professional Title / Specialization" : "Academic Title / Major"}
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isInstructor ? "e.g. Professor of Computer Science" : "e.g. Software Engineering Student"}
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D2D6DC", fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#11141A", marginBottom: 6 }}>Bio / Details</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell others a bit about your background and interests..."
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D2D6DC", fontSize: 13, outline: "none", resize: "vertical" }}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#11141A", marginBottom: 6 }}>
              New Password <span style={{ color: "#8C919E", fontWeight: 400 }}>(leave blank to keep current)</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #D2D6DC", fontSize: 13, outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 16px",
                borderRadius: 8,
                border: "1px solid #D2D6DC",
                background: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                color: "#11141A",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "9px 18px",
                borderRadius: 8,
                border: "none",
                background: "#181B22",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
