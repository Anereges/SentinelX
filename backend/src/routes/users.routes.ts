import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

// All user routes require authentication
router.use(authenticate);

// GET endpoints - accessible to all authenticated users
router.get('/', usersController.getAll);
router.get('/:id', usersController.getById);

// Write operations - require ADMIN role (checked in controller)
router.patch('/:id', usersController.update);
router.post('/:id/deactivate', usersController.deactivate);
router.post('/:id/activate', usersController.activate);

export default router;