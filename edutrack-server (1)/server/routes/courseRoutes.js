const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");

const {
  createCourse,
  listCourses,
  myCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getCourseProgress,
} = require("../controllers/courseController");
const { addLesson, updateLesson, deleteLesson } = require("../controllers/lessonController");
const { upsertQuiz, getQuizForStudent, getQuizForInstructor, submitQuiz } = require("../controllers/quizController");
const { enroll, completeLesson } = require("../controllers/enrollmentController");

const router = express.Router();

router.use(requireAuth);

// Courses
router.get("/", listCourses);
router.post("/", requireRole("instructor"), createCourse);
router.get("/mine", requireRole("instructor"), myCourses);
router.get("/:id", getCourse);
router.put("/:id", requireRole("instructor"), updateCourse);
router.delete("/:id", requireRole("instructor"), deleteCourse);
router.get("/:id/progress", requireRole("instructor"), getCourseProgress);

// Lessons (nested under a course, instructor-only writes)
router.post("/:courseId/lessons", requireRole("instructor"), addLesson);
router.put("/:courseId/lessons/:lessonId", requireRole("instructor"), updateLesson);
router.delete("/:courseId/lessons/:lessonId", requireRole("instructor"), deleteLesson);
router.post("/:courseId/lessons/:lessonId/complete", requireRole("student"), completeLesson);

// Quiz (nested under a course)
router.post("/:courseId/quiz", requireRole("instructor"), upsertQuiz);
router.get("/:courseId/quiz/manage", requireRole("instructor"), getQuizForInstructor);
router.get("/:courseId/quiz", requireRole("student"), getQuizForStudent);
router.post("/:courseId/quiz/submit", requireRole("student"), submitQuiz);

// Enrollment
router.post("/:courseId/enroll", requireRole("student"), enroll);

module.exports = router;
