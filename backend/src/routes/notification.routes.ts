import express from 'express';
import {
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  archiveNotification,
  archiveAllRead,
  createNotification,
  getNotificationSettings,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Get notifications (authenticated)
router.get('/', authenticate, getNotifications);

// Get notification settings (authenticated)
router.get('/settings', authenticate, getNotificationSettings);

// Mark all as read (authenticated)
router.put('/read-all', authenticate, markAllAsRead);

// Archive all read (authenticated)
router.delete('/archive-all', authenticate, archiveAllRead);

// Create notification (admin only)
router.post('/', authenticate, authorize('super_admin'), createNotification);

// Get single notification (authenticated)
router.get('/:id', authenticate, getNotification);

// Mark as read (authenticated)
router.put('/:id/read', authenticate, markAsRead);

// Archive notification (authenticated)
router.delete('/:id', authenticate, archiveNotification);

export default router;
