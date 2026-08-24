const Lesson = require("../models/Lesson");
const Course = require("../models/Course");
const { broadcastEvent } = require("../utils/events");

async function addLesson(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const { title, content, videoUrl, order } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const count = await Lesson.countDocuments({ courseId: course._id });
    const lesson = await Lesson.create({
      courseId: course._id,
      title,
      content: content || "",
      videoUrl: videoUrl || "",
      order: order ?? count,
    });
    broadcastEvent("COURSE_MUTATED", { action: "add_lesson", courseId: course._id, lessonId: lesson._id });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: "Could not add lesson", details: err.message });
  }
}

async function updateLesson(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const lesson = await Lesson.findOne({ _id: req.params.lessonId, courseId: course._id });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    const { title, content, videoUrl, order } = req.body;
    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (order !== undefined) lesson.order = order;
    await lesson.save();
    broadcastEvent("COURSE_MUTATED", { action: "update_lesson", courseId: course._id, lessonId: lesson._id });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: "Could not update lesson", details: err.message });
  }
}

async function deleteLesson(req, res) {
  try {
    const course = await Course.findOne({ _id: req.params.courseId, instructorId: req.userId });
    if (!course) return res.status(404).json({ error: "Course not found" });

    const lesson = await Lesson.findOneAndDelete({ _id: req.params.lessonId, courseId: course._id });
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    broadcastEvent("COURSE_MUTATED", { action: "delete_lesson", courseId: course._id, lessonId: req.params.lessonId });
    res.json({ message: "Lesson deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete lesson", details: err.message });
  }
}

module.exports = { addLesson, updateLesson, deleteLesson };
