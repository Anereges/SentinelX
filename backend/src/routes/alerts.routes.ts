import { Router } from 'express';
import { AlertsController } from '../controllers/alerts.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const alertsController = new AlertsController();

// All alert routes require authentication
router.use(authenticate);

router.get('/', alertsController.getAll);
router.get('/:id', alertsController.getById);
router.patch('/:id', alertsController.update);
router.post('/:id/create-incident', alertsController.createIncidentFromAlert);

export default router;