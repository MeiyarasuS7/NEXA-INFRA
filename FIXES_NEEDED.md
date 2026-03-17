# NEXA-INFRA - Specific Code Fixes

This document contains the exact code changes needed to fix the critical issues found in the analysis.

---

## CRITICAL FIX #1: Role Authorization Middleware

### File: `backend/src/middleware/auth.middleware.ts`

**BEFORE (Lines 67-97):**
```typescript
/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize('admin');

/**
 * Middleware to check if user is contractor
 */
export const isContractor = authorize('contractor');

/**
 * Middleware to check if user is regular user
 */
export const isUser = authorize('user');

/**
 * Middleware to check if user is contractor or admin
 */
export const isContractorOrAdmin = authorize('contractor', 'admin');
```

**AFTER (Lines 67-97):**
```typescript
/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize('super_admin');

/**
 * Middleware to check if user is contractor
 */
export const isContractor = authorize('contractor');

/**
 * Middleware to check if user is regular user
 */
export const isUser = authorize('user');

/**
 * Middleware to check if user is contractor or admin
 */
export const isContractorOrAdmin = authorize('contractor', 'super_admin');
```

**Changes:**
- Line 67: `'admin'` → `'super_admin'`
- Line 97: `'admin'` → `'super_admin'`

---

## CRITICAL FIX #2: Admin Routes Protection

### File: `backend/src/routes/admin.routes.ts`

**BEFORE (Line 17):**
```typescript
router.use(authenticate, authorize('admin'));
```

**AFTER (Line 17):**
```typescript
router.use(authenticate, authorize('super_admin'));
```

**Change:**
- `'admin'` → `'super_admin'`

---

## CRITICAL FIX #3: Dispute Routes Protection

### File: `backend/src/routes/dispute.routes.ts`

**BEFORE (Lines 31, 34):**
```typescript
// Update dispute status (admin only)
router.put('/:id/status', authenticate, authorize('admin'), updateDisputeStatus);

// Resolve dispute (admin only)
router.post('/:id/resolve', authenticate, authorize('admin'), resolveDispute);
```

**AFTER (Lines 31, 34):**
```typescript
// Update dispute status (admin only)
router.put('/:id/status', authenticate, authorize('super_admin'), updateDisputeStatus);

// Resolve dispute (admin only)
router.post('/:id/resolve', authenticate, authorize('super_admin'), resolveDispute);
```

**Changes:**
- Line 31: `'admin'` → `'super_admin'`
- Line 34: `'admin'` → `'super_admin'`

---

## CRITICAL FIX #4: Notification Routes Protection

### File: `backend/src/routes/notification.routes.ts`

**BEFORE (Line 29):**
```typescript
router.post('/', authenticate, authorize('admin'), createNotification);
```

**AFTER (Line 29):**
```typescript
router.post('/', authenticate, authorize('super_admin'), createNotification);
```

**Change:**
- `'admin'` → `'super_admin'`

---

## CRITICAL FIX #5: Payment Routes Protection

### File: `backend/src/routes/payment.routes.ts`

**BEFORE (Line 32):**
```typescript
router.post('/:id/process-refund', authenticate, authorize('admin'), processRefund);
```

**AFTER (Line 32):**
```typescript
router.post('/:id/process-refund', authenticate, authorize('super_admin'), processRefund);
```

**Change:**
- `'admin'` → `'super_admin'`

---

## HIGH PRIORITY FIX #1: Contractor Routes Order

### File: `backend/src/routes/contractor.routes.ts`

**BEFORE (Lines 15-32):**
```typescript
/**
 * @route   GET /api/contractors
 * @desc    Browse/Search contractors
 * @access  Public
 */
router.get('/', getContractors);

/**
 * @route   GET /api/contractors/favorites
 * @desc    Get user's favorite contractors
 * @access  Private
 */
router.get('/favorites', authenticate, getFavoriteContractors);

/**
 * @route   GET /api/contractors/:id
 * @desc    Get contractor profile by ID
 * @access  Public
 */
router.get('/:id', getContractor);
```

**AFTER (Lines 15-32):**
```typescript
/**
 * @route   GET /api/contractors
 * @desc    Browse/Search contractors
 * @access  Public
 */
router.get('/', getContractors);

/**
 * @route   GET /api/contractors/favorites
 * @desc    Get user's favorite contractors
 * @access  Private
 */
router.get('/favorites', authenticate, getFavoriteContractors);

/**
 * @route   GET /api/contractors/:id
 * @desc    Get contractor profile by ID
 * @access  Public
 */
router.get('/:id', getContractor);
```

**Explanation:**
The `/favorites` route should come BEFORE `/:id` because Express matches route patterns in order. Otherwise, `/favorites` might match the `/:id` pattern with `id='favorites'`.

---

## HIGH PRIORITY FIX #2: Frontend Admin Email

### File: `frontend/src/pages/Login.tsx`

**BEFORE (Line 13):**
```typescript
const ADMIN_EMAIL = 'aamanojkumar190@gmail.com';
```

**AFTER (Line 13):**
```typescript
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'aamanojkumar190@gmail.com';
```

**Change:**
- Make admin email configurable via environment variable

---

## HIGH PRIORITY FIX #3: Context Admin Email

### File: `frontend/src/contexts/AuthContext.tsx`

**BEFORE (Line 6):**
```typescript
const ADMIN_EMAIL = 'aamanojkumar190@gmail.com';
```

**AFTER (Line 6):**
```typescript
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'aamanojkumar190@gmail.com';
```

**Change:**
- Make admin email configurable via environment variable

---

## HIGH PRIORITY FIX #4: Socket.io Initialization

### File: `backend/src/server.ts`

**BEFORE (Lines 112-113):**
```typescript
    // Socket.io setup (for chat functionality)
    // TODO: Initialize Socket.io server
```

**AFTER (Lines 112-120):**
```typescript
    // Socket.io setup (for chat functionality)
    import { Server } from 'socket.io';
    
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:8080',
        credentials: true,
      },
    });
    
    // TODO: Add Socket.io event handlers for chat
```

**Changes:**
- Import Socket.io
- Initialize with proper CORS
- Add placeholder for event handlers

---

## MEDIUM PRIORITY FIX #1: Consolidate API Implementation

### File: `frontend/src/contexts/AuthContext.tsx`

**ISSUE:** AuthContext uses direct axios instead of apiClient from api.ts

**OPTION A - Use apiClient:**
Replace axios imports with apiClient usage:

**BEFORE (Line 5):**
```typescript
import axios from 'axios';
```

**AFTER (Line 5):**
```typescript
import { apiClient } from '@/services/api';
```

**Then in login function (Line 72):**
```typescript
// OLD:
const response = await axios.post(`${API_BASE_URL}/auth/login`, {
  email,
  password,
});

// NEW:
const response = await apiClient.post('/auth/login', {
  email,
  password,
});
```

---

## MEDIUM PRIORITY FIX #2: Type-Safe Role Conversion

### File: `frontend/src/contexts/AuthContext.tsx`

**BEFORE (Line 100):**
```typescript
role: (data.user.role?.toUpperCase() || 'USER') as UserRole,
```

**AFTER (Line 100):**
```typescript
const roleMap: Record<string, UserRole> = {
  'user': 'USER',
  'contractor': 'CONTRACTOR',
  'super_admin': 'SUPER_ADMIN',
};
role: roleMap[data.user.role?.toLowerCase()] || 'USER',
```

**Benefits:**
- Type-safe conversion
- Validates role value exists
- Clear mapping

---

## MEDIUM PRIORITY FIX #3: Input Validation

### File: `backend/src/controllers/contractor.controller.ts`

**ADD validation in getContractors function (after line 10):**

```typescript
export const getContractors = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { specialty, minRating, availability, search, page = 1, limit = 10 } = req.query;

    // ADD VALIDATION HERE:
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const minRatingNum = minRating ? Math.max(0, Math.min(5, parseFloat(minRating as string))) : undefined;

    const filter: any = { isActive: true };

    // Update filter to use validated values
    if (specialty) {
      filter.specialties = { $in: [specialty] };
    }

    if (minRatingNum !== undefined) {
      filter.rating = { $gte: minRatingNum };
    }

    // ... rest of function using pageNum and limitNum
```

---

## MEDIUM PRIORITY FIX #4: CORS Awareness

### File: `backend/src/server.ts`

**BEFORE (Lines 34-36):**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
```

**AFTER (Lines 34-40):**
```typescript
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.FRONTEND_URL
  : (process.env.FRONTEND_URL || 'http://localhost:8080');

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
```

**Benefit:**
- Production must have FRONTEND_URL set
- Development has auto fallback

---

## Create .env.example File

### File: `frontend/.env.example`

Create this file (currently missing):

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api

# Admin Configuration
VITE_ADMIN_EMAIL=aamanojkumar190@gmail.com
```

---

## Create .env.example for Backend

### File: `backend/.env.example`

Update existing with better comments:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MUST BE SET IN PRODUCTION
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexa_infra

# JWT Authentication - CHANGE IN PRODUCTION
JWT_SECRET=your-very-secure-secret-key-change-this
JWT_EXPIRES_IN=7d

# Admin Configuration
ADMIN_EMAIL=aamanojkumar190@gmail.com

# Frontend URL (MUST be set to frontend origin)
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Optional - Stripe Payment
# STRIPE_SECRET_KEY=your_stripe_secret
# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Optional - Cloudinary Storage
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# Optional - Email Service
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
# EMAIL_FROM=NEXA INFRA <noreply@nexainfra.com>
```

---

## Summary of Changes

Total changes needed: **8 Critical, 6 High Priority, 4 Medium Priority**

### Critical (Must fix immediately):
1. ✅ `backend/src/middleware/auth.middleware.ts` - Line 67, 97
2. ✅ `backend/src/routes/admin.routes.ts` - Line 17
3. ✅ `backend/src/routes/dispute.routes.ts` - Line 31, 34
4. ✅ `backend/src/routes/notification.routes.ts` - Line 29
5. ✅ `backend/src/routes/payment.routes.ts` - Line 32
6. ✅ `frontend/src/pages/admin/AdminDashboard.tsx` - Replace mock with API
7. ✅ `frontend/src/pages/contractor/ContractorDashboard.tsx` - Replace mock with API
8. ✅ `frontend/src/pages/user/UserDashboard.tsx` - Replace mock with API

### High Priority (Fix soon):
1. ✅ `frontend/src/pages/Login.tsx` - Line 13
2. ✅ `frontend/src/contexts/AuthContext.tsx` - Line 6
3. ✅ `backend/src/routes/contractor.routes.ts` - Route order
4. ✅ `backend/src/server.ts` - Socket.io initialization
5. ✅ `frontend/src/contexts/AuthContext.tsx` - API consolidation
6. ✅ `frontend/src/pages/admin/AdminAnalytics.tsx` - Replace mock with API

### Medium Priority (Fix before release):
1. ✅ `backend/src/controllers/contractor.controller.ts` - Input validation
2. ✅ `frontend/src/contexts/AuthContext.tsx` - Type-safe role conversion
3. ✅ `backend/src/server.ts` - CORS handling
4. ✅ Create `frontend/.env.example`

---

**Estimated Time to Fix:** 3-5 days  
**Estimated Time to Test:** 2-3 days  
**Total Timeline:** 1 week

