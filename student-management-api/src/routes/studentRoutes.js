'use strict';

const express = require('express');
const { asyncHandler } = require('@abhay150/express-error-kit');
const {
  addStudent,
  getAllStudents,
  getStudentStats,
  getStudentById,
  updateStudent,
  deleteStudent,
  triggerTestError
} = require('../controllers/studentController');

const router = express.Router();

// Specific routes first so they don't get caught by /:id param route
router.get('/stats', asyncHandler(getStudentStats));
router.get('/test-error/:type', asyncHandler(triggerTestError));

// Standard CRUD endpoints
router.post('/', asyncHandler(addStudent));
router.get('/', asyncHandler(getAllStudents));
router.get('/:id', asyncHandler(getStudentById));
router.put('/:id', asyncHandler(updateStudent));
router.delete('/:id', asyncHandler(deleteStudent));

module.exports = router;
