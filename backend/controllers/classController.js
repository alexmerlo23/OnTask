const Class = require('../models/classModel');

// Controller for creating a classroom
const createClassroom = async (req, res) => {
  console.log("Request received:", req.body); // Log the request body to see what was sent
  console.log("Authenticated user:", req.user); // Log the authenticated user (should be populated by requireAuth)

  const { classroomName, code, email } = req.body;
  let emptyFields = [];

  if (!classroomName) emptyFields.push('classroomName');
  if (!code) emptyFields.push('code');
  if (!email) emptyFields.push('email');

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  try {
    console.log("Attempting to create class...");
    const classroom = await Class.create({ classroomName, code, email });
    console.log("Class saved:", classroom); // Log the saved classroom to check if it's stored
    res.status(200).json(classroom);
  } catch (error) {
    console.error("Error creating class:", error); // Log error if creation fails
    res.status(400).json({ error: error.message });
  }
};

// Controller for fetching classroom by email
const getClassroomByEmail = async (req, res) => {
  const { email } = req.query; // Get the email from query parameters

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const classroom = await Class.findOne({ email });

    if (!classroom) {
      return res.status(404).json({ error: 'No classroom found for this email' });
    }

    res.status(200).json(classroom); // Send the found classroom data as response
  } catch (error) {
    console.error('Error fetching classroom:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createClassroom, getClassroomByEmail };
