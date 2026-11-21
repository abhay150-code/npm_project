'use strict';

/**
 * In-memory student data store pre-populated with initial records.
 */
const students = [
  {
    id: 'a1b2c3d4-1111-4000-8000-000000000001',
    name: 'Abhay Singh',
    email: 'abhay@example.com',
    course: 'Computer Science',
    gpa: 3.85,
    status: 'Active',
    createdAt: new Date('2026-09-01T09:00:00Z').toISOString()
  },
  {
    id: 'b2c3d4e5-2222-4000-8000-000000000002',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    course: 'Data Science',
    gpa: 3.92,
    status: 'Active',
    createdAt: new Date('2026-09-05T10:30:00Z').toISOString()
  },
  {
    id: 'c3d4e5f6-3333-4000-8000-000000000003',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    course: 'Artificial Intelligence',
    gpa: 3.74,
    status: 'Active',
    createdAt: new Date('2026-09-12T14:15:00Z').toISOString()
  },
  {
    id: 'd4e5f6a7-4444-4000-8000-000000000004',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    course: 'Mechanical Engineering',
    gpa: 3.65,
    status: 'Graduated',
    createdAt: new Date('2025-08-20T11:00:00Z').toISOString()
  },
  {
    id: 'e5f6a7b8-5555-4000-8000-000000000005',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    course: 'Computer Science',
    gpa: 3.48,
    status: 'Active',
    createdAt: new Date('2026-10-02T16:45:00Z').toISOString()
  }
];

module.exports = students;
