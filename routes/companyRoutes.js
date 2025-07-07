import express from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompaniesWithInterviewCalls,
  updatePositionStatus,
  getCompanyStats,
   getRecentCompany
} from '../controllers/companyController.js';

import { protect, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Place /stats route BEFORE /:id
router.get('/stats', protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompanyStats);
router.get('/recent', protect, authorizeRoles('admin', 'super-admin', 'hr'), getRecentCompany);
// routes/companyRoutes.js



// Get all companies and create a new company
router.route('/')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompanies)
  .post(protect, authorizeRoles('admin', 'super-admin', 'hr'), createCompany);

// New route: Get companies along with their interview calls
router.route('/with-interview-calls')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompaniesWithInterviewCalls);

// Update status of a position in a company
router.route('/:companyId/positions/:positionId/status')
  .put(protect, authorizeRoles('admin', 'super-admin', 'hr'), updatePositionStatus);

// 🛑 This MUST come last!
router.route('/:id')
  .get(protect, authorizeRoles('admin', 'super-admin', 'hr'), getCompanyById)
  .put(protect, authorizeRoles('admin', 'super-admin', 'hr'), updateCompany)
  .delete(protect, authorizeRoles('super-admin'), deleteCompany);

export default router;
