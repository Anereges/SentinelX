import { Router } from 'express';
import { IncidentsController } from '../controllers/incidents.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const incidentsController = new IncidentsController();

// All incident routes require authentication
router.use(authenticate);

router.get('/', incidentsController.getAll);
router.get('/:id', incidentsController.getById);
router.post('/', incidentsController.create);
router.patch('/:id', incidentsController.update);
router.post('/:id/notes', incidentsController.addNote);
router.get('/:id/timeline', incidentsController.getTimeline);

export default router;