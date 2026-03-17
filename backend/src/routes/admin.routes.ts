import express from 'express';
import {
  getPlatformAnalytics,
  getUsers,
  getUser,
  updateUserStatus,
  verifyContractor,
  getContractors,
  getProjects,
  getPayments,
  getDisputes,
  deleteUser,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate, authorize('super_admin'));

// Analytics
router.get('/analytics', getPlatformAnalytics);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Contractors
router.get('/contractors', getContractors);
router.put('/contractors/:id/verify', verifyContractor);

// Projects
router.get('/projects', getProjects);

// Payments
router.get('/payments', getPayments);

// Disputes
router.get('/disputes', getDisputes);

export default router;
