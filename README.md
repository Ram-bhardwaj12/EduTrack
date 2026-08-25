# EduTrack - Learning Management System (LMS)

EduTrack is a full-stack Learning Management System (LMS) built for instructors and students. Instructors can create and manage courses, and students can enroll, track their lesson progress, and pick up where they left off.

## 🎓 Internship Details

- **Intern ID:** `CITS7926`
- **Full Name:** Ram Bhardwaj
- **Project Name:** Learning Management System (LMS)
- **Duration:** 4 Weeks

## 🔗 Live Links

- **Live App:** [https://edu-track-ashy-mu.vercel.app](https://edu-track-ashy-mu.vercel.app)
- **Backend API:** [https://edutrack-gwp9.onrender.com](https://edutrack-gwp9.onrender.com)
- **Repository:** [https://github.com/Ram-bhardwaj12/EduTrack](https://github.com/Ram-bhardwaj12/EduTrack)

> **Note:** The backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take up to ~50 seconds to respond while the server wakes up.

## 🎯 Project Scope

The **EduTrack Learning Management System (LMS)** project aims to deliver a modern, scalable, and responsive web platform for managing digital courses and tracking student learning outcomes. Developed during a 4-week internship program, the scope covers end-to-end full-stack software development:

### Key Deliverables & Scope:
- **Role-Based Access Control (RBAC):** Provide distinct, secure workflows for **Instructors** (course creation, management, visibility control) and **Students** (course browsing, enrollment, progress tracking).
- **Interactive Course Management:** Enable instructors to curate learning modules, create course content, manage existing lessons, and toggle course visibility.
- **Real-Time Progress Tracking:** Monitor student progression through lessons with dynamically calculated completion percentages and visual progress bars.
- **Full-Stack REST Architecture:** Implement a decoupled client-server architecture featuring React (Vite) on the frontend and Express + Node.js + MongoDB on the backend.
- **Production Cloud Deployment:** Host and maintain the live frontend application on Vercel and backend microservices on Render.

## ✨ Features

- **Role-based access** — separate experiences for Students and Instructors
- **Instructor dashboard** — create, manage, hide, and delete courses
- **Student dashboard** — view enrolled courses and track progress with completion percentages
- **Authentication** — secure login and signup flow
- **Course & lesson tracking** — lessons completed vs. total, with visual progress bars

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- Deployed on Vercel

**Backend**
- Node.js + Express
- MongoDB (database)
- Deployed on Render

## 📁 Project Structure

```
EduTrack/
├── client/     # React frontend (Vite)
└── server/     # Express backend + API routes
```

## ⚙️ Environment Variables

**Frontend (`client/`)**
```
VITE_API_URL=https://edutrack-gwp9.onrender.com/api
```

**Backend (`server/`)**
```
MONGODB_URI=<your MongoDB connection string>
PORT=10000
```

## 🚀 Getting Started Locally

**Clone the repository**
```bash
git clone https://github.com/Ram-bhardwaj12/EduTrack.git
cd EduTrack
```

**Backend setup**
```bash
cd server
npm install
npm start
```

**Frontend setup**
```bash
cd client
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and connect to the backend using the `VITE_API_URL` environment variable.

## 📌 Roadmap

- [ ] Add quizzes and assessments
- [ ] Add lesson video/content upload
- [ ] Add student progress analytics for instructors
- [ ] Add course search and filtering

## 👤 Author

**Ram Bhardwaj**  
- **Intern ID:** `CITS7926`  
- [GitHub](https://github.com/Ram-bhardwaj12)

