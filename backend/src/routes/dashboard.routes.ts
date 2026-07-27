import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

// All dashboard routes require authentication
router.use(authenticate);

router.get('/metrics', dashboardController.getMetrics);
router.get('/severity-distribution', dashboardController.getAlertSeverityDistribution);
router.get('/events-timeline', dashboardController.getEventsTimeline);
router.get('/top-sources', dashboardController.getTopSources);

export default router;