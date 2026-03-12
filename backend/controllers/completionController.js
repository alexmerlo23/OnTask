const Completion = require('../models/completionModel');
const User       = require('../models/userModel');
const Event      = require('../models/eventModel');

// POST /api/completions
// Body: { eventId, classCode, parentCode }
// Student submits parent code → verified server-side, then persisted
const markComplete = async (req, res) => {
  const { eventId, classCode, parentCode } = req.body;
  const authUser = req.user;

  if (authUser.role !== 'student') {
    return res.status(403).json({ error: 'Only students can mark completions' });
  }
  if (!eventId || !classCode || !parentCode) {
    return res.status(400).json({ error: 'eventId, classCode and parentCode are required' });
  }

  try {
    // Reload full user doc so we have parentCode field
    const student = await User.findById(authUser._id);
    if (!student) return res.status(404).json({ error: 'User not found' });

    if (!student.parentCode) {
      return res.status(400).json({ error: 'No parent code set on your account. Ask a parent or guardian to set one in Account Settings.' });
    }
    if (student.parentCode !== parentCode) {
      return res.status(401).json({ error: 'Incorrect parent code' });
    }

    // Upsert so double-clicks don't create duplicates
    const completion = await Completion.findOneAndUpdate(
      { studentEmail: student.email, eventId },
      { studentEmail: student.email, studentName: student.name, eventId, classCode },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(completion);
  } catch (err) {
    console.error('Error marking completion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/completions/my-events
// Returns all eventIds the authenticated student has completed
const getMyCompletions = async (req, res) => {
  try {
    const completions = await Completion.find({ studentEmail: req.user.email });
    res.status(200).json(completions.map(c => c.eventId));
  } catch (err) {
    console.error('Error fetching completions:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET /api/completions/class-stats/:classCode
// Teachers only — returns enrollment count + per-event completion stats
const getClassStats = async (req, res) => {
  const { classCode } = req.params;

  try {
    // All students enrolled in this class
    const students = await User.find({
      role: 'student',
      'classes.code': classCode
    }).select('email name classes');

    const studentCount = students.length;
    const studentList  = students.map(s => ({ email: s.email, name: s.name }));

    // All events for this class
    const events = await Event.find({ classroom: classCode }).sort({ start: 1 });

    // All completions for this class
    const completions = await Completion.find({ classCode });

    // Build per-event stats
    const eventStats = events.map(event => {
      const eventCompletions = completions.filter(c => c.eventId === event._id.toString());
      const completedEmails  = new Set(eventCompletions.map(c => c.studentEmail));

      return {
        eventId:        event._id,
        eventName:      event.text,
        eventType:      event.type,
        eventStart:     event.start,
        totalStudents:  studentCount,
        completedCount: completedEmails.size,
        pendingCount:   studentCount - completedEmails.size,
        completedBy:    eventCompletions.map(c => ({ email: c.studentEmail, name: c.studentName, completedAt: c.completedAt })),
      };
    });

    res.status(200).json({ studentCount, students: studentList, eventStats });
  } catch (err) {
    console.error('Error fetching class stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { markComplete, getMyCompletions, getClassStats };