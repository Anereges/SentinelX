import { Router } from 'express';
import { AgentsController } from '../controllers/agents.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const agentsController = new AgentsController();

// All agent routes require authentication
router.use(authenticate);

router.get('/', agentsController.getAll);
router.get('/:id', agentsController.getById);
router.post('/', agentsController.create);
router.patch('/:id', agentsController.update);
router.delete('/:id', agentsController.delete);
router.post('/:id/heartbeat', agentsController.heartbeat);

export default router;