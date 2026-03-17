import express from 'express';
import {
  createDispute,
  getDisputes,
  getDispute,
  updateDispute,
  addEvidence,
  resolveDispute,
  updateDisputeStatus,
} from '../controllers/dispute.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Create dispute (authenticated)
router.post('/', authenticate, createDispute);

// Get disputes (authenticated)
router.get('/', authenticate, getDisputes);

// Get single dispute (authenticated)
router.get('/:id', authenticate, getDispute);

// Update dispute (authenticated, creator only)
router.put('/:id', authenticate, updateDispute);

// Add evidence (authenticated, participants only)
router.post('/:id/evidence', authenticate, addEvidence);

// Update dispute status (admin only)
router.put('/:id/status', authenticate, authorize('super_admin'), updateDisputeStatus);

// Resolve dispute (admin only)
router.post('/:id/resolve', authenticate, authorize('super_admin'), resolveDispute);

export default router;
