const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const User = require("../models/User");

async function enroll(req, res) {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || (course.isHidden && String(course.instructorId) !== String(req.userId))) {
      return res.status(404).json({ error: "Course not found or unavailable" });
    }

    let enrollment = await Enrollment.findOne({ studentId: req.userId, courseId: course._id });
    if (enrollment) {
      return res.status(200).json(enrollment);
    }
    enrollment = await Enrollment.create({ studentId: req.userId, courseId: course._id });
    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: "Could not enroll", details: err.message });
  }
}

async function completeLesson(req, res) {
  try {
    const lesson = await Lesson.findOne({ _id: req.params.lessonId, courseId: req.params.courseId });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    let enrollment = await Enrollment.findOne({ studentId: req.userId, courseId: req.params.courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({ studentId: req.userId, courseId: req.params.courseId });
    }
    if (!enrollment.completedLessonIds.some((id) => String(id) === String(lesson._id))) {
      enrollment.completedLessonIds.push(lesson._id);
      await enrollment.save();
    }
    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ error: "Could not mark lesson complete", details: err.message });
  }
}

// Student: their own progress across all enrolled courses.
async function myEnrollments(req, res) {
  try {
    const enrollments = await Enrollment.find({ studentId: req.userId });
    const results = await Promise.all(
      enrollments.map(async (e) => {
        const course = await Course.findById(e.courseId);
        if (!course || course.isHidden) return null;
        const instructor = await User.findById(course.instructorId, "name");
        const totalLessons = await Lesson.countDocuments({ courseId: e.courseId });
        const pct = totalLessons > 0 ? Math.round((e.completedLessonIds.length / totalLessons) * 100) : 0;
        return {
          course: { ...course.toObject(), instructorName: instructor?.name || "Instructor", lessonCount: totalLessons },
          completedCount: e.completedLessonIds.length,
          totalLessons,
          pct,
          quizAttempts: e.quizAttempts,
        };
      })
    );
    const valid = results.filter(Boolean);
    const totalCourses = valid.length;
    const completedLessons = valid.reduce((sum, item) => sum + item.completedCount, 0);
    const avgCompletion = totalCourses > 0 ? Math.round(valid.reduce((sum, item) => sum + item.pct, 0) / totalCourses) : 0;

    res.json({
      courses: valid,
      stats: {
        totalCourses,
        completedLessons,
        avgCompletion,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch enrollments", details: err.message });
  }
}

module.exports = { enroll, completeLesson, myEnrollments };
