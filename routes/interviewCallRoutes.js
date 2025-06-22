import express from 'express';
import {
  getInterviewCalls,
  getInterviewCallById,
  createInterviewCall,
  updateInterviewCall,
  deleteInterviewCall,
  getInterviewCallsByStudent,
  getInterviewCallDetails,
  getInterviewCallsGroupedByCompany,
   getInterviewCallStats
} from '../controllers/interviewCallController.js';

import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInterviewCalls)
  .post(createInterviewCall);

router.route('/details').get(getInterviewCallDetails);

router.route('/by-company').get(getInterviewCallsGroupedByCompany);

router.route('/student/:studentId').get(getInterviewCallsByStudent);
router.get('/stats', getInterviewCallStats);
router.route('/:id')
  .get(getInterviewCallById)
  .put(updateInterviewCall)
  .delete(deleteInterviewCall);

export default router;
