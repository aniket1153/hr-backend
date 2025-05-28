import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  createStudent,
  getStudents,
  getPlacedStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  placeStudent,
  updateStudentStatus, // ⬅️ new controller
} from '../controllers/studentController.js';

const router = express.Router();

// Route to create and get all students
router.route('/')
  .post(protect, authorizeRoles('admin', 'super-admin', 'hr'), createStudent)
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getStudents);

// Route to get all placed students
router.route('/placed')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getPlacedStudents);

// Route to get, update, and delete a single student by ID
router.route('/:id')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getStudentById)
  .patch(protect, authorizeRoles('admin', 'super-admin', 'hr'), updateStudent)
  .delete(protect, authorizeRoles('admin', 'super-admin', 'hr'), deleteStudent);

// Route to place a student manually
router.route('/:id/place')
  .post(protect, authorizeRoles('admin', 'super-admin', 'hr'), placeStudent);

// ✅ NEW route to update student status (applied → shortlisted → placed)
router.route('/:id/status')
  .put(protect, authorizeRoles('admin', 'super-admin', 'hr'), updateStudentStatus);

export default router;
