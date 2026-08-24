const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { broadcastEvent } = require("../utils/events");

// Instructor: create or replace the quiz for a course.
async function upsertQuiz(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const { title, questions } = req.body;
    if (!title || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "title and a non-empty questions array are required" });
    }
    for (const q of questions) {
      if (!q.text || !Array.isArray(q.options) || q.options.length < 2 || typeof q.correctIndex !== "number") {
        return res.status(400).json({ error: "Each question needs text, at least 2 options, and a correctIndex" });
      }
    }

    let quiz = await Quiz.findOne({ courseId: course._id });
    if (quiz) {
      quiz.title = title;
      quiz.questions = questions;
      await quiz.save();
    } else {
      quiz = await Quiz.create({ courseId: course._id, title, questions });
    }
    broadcastEvent("COURSE_MUTATED", { action: "upsert_quiz", courseId: course._id });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Could not save quiz", details: err.message });
  }
}

// Student: fetch the quiz WITHOUT correct answers, so they can't cheat by reading the response.
async function getQuizForStudent(req, res) {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    if (!quiz) return res.status(404).json({ error: "No quiz for this course" });

    const sanitized = {
      _id: quiz._id,
      title: quiz.title,
      questions: quiz.questions.map((q) => ({ _id: q._id, text: q.text, options: q.options })),
    };
    res.json(sanitized);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch quiz", details: err.message });
  }
}

// Student: submit answers, get scored server-side against correctIndex.
async function submitQuiz(req, res) {
  try {
    const quiz = await Quiz.findOne({ courseId: req.params.courseId });
    if (!quiz) return res.status(404).json({ error: "No quiz for this course" });

    const { answers } = req.body; // { [questionId]: selectedOptionIndex }
    if (!answers || typeof answers !== "object") {
      return res.status(400).json({ error: "answers object is required" });
    }

    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q._id] === q.correctIndex) score++;
    });
    const total = quiz.questions.length;

    let enrollment = await Enrollment.findOne({ studentId: req.userId, courseId: req.params.courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({ studentId: req.userId, courseId: req.params.courseId });
    }
    enrollment.quizAttempts.push({ quizId: quiz._id, score, total });
    await enrollment.save();

    res.json({ score, total });
  } catch (err) {
    res.status(500).json({ error: "Could not submit quiz", details: err.message });
  }
}

// Instructor: fetch the full quiz including correct answers, for editing.
async function getQuizForInstructor(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const quiz = await Quiz.findOne({ courseId: course._id });
    if (!quiz) return res.status(404).json({ error: "No quiz for this course" });

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch quiz", details: err.message });
  }
}

module.exports = { upsertQuiz, getQuizForStudent, getQuizForInstructor, submitQuiz };
