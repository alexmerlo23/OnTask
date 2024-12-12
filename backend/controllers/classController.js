const Class = require('../models/classModel');

// Controller for creating a classroom
const createClassroom = async (req, res) => {

  const { classroomName, code, email } = req.body;
  
  // make sure all fields are filled out
  let emptyFields = [];

  if (!classroomName) emptyFields.push('classroomName');
  if (!code) emptyFields.push('code');
  if (!email) emptyFields.push('email');

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: 'Please fill in all the fields', emptyFields });
  }

  try {
    const classroom = await Class.create({ classroomName, code, email }); // create classroom
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
    const classroom = await Class.findOne({ email }); // search databse for email

    if (!classroom) {
      return res.status(404).json({ error: 'No classroom found for this email' });
    }

    res.status(200).json(classroom); // Send the found classroom data as response
  } catch (error) {
    console.error('Error fetching classroom:', error); // handle errors
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { createClassroom, getClassroomByEmail };
