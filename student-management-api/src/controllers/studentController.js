'use strict';

const crypto = require('crypto');
const students = require('../data/students');
const {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError
} = require('@abhay150/express-error-kit');

/**
 * Validate email format with standard regex.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Helper to find student by ID or throw NotFoundError.
 * @param {string} id
 * @returns {object} student
 */
function findStudentOrFail(id) {
  const student = students.find((s) => s.id === id);
  if (!student) {
    throw new NotFoundError(`Student with ID '${id}' not found`);
  }
  return student;
}

/**
 * POST /students — Add a new student.
 */
const addStudent = async (req, res) => {
  const { name, email, course, gpa, status } = req.body;

  // 1. Required field validations
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('Student name is required');
  }
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new ValidationError('Student email is required');
  }
  if (!isValidEmail(email)) {
    throw new ValidationError('Invalid email format');
  }
  if (!course || typeof course !== 'string' || course.trim() === '') {
    throw new ValidationError('Student course is required');
  }

  // 2. Validate optional GPA
  let parsedGpa = 3.5;
  if (gpa !== undefined && gpa !== null && gpa !== '') {
    const numGpa = Number(gpa);
    if (isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
      throw new ValidationError('GPA must be a valid number between 0.0 and 4.0');
    }
    parsedGpa = Math.round(numGpa * 100) / 100;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 3. Check for duplicate email (Demonstrating ConflictError from express-error-kit)
  const existingStudent = students.find(
    (s) => s.email.toLowerCase() === normalizedEmail
  );
  if (existingStudent) {
    throw new ConflictError(
      `Student with email '${normalizedEmail}' already exists`
    );
  }

  const newStudent = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    course: course.trim(),
    gpa: parsedGpa,
    status: status && ['Active', 'Graduated', 'Suspended'].includes(status) ? status : 'Active',
    createdAt: new Date().toISOString()
  };

  students.unshift(newStudent);

  res.status(201).json({
    success: true,
    message: 'Student added successfully',
    data: newStudent
  });
};

/**
 * GET /students — Get all students with optional search & filter query params.
 */
const getAllStudents = async (req, res) => {
  const { search, course, status, sortBy, order } = req.query;

  let result = [...students];

  // Search filter (by name or email)
  if (search && search.trim() !== '') {
    const term = search.trim().toLowerCase();
    result = result.filter(
      (s) => s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)
    );
  }

  // Course filter
  if (course && course.trim() !== '') {
    const courseTerm = course.trim().toLowerCase();
    result = result.filter((s) => s.course.toLowerCase() === courseTerm);
  }

  // Status filter
  if (status && status.trim() !== '') {
    const statusTerm = status.trim().toLowerCase();
    result = result.filter((s) => s.status.toLowerCase() === statusTerm);
  }

  // Sorting
  if (sortBy) {
    const isDesc = order && order.toLowerCase() === 'desc';
    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return isDesc ? 1 : -1;
      if (valA > valB) return isDesc ? -1 : 1;
      return 0;
    });
  }

  res.status(200).json({
    success: true,
    count: result.length,
    data: result
  });
};

/**
 * GET /students/stats — Analytics summary for students.
 */
const getStudentStats = async (req, res) => {
  const total = students.length;

  if (total === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalStudents: 0,
        averageGpa: 0,
        courseCounts: {},
        statusCounts: {}
      }
    });
  }

  const courseCounts = {};
  const statusCounts = {};
  let totalGpa = 0;

  students.forEach((s) => {
    courseCounts[s.course] = (courseCounts[s.course] || 0) + 1;
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    totalGpa += Number(s.gpa) || 0;
  });

  const averageGpa = Math.round((totalGpa / total) * 100) / 100;

  res.status(200).json({
    success: true,
    data: {
      totalStudents: total,
      averageGpa,
      courseCounts,
      statusCounts
    }
  });
};

/**
 * GET /students/:id — Get a single student by ID.
 */
const getStudentById = async (req, res) => {
  const student = findStudentOrFail(req.params.id);

  res.status(200).json({
    success: true,
    data: student
  });
};

/**
 * PUT /students/:id — Update a student record.
 */
const updateStudent = async (req, res) => {
  const student = findStudentOrFail(req.params.id);
  const { name, email, course, gpa, status } = req.body;

  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim() === '') {
      throw new ValidationError('Student email cannot be empty');
    }
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Ensure email is not already taken by another student
    const duplicate = students.find(
      (s) => s.email.toLowerCase() === normalizedEmail && s.id !== student.id
    );
    if (duplicate) {
      throw new ConflictError(`Email '${normalizedEmail}' is already registered to another student`);
    }

    student.email = normalizedEmail;
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      throw new ValidationError('Student name cannot be empty');
    }
    student.name = name.trim();
  }

  if (course !== undefined) {
    if (typeof course !== 'string' || course.trim() === '') {
      throw new ValidationError('Student course cannot be empty');
    }
    student.course = course.trim();
  }

  if (gpa !== undefined && gpa !== null && gpa !== '') {
    const numGpa = Number(gpa);
    if (isNaN(numGpa) || numGpa < 0 || numGpa > 4.0) {
      throw new ValidationError('GPA must be a valid number between 0.0 and 4.0');
    }
    student.gpa = Math.round(numGpa * 100) / 100;
  }

  if (status !== undefined) {
    if (!['Active', 'Graduated', 'Suspended'].includes(status)) {
      throw new ValidationError('Status must be Active, Graduated, or Suspended');
    }
    student.status = status;
  }

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
};

/**
 * DELETE /students/:id — Delete a student.
 */
const deleteStudent = async (req, res) => {
  const student = findStudentOrFail(req.params.id);
  const index = students.indexOf(student);
  students.splice(index, 1);

  res.status(200).json({
    success: true,
    message: 'Student deleted successfully'
  });
};

/**
 * GET /students/test-error/:type — Interactive test helper for express-error-kit.
 */
const triggerTestError = async (req, res) => {
  const { type } = req.params;

  switch (type) {
    case 'validation':
      throw new ValidationError('Test ValidationError: Required field "admissionYear" is missing');
    case 'not-found':
      throw new NotFoundError('Test NotFoundError: The requested course catalog was not found');
    case 'conflict':
      throw new ConflictError('Test ConflictError: Student ID roll number conflict detected');
    case 'app-error':
      throw new AppError('Test AppError: Simulated payment gateway timeout error', 502);
    default:
      throw new ValidationError(`Unknown test error type '${type}'. Use: validation, not-found, conflict, app-error`);
  }
};

module.exports = {
  addStudent,
  getAllStudents,
  getStudentStats,
  getStudentById,
  updateStudent,
  deleteStudent,
  triggerTestError
};
