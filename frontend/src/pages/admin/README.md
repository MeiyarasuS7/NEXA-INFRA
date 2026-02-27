# Admin Module Structure

This directory contains the organized structure for the admin section of NEXA INFRA.

## 📁 Directory Structure

```
admin/
├── components/          # Shared admin components
│   ├── StatCard.tsx
│   ├── PageHeader.tsx
│   ├── SearchFilter.tsx
│   ├── ActionButton.tsx
│   ├── DataTable.tsx
│   └── index.ts
├── hooks/              # Custom hooks for data fetching
│   ├── useAdminData.ts
│   └── index.ts
├── services/           # API service layer
│   ├── adminService.ts
│   └── index.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── constants/          # Constants and configuration
│   └── index.ts
├── utils/              # Utility functions
│   ├── helpers.ts
│   └── index.ts
├── AdminDashboard.tsx  # Dashboard page
├── AdminContractors.tsx # Contractor management
├── AdminProjects.tsx   # Project management
├── AdminPayments.tsx   # Payment verification
├── AdminDisputes.tsx   # Dispute resolution
├── AdminReviews.tsx    # Review moderation
├── AdminAnalytics.tsx  # Analytics & reports
├── AdminSettings.tsx   # System settings
├── index.ts            # Central exports
└── README.md           # This file
```

## 🎨 Components

### StatCard
Displays key metrics with optional trend indicators.

```tsx
import { StatCard } from "@/pages/admin";
import { Users } from "lucide-react";

<StatCard 
  title="Total Users" 
  value="8,432" 
  icon={Users}
  trend={{ value: 14, positive: true }}
/>
```

### PageHeader
Standardized page header with title, description, and actions.

```tsx
import { PageHeader } from "@/pages/admin";
import { Button } from "@/components/ui/button";

<PageHeader
  title="Contractors"
  description="Manage platform contractors"
  actions={<Button>Add New</Button>}
/>
```

### SearchFilter
Search input with filter buttons.

```tsx
import { SearchFilter } from "@/pages/admin";

<SearchFilter
  value={search}
  onChange={setSearch}
  placeholder="Search contractors..."
  filters={[
    { label: "All", value: "ALL", active: filter === "ALL", onClick: () => setFilter("ALL") },
    { label: "Pending", value: "PENDING", active: filter === "PENDING", onClick: () => setFilter("PENDING") }
  ]}
/>
```

### ActionButton
Styled action buttons with variants.

```tsx
import { ActionButton } from "@/pages/admin";
import { CheckCircle } from "lucide-react";

<ActionButton
  icon={CheckCircle}
  label="Approve"
  variant="success"
  onClick={handleApprove}
/>
```

### DataTable
Generic table component with custom column rendering.

```tsx
import { DataTable } from "@/pages/admin";

<DataTable
  data={contractors}
  columns={[
    { key: "name", label: "Name" },
    { key: "status", label: "Status", render: (item) => <StatusBadge status={item.status} /> }
  ]}
/>
```

## 🪝 Hooks

### Data Fetching Hooks
- `useAdminStats()` - Dashboard statistics
- `useAdminContractors(filters)` - Contractor list
- `useAdminProjects(filters)` - Project list
- `useAdminPayments(filters)` - Payment records
- `useAdminDisputes(filters)` - Dispute list
- `useAdminReviews(filters)` - Review moderation
- `useAdminAnalytics()` - Analytics data

### Action Hooks
- `useContractorAction()` - Approve/reject contractors
- `useProjectAction()` - Manage projects
- `usePaymentAction()` - Verify/reject payments
- `useResolveDispute()` - Resolve disputes
- `useReviewAction()` - Moderate reviews

Example usage:
```tsx
import { useAdminContractors, useContractorAction } from "@/pages/admin";

const { data: contractors, isLoading } = useAdminContractors({ status: "PENDING" });
const { mutate: performAction } = useContractorAction();

const handleApprove = (contractorId: string) => {
  performAction({
    contractorId,
    action: "approve",
    adminId: currentUser.id
  });
};
```

## 📡 Services

All API calls are organized in `services/adminService.ts`:

```tsx
import { adminService } from "@/pages/admin";

// Get all contractors
const contractors = await adminService.contractors.getAll({ status: "PENDING" });

// Approve contractor
await adminService.contractors.performAction({
  contractorId: "123",
  action: "approve",
  adminId: "admin-1"
});
```

## 📝 Types

Comprehensive TypeScript types for admin functionality:

- `AdminStats` - Dashboard statistics
- `PaymentRecord` - Payment verification data
- `Dispute` - Dispute management
- `AnalyticsData` - Analytics metrics
- `PlatformSettings` - System configuration
- Action types: `ContractorAction`, `ProjectAction`, etc.

## 🎯 Constants

Predefined constants and configurations:

```tsx
import { 
  PROJECT_STATUS_FILTERS, 
  CONTRACTOR_STATUS_FILTERS,
  STATUS_COLORS,
  ADMIN_NAV_ITEMS 
} from "@/pages/admin";
```

## 🛠️ Utils

Helper functions for common operations:

```tsx
import { 
  formatCurrency,
  formatDate,
  getStatusColor,
  exportToCSV,
  calculatePercentage 
} from "@/pages/admin";

const formatted = formatCurrency(45000); // "$45,000"
const color = getStatusColor("APPROVED"); // "hsl(152, 60%, 40%)"
```

## 🔄 Usage Pattern

### In Admin Pages

```tsx
import { 
  PageHeader, 
  StatCard, 
  SearchFilter,
  useAdminContractors,
  formatCurrency
} from "@/pages/admin";

const AdminContractors = () => {
  const [search, setSearch] = useState("");
  const { data: contractors } = useAdminContractors({ search });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contractors"
        description="Manage platform contractors"
      />
      
      <SearchFilter
        value={search}
        onChange={setSearch}
      />
      
      {/* Rest of the page */}
    </div>
  );
};
```

## 🚀 Benefits

1. **Code Reusability** - Shared components across all admin pages
2. **Type Safety** - Comprehensive TypeScript types
3. **Maintainability** - Organized structure with clear separation
4. **Consistency** - Standardized UI patterns
5. **Clean Imports** - Single import source for all admin needs

## 📋 Best Practices

1. Always use hooks for data fetching (React Query integration)
2. Import from `@/pages/admin` for clean imports
3. Use shared components for consistent UI
4. Leverage utility functions for common operations
5. Follow TypeScript types for type safety

## 🔐 Access Control

All admin routes are protected by the `ProtectedRoute` component with `allowedRoles={['SUPER_ADMIN']}`.
