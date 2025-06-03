import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompaniesWithInterviewCalls,
  updatePositionStatus   // <-- Import the new controller function
} from '../controllers/companyController.js';
import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all companies and create a new company
router.route('/')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompanies)
  .post(protect, authorizeRoles('admin', 'super-admin', 'hr'), createCompany);

// Get, update, delete company by ID
router.route('/:id')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompanyById)
  .put(protect, authorizeRoles('admin', 'super-admin', 'hr'), updateCompany)
  .delete(protect, authorizeRoles('super-admin'), deleteCompany);

// New route: Get companies along with their interview calls
router.route('/with-interview-calls')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompaniesWithInterviewCalls);

// NEW route: Update status of a position in a company
// Update status of a position in a company
router.route('/:companyId/positions/:positionId/status')
  .put(protect, authorizeRoles('admin', 'super-admin', 'hr'), updatePositionStatus);


export default router;
