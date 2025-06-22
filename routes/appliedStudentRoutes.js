import express from 'express';
import { applyStudentsToCompany } from '../controllers/appliedStudentController.js';

const router = express.Router();

router.post('/apply', applyStudentsToCompany);

export default router;
