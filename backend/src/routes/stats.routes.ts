
import express from 'express';
import { getDashboardStats } from '../controllers/stats.controller.ts';
import { authenticate, authorize } from '../middlewares/auth.middleware.ts';

const router = express.Router();

// GET /api/stats - Fetch all dashboard data (Counts, Activity, Leaderboard, Vitals)
// Only Admins/SuperAdmins should see dashboard stats
router.get('/', authenticate, authorize(['ADMIN', 'SUPERADMIN']), getDashboardStats);

export default router;
