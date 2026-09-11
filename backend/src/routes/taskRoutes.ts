import { Router } from 'express';
import {
  getTasks, createTask, updateTaskStatus,
  getActivities,
  getDashboardData,
} from '../controllers/taskController';

const router = Router();

router.get('/tasks', getTasks);
router.post('/tasks', createTask);
router.put('/tasks/:id/status', updateTaskStatus);

router.get('/activities', getActivities);

router.get('/dashboard', getDashboardData);

export default router;
