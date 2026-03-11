/**
 * seed.js — Dummy data for local development
 *
 * HOW TO RUN:
 *   1. Make sure your local MongoDB is running and your .env has MONGO_URI set.
 *   2. From the /backend directory run:
 *        node seed.js
 *   3. The script wipes and re-seeds Users, Classes, and Events every time.
 *
 * DUMMY ACCOUNTS (all passwords are: Password123!)
 * ─────────────────────────────────────────────────
 *  TEACHERS
 *    teacher1@ontask.dev   — Ms. Johnson  (classes: ENG-101, ENG-102)
 *    teacher2@ontask.dev   — Mr. Patel    (classes: MTH-201, MTH-202)
 *
 *  STUDENTS
 *    student1@ontask.dev   — Alex Rivera   (enrolled: ENG-101, MTH-201)
 *    student2@ontask.dev   — Jamie Lee     (enrolled: ENG-101, MTH-202)
 *    student3@ontask.dev   — Sam Torres    (enrolled: ENG-102, MTH-201)
 *    student4@ontask.dev   — Casey Kim     (enrolled: MTH-202)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const User  = require('./models/userModel');
const Class = require('./models/classModel');
const Event = require('./models/eventModel');

// ─── helpers ──────────────────────────────────────────────────────────────────

const hash = async (pw) => bcrypt.hash(pw, await bcrypt.genSalt(10));

// Build an ISO date string relative to today
const relDate = (dayOffset, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

// ─── raw data ─────────────────────────────────────────────────────────────────

const classRecords = [
  { classroomName: 'English 101',  code: 'ENG-101', email: 'teacher1@ontask.dev' },
  { classroomName: 'English 102',  code: 'ENG-102', email: 'teacher1@ontask.dev' },
  { classroomName: 'Math 201',     code: 'MTH-201', email: 'teacher2@ontask.dev' },
  { classroomName: 'Math 202',     code: 'MTH-202', email: 'teacher2@ontask.dev' },
];

const userData = [
  // ── teachers ──────────────────────────────────────────────────────────────
  {
    email: 'teacher1@ontask.dev',
    name:  'Ms. Johnson',
    role:  'teacher',
    classes: [
      { classroomName: 'English 101', code: 'ENG-101' },
      { classroomName: 'English 102', code: 'ENG-102' },
    ],
  },
  {
    email: 'teacher2@ontask.dev',
    name:  'Mr. Patel',
    role:  'teacher',
    classes: [
      { classroomName: 'Math 201', code: 'MTH-201' },
      { classroomName: 'Math 202', code: 'MTH-202' },
    ],
  },
  // ── students ──────────────────────────────────────────────────────────────
  {
    email: 'student1@ontask.dev',
    name:  'Alex Rivera',
    role:  'student',
    classes: [
      { classroomName: 'English 101', code: 'ENG-101', teacherEmail: 'teacher1@ontask.dev' },
      { classroomName: 'Math 201',    code: 'MTH-201', teacherEmail: 'teacher2@ontask.dev' },
    ],
  },
  {
    email: 'student2@ontask.dev',
    name:  'Jamie Lee',
    role:  'student',
    classes: [
      { classroomName: 'English 101', code: 'ENG-101', teacherEmail: 'teacher1@ontask.dev' },
      { classroomName: 'Math 202',    code: 'MTH-202', teacherEmail: 'teacher2@ontask.dev' },
    ],
  },
  {
    email: 'student3@ontask.dev',
    name:  'Sam Torres',
    role:  'student',
    classes: [
      { classroomName: 'English 102', code: 'ENG-102', teacherEmail: 'teacher1@ontask.dev' },
      { classroomName: 'Math 201',    code: 'MTH-201', teacherEmail: 'teacher2@ontask.dev' },
    ],
  },
  {
    email: 'student4@ontask.dev',
    name:  'Casey Kim',
    role:  'student',
    classes: [
      { classroomName: 'Math 202', code: 'MTH-202', teacherEmail: 'teacher2@ontask.dev' },
    ],
  },
];

// Events — spread across past, present, and future for realistic calendar view
const eventData = [
  // ── ENG-101 events ────────────────────────────────────────────────────────
  {
    text: 'Read Chapter 4 of To Kill a Mockingbird',
    type: 'Homework', color: 'RoyalBlue',
    start: relDate(0, 8, 0),  end: relDate(0, 8, 45),
    classroom: 'ENG-101', email: 'teacher1@ontask.dev',
  },
  {
    text: 'Vocabulary Quiz — Week 6',
    type: 'Test', color: 'Red',
    start: relDate(1, 10, 0), end: relDate(1, 10, 30),
    classroom: 'ENG-101', email: 'teacher1@ontask.dev',
  },
  {
    text: 'Essay Outline Due',
    type: 'Document', color: 'ForestGreen',
    start: relDate(2, 9, 0),  end: relDate(2, 9, 30),
    classroom: 'ENG-101', email: 'teacher1@ontask.dev',
  },
  {
    text: 'Persuasive Essay Draft',
    type: 'Homework', color: 'RoyalBlue',
    start: relDate(3, 8, 0),  end: relDate(3, 8, 45),
    classroom: 'ENG-101', email: 'teacher1@ontask.dev',
  },
  {
    text: 'Midterm Exam — Chapters 1–7',
    type: 'Test', color: 'MediumVioletRed',
    start: relDate(4, 10, 0), end: relDate(4, 11, 0),
    classroom: 'ENG-101', email: 'teacher1@ontask.dev',
  },

  // ── ENG-102 events ────────────────────────────────────────────────────────
  {
    text: 'Poetry Analysis Worksheet',
    type: 'Homework', color: 'BlueViolet',
    start: relDate(0, 9, 0),  end: relDate(0, 9, 30),
    classroom: 'ENG-102', email: 'teacher1@ontask.dev',
  },
  {
    text: 'Shakespearean Sonnet Presentation',
    type: 'Document', color: 'ForestGreen',
    start: relDate(2, 11, 0), end: relDate(2, 12, 0),
    classroom: 'ENG-102', email: 'teacher1@ontask.dev',
  },
  {
    text: 'Grammar & Mechanics Test',
    type: 'Test', color: 'OrangeRed',
    start: relDate(5, 10, 0), end: relDate(5, 10, 45),
    classroom: 'ENG-102', email: 'teacher1@ontask.dev',
  },

  // ── MTH-201 events ────────────────────────────────────────────────────────
  {
    text: 'Problem Set 8 — Derivatives',
    type: 'Homework', color: 'DarkBlue',
    start: relDate(0, 14, 0), end: relDate(0, 14, 30),
    classroom: 'MTH-201', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Quiz — Chain Rule & Product Rule',
    type: 'Test', color: 'Red',
    start: relDate(1, 13, 0),  end: relDate(1, 13, 30),
    classroom: 'MTH-201', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Integration Worksheet',
    type: 'Homework', color: 'RoyalBlue',
    start: relDate(3, 14, 0),  end: relDate(3, 14, 45),
    classroom: 'MTH-201', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Unit 4 Test — Integrals',
    type: 'Test', color: 'MediumVioletRed',
    start: relDate(4, 13, 0),  end: relDate(4, 14, 0),
    classroom: 'MTH-201', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Show All Work — Riemann Sums',
    type: 'Document', color: 'Grey',
    start: relDate(5, 14, 0), end: relDate(5, 14, 30),
    classroom: 'MTH-201', email: 'teacher2@ontask.dev',
  },

  // ── MTH-202 events ────────────────────────────────────────────────────────
  {
    text: 'Statistics Problem Set 3',
    type: 'Homework', color: 'DarkBlue',
    start: relDate(1, 15, 0), end: relDate(1, 15, 30),
    classroom: 'MTH-202', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Normal Distribution Quiz',
    type: 'Test', color: 'OrangeRed',
    start: relDate(2, 13, 0),  end: relDate(2, 13, 30),
    classroom: 'MTH-202', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Data Analysis Project Outline',
    type: 'Document', color: 'ForestGreen',
    start: relDate(3, 15, 0),  end: relDate(3, 15, 45),
    classroom: 'MTH-202', email: 'teacher2@ontask.dev',
  },
  {
    text: 'Regression & Correlation Homework',
    type: 'Homework', color: 'Purple',
    start: relDate(5, 14, 0),  end: relDate(5, 14, 30),
    classroom: 'MTH-202', email: 'teacher2@ontask.dev',
  },
];

// ─── seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅  Connected to MongoDB');

    // Wipe existing seed data only (matched by seed emails so you don't nuke real data)
    const seedEmails = userData.map((u) => u.email);
    const seedCodes  = classRecords.map((c) => c.code);

    await User.deleteMany({ email: { $in: seedEmails } });
    await Class.deleteMany({ code: { $in: seedCodes } });
    await Event.deleteMany({ classroom: { $in: seedCodes } });
    console.log('🗑   Cleared previous seed data');

    // Insert classes
    await Class.insertMany(classRecords);
    console.log(`📚  Inserted ${classRecords.length} classes`);

    // Insert users with hashed passwords
    const password = await hash('Password123!');
    const usersToInsert = userData.map((u) => ({ ...u, password }));
    await User.insertMany(usersToInsert);
    console.log(`👤  Inserted ${usersToInsert.length} users`);

    // Insert events
    await Event.insertMany(eventData);
    console.log(`📅  Inserted ${eventData.length} events`);

    console.log('\n🎉  Seed complete! Login with any account below (password: Password123!)');
    console.log('   teacher1@ontask.dev  →  Ms. Johnson  (ENG-101, ENG-102)');
    console.log('   teacher2@ontask.dev  →  Mr. Patel    (MTH-201, MTH-202)');
    console.log('   student1@ontask.dev  →  Alex Rivera  (ENG-101, MTH-201)');
    console.log('   student2@ontask.dev  →  Jamie Lee    (ENG-101, MTH-202)');
    console.log('   student3@ontask.dev  →  Sam Torres   (ENG-102, MTH-201)');
    console.log('   student4@ontask.dev  →  Casey Kim    (MTH-202)');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌  Seed failed:', err);
    process.exit(1);
  }
}

seed();