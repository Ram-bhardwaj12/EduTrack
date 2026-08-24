const Course = require("../models/Course");
const Lesson = require("../models/Lesson");
const Quiz = require("../models/Quiz");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const { broadcastEvent } = require("../utils/events");

async function createCourse(req, res) {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    const course = await Course.create({ instructorId: req.userId, title, description });
    broadcastEvent("COURSE_MUTATED", { action: "create", courseId: course._id });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: "Could not create course", details: err.message });
  }
}

// Enriches a list of course docs with instructorName and lessonCount, both of
// which the tile-grid frontend needs but aren't stored on Course itself.
async function enrichCourses(courses) {
  const instructorIds = [...new Set(courses.map((c) => String(c.instructorId)))];
  const instructors = await User.find({ _id: { $in: instructorIds } }, "name");
  const nameById = Object.fromEntries(instructors.map((u) => [String(u._id), u.name]));

  return Promise.all(
    courses.map(async (c) => {
      const lessonCount = await Lesson.countDocuments({ courseId: c._id });
      return {
        ...c.toObject(),
        instructorName: nameById[String(c.instructorId)] || "Instructor",
        lessonCount,
      };
    })
  );
}

async function listCourses(req, res) {
  try {
    const courses = await Course.find({ isHidden: { $ne: true } }).sort({ createdAt: -1 });
    res.json(await enrichCourses(courses));
  } catch (err) {
    res.status(500).json({ error: "Could not fetch courses", details: err.message });
  }
}

// Instructor-only: their own courses, enriched with enrolledCount for the tile grid.
async function myCourses(req, res) {
  try {
    const courses = await Course.find({ instructorId: req.userId }).sort({ createdAt: -1 });
    const enriched = await enrichCourses(courses);
    const withEnrollment = await Promise.all(
      enriched.map(async (c) => {
        const enrolledCount = await Enrollment.countDocuments({ courseId: c._id });
        return { ...c, enrolledCount };
      })
    );

    const totalCourses = courses.length;
    const totalStudents = withEnrollment.reduce((sum, c) => sum + c.enrolledCount, 0);

    let totalPctSum = 0;
    let totalEnrollmentCount = 0;
    for (const c of courses) {
      const totalLessons = await Lesson.countDocuments({ courseId: c._id });
      const enrollments = await Enrollment.find({ courseId: c._id });
      for (const e of enrollments) {
        const pct = totalLessons > 0 ? Math.round((e.completedLessonIds.length / totalLessons) * 100) : 0;
        totalPctSum += pct;
        totalEnrollmentCount++;
      }
    }
    const avgCompletion = totalEnrollmentCount > 0 ? Math.round(totalPctSum / totalEnrollmentCount) : 0;

    res.json({
      courses: withEnrollment,
      stats: {
        totalCourses,
        totalStudents,
        avgCompletion,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch your courses", details: err.message });
  }
}

async function getCourse(req, res) {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (course.isHidden && String(course.instructorId) !== String(req.userId)) {
      return res.status(404).json({ error: "Course not found or is currently hidden" });
    }

    const instructor = await User.findById(course.instructorId, "name");
    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });
    const quizDoc = await Quiz.findOne({ courseId: course._id });
    // Never leak correctIndex through the general detail endpoint — instructors
    // use the dedicated /quiz/manage route (auth + ownership checked) to edit answers.
    const quiz = quizDoc
      ? {
          _id: quizDoc._id,
          title: quizDoc.title,
          questions: quizDoc.questions.map((q) => ({ _id: q._id, text: q.text, options: q.options })),
        }
      : null;

    res.json({
      course: { ...course.toObject(), instructorName: instructor?.name || "Instructor" },
      lessons,
      quiz,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch course", details: err.message });
  }
}

async function updateCourse(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const { title, description, isHidden } = req.body;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (isHidden !== undefined) course.isHidden = Boolean(isHidden);
    await course.save();
    broadcastEvent("COURSE_MUTATED", { action: "update", courseId: course._id, isHidden: course.isHidden });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: "Could not update course", details: err.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    await Lesson.deleteMany({ courseId: course._id });
    await Quiz.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ courseId: course._id });

    broadcastEvent("COURSE_MUTATED", { action: "delete", courseId: req.params.id });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete course", details: err.message });
  }
}

// Instructor-only: class-wide progress for a course (average %, on-track vs stalled).
async function getCourseProgress(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.id, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const totalLessons = await Lesson.countDocuments({ courseId: course._id });
    const enrollments = await Enrollment.find({ courseId: course._id });

    const students = enrollments.map((e) => {
      const pct = totalLessons > 0 ? Math.round((e.completedLessonIds.length / totalLessons) * 100) : 0;
      return { studentId: e.studentId, completedCount: e.completedLessonIds.length, pct };
    });

    const avgPct = students.length
      ? Math.round(students.reduce((sum, s) => sum + s.pct, 0) / students.length)
      : 0;
    const onTrack = students.filter((s) => s.pct >= 50).length;
    const stalled = students.length - onTrack;

    const quiz = await Quiz.findOne({ courseId: course._id });
    let quizAvg = null;
    if (quiz) {
      const scores = enrollments.flatMap((e) =>
        e.quizAttempts.filter((a) => String(a.quizId) === String(quiz._id)).map((a) => (a.score / a.total) * 100)
      );
      if (scores.length) {
        quizAvg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
      }
    }

    res.json({
      totalLessons,
      enrolledCount: students.length,
      avgPct,
      onTrack,
      stalled,
      quizAvg,
      students,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch course progress", details: err.message });
  }
}

module.exports = { createCourse, listCourses, myCourses, getCourse, updateCourse, deleteCourse, getCourseProgress };
