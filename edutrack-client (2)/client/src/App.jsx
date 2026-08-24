import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import BrowseCourses from "./pages/BrowseCourses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

function isAuthed() {
  return Boolean(localStorage.getItem("edutrack_token"));
}

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/browse"
          element={
            <RequireAuth>
              <BrowseCourses />
            </RequireAuth>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <RequireAuth>
              <CourseDetail />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to={isAuthed() ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </ToastProvider>
  );
}
