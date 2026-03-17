# NEXA-INFRA Quick Fix Checklist

Use this checklist to track fixes as you implement them.

---

## CRITICAL FIXES (Do First) 🔴

### [ ] Fix Role Authorization Middleware
- **File:** `backend/src/middleware/auth.middleware.ts`
- **Changes:**
  - [ ] Line 67: `'admin'` → `'super_admin'`
  - [ ] Line 97: `'admin'` → `'super_admin'`
- **Test:** Try accessing `/api/admin/analytics` as super_admin user
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Fix Admin Routes Authorization
- **File:** `backend/src/routes/admin.routes.ts`
- **Changes:**
  - [ ] Line 17: `authorize('admin')` → `authorize('super_admin')`
- **Test:** Verify admin routes are protected properly
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Fix Dispute Routes Authorization
- **File:** `backend/src/routes/dispute.routes.ts`
- **Changes:**
  - [ ] Line 31: `authorize('admin')` → `authorize('super_admin')`
  - [ ] Line 34: `authorize('admin')` → `authorize('super_admin')`
- **Test:** Verify dispute status updates work for admin
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Fix Notification Routes Authorization
- **File:** `backend/src/routes/notification.routes.ts`
- **Changes:**
  - [ ] Line 29: `authorize('admin')` → `authorize('super_admin')`
- **Test:** Verify admin can create notifications
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Fix Payment Routes Authorization
- **File:** `backend/src/routes/payment.routes.ts`
- **Changes:**
  - [ ] Line 32: `authorize('admin')` → `authorize('super_admin')`
- **Test:** Verify admin refund processing works
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Replace Mock Data - Admin Dashboard
- **File:** `frontend/src/pages/admin/AdminDashboard.tsx`
- **Changes:**
  - [ ] Replace `MOCK_CONTRACTORS` with API calls
  - [ ] Replace `MOCK_PROJECTS` with API calls
  - [ ] Add loading states
  - [ ] Add error handling
- **API Endpoints:**
  - `GET /api/admin/analytics` - Get analytics data
  - `GET /api/admin/contractors` - Get contractors list
  - `GET /api/admin/projects` - Get projects list
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Replace Mock Data - Contractor Dashboard
- **File:** `frontend/src/pages/contractor/ContractorDashboard.tsx`
- **Changes:**
  - [ ] Replace `MOCK_PROJECTS` with API calls
  - [ ] Replace `MOCK_REVIEWS` with API calls
  - [ ] Add loading states
  - [ ] Add error handling
- **API Endpoints:**
  - `GET /api/projects` (filtered by contractor role)
  - `GET /api/reviews?contractorId=...`
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Replace Mock Data - User Dashboard
- **File:** `frontend/src/pages/user/UserDashboard.tsx`
- **Changes:**
  - [ ] Replace `MOCK_PROJECTS` with API calls
  - [ ] Add loading states
  - [ ] Add error handling
- **API Endpoints:**
  - `GET /api/projects` (filtered by user role)
  - `GET /api/auth/me` - Get current user
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Initialize Socket.io
- **File:** `backend/src/server.ts`
- **Changes:**
  - [ ] Add Socket.io import
  - [ ] Create Socket.io server instance
  - [ ] Add CORS configuration
  - [ ] Add event listeners placeholder
- **Test:** Verify Socket.io initializes without errors
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

## HIGH PRIORITY FIXES 🟠

### [ ] Make Admin Email Configurable (Frontend Login)
- **File:** `frontend/src/pages/Login.tsx`
- **Changes:**
  - [ ] Line 13: Replace hardcoded email with env var
- **New Line 13:**
  ```typescript
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'aamanojkumar190@gmail.com';
  ```
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Make Admin Email Configurable (AuthContext)
- **File:** `frontend/src/contexts/AuthContext.tsx`
- **Changes:**
  - [ ] Line 6: Replace hardcoded email with env var
- **New Line 6:**
  ```typescript
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'aamanojkumar190@gmail.com';
  ```
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Fix Contractor Routes Order
- **File:** `backend/src/routes/contractor.routes.ts`
- **Changes:**
  - [ ] Move `/favorites` route BEFORE `/:id` route
- **Why:** Express matches routes in order. `/favorites` must come before `/:id` pattern
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Consolidate API Implementation
- **File:** `frontend/src/contexts/AuthContext.tsx`
- **Changes:**
  - [ ] Replace direct axios with apiClient
  - [ ] Update import: `axios` → `apiClient`
  - [ ] Update login function to use apiClient
  - [ ] Update register function to use apiClient
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Replace Mock Data - Admin Analytics
- **File:** `frontend/src/pages/admin/AdminAnalytics.tsx`
- **Changes:**
  - [ ] Replace hardcoded monthlyRevenue data
  - [ ] Replace hardcoded projectStats data
  - [ ] Replace hardcoded statusDistribution data
  - [ ] Add API calls to `/api/admin/analytics`
  - [ ] Add loading states
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

## MEDIUM PRIORITY FIXES 🟡

### [ ] Add Input Validation
- **File:** `backend/src/controllers/contractor.controller.ts`
- **Changes:**
  - [ ] Validate page parameter (must be ≥ 1)
  - [ ] Validate limit parameter (must be 1-100)
  - [ ] Validate minRating (must be 0-5)
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Type-Safe Role Conversion
- **File:** `frontend/src/contexts/AuthContext.tsx`
- **Changes:**
  - [ ] Line 100: Replace `as UserRole` with safe conversion
  - [ ] Create roleMap for safe conversion
  - [ ] Validate role value exists in map
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Improve CORS Configuration
- **File:** `backend/src/server.ts`
- **Changes:**
  - [ ] Make CORS origin NODE_ENV aware
  - [ ] Require FRONTEND_URL in production
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

### [ ] Create Environment Files
- **Files to Create:**
  - [ ] `frontend/.env.example`
  - [ ] Update `backend/.env.example`
- **Contents:**
  - [ ] API configuration
  - [ ] Admin email
  - [ ] Database URL
  - [ ] JWT secret
- **Status:** ☐ Not Started ☐ In Progress ☐ Complete

---

## TESTING CHECKLIST 🧪

### Test Role-Based Access
- [ ] Login as super_admin user
- [ ] Verify admin dashboard loads
- [ ] Verify `/api/admin/*` endpoints work
- [ ] Verify non-admin cannot access admin routes

### Test API Integration
- [ ] Admin dashboard shows real data
- [ ] Contractor dashboard shows real projects
- [ ] User dashboard shows real projects
- [ ] Analytics page loads real metrics

### Test Socket.io
- [ ] Server starts without Socket.io errors
- [ ] Chat connections work
- [ ] Messages send in real-time

### Test Auth Flow
- [ ] User registration works
- [ ] Contractor registration works
- [ ] Login works for all roles
- [ ] Logout clears tokens

### Test Data Consistency
- [ ] Role names match between frontend and backend
- [ ] API responses match expected structure
- [ ] Field names are consistent

---

## DEPLOYMENT CHECKLIST ✅

- [ ] All critical fixes implemented
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Frontend build succeeds
- [ ] Backend build succeeds
- [ ] Docker images built (if applicable)
- [ ] Security audit completed
- [ ] Performance benchmarks acceptable
- [ ] Documentation updated

---

## QUICK REFERENCE

### Role Names (What they SHOULD be):
- Backend: `'user'`, `'contractor'`, `'super_admin'` (lowercase)
- Frontend: `'USER'`, `'CONTRACTOR'`, `'SUPER_ADMIN'` (uppercase)

### API Base URL:
- Development: `http://localhost:5000/api`
- Production: Configure via `VITE_API_BASE_URL` env var

### Admin Email:
- Default: `aamanojkumar190@gmail.com`
- Override: `VITE_ADMIN_EMAIL` (frontend) or `ADMIN_EMAIL` (backend)

### Database:
- Connection: `MONGODB_URI` env var
- Development: `mongodb://localhost:27017/nexa_infra`
- Atlas: Update `.env` with connection string

### JWT:
- Secret: `JWT_SECRET` env var (change in production!)
- Expires: `JWT_EXPIRES_IN=7d`

---

## ESTIMATED TIME

- **Critical Fixes:** 2-3 hours
- **High Priority Fixes:** 1-2 hours
- **Medium Priority Fixes:** 1 hour
- **Testing:** 2-3 hours
- **Total:** 6-9 hours

---

## SUPPORT

If you encounter issues:

1. Check the full `CODE_ANALYSIS_REPORT.md` for details
2. Review `FIXES_NEEDED.md` for code examples
3. Refer to comments in code for context
4. Check error messages carefully

---

**Last Updated:** March 17, 2026

