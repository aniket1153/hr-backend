import express from 'express';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';
import {
  createStudent,
  getStudents,
  getPlacedStudents,  // <- import this
  getStudentById,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('admin', 'super-admin', 'hr'), createStudent)
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getStudents);

router.route('/placed')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getPlacedStudents); // <- placed students

router.route('/:id')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getStudentById)
  .patch(protect, authorizeRoles('admin', 'super-admin', 'hr'), updateStudent)
  .delete(protect, authorizeRoles('admin', 'super-admin', 'hr'), deleteStudent);

export default router;
