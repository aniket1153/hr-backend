import express from 'express';
import Report from '../models/Report.js';  // make sure to add the .js extension in imports for ES modules
import { getReportStats,getPlacementSummary,getPlacementDetails } from '../controllers/reportController.js';
const router = express.Router();
router.get('/stats', getReportStats);
// routes/reportRoutes.js

// routes/reportRoutes.js
router.get('/placement-summary', getPlacementSummary);
router.get('/placement-details/:companyId', getPlacementDetails);


router.post('/', async (req, res) => {
  try {
    const { companyId, appliedCount, shortlistedCount, placedCount, resumesSent } = req.body;

    const report = new Report({ companyId, appliedCount, shortlistedCount, placedCount, resumesSent });
    await report.save();

    res.status(201).json({ message: 'Report created successfully', report });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ message: 'Failed to create report' });
  }
});

export default router;
