import { Router } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const eventsController = new EventsController();

// All event routes require authentication
router.use(authenticate);

router.get('/', eventsController.getAll);
router.get('/:id', eventsController.getById);

export default router;