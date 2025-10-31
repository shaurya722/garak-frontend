# Migration Guide - Old Structure to Production Structure

## Overview

This guide helps you migrate from the old component structure to the new production-level architecture with TanStack Query, proper error handling, and better organization.

## 🔄 Step-by-Step Migration

### Step 1: Install Dependencies (Already Done)

The project already has `@tanstack/react-query` installed. Verify in `package.json`:

```json
{
  "@tanstack/react-query": "^5.90.2"
}
```

### Step 2: Understanding the New Structure

#### Old Pattern (Direct API Calls)
```tsx
// ❌ Old way - in component
const [detectors, setDetectors] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.post('/management/company/detector/list');
      setDetectors(response.data.docs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
```

#### New Pattern (TanStack Query)
```tsx
// ✅ New way - with hook
const { data, isLoading, error } = useDetectors({ page, limit, creationType });
```

### Step 3: Migrate API Calls to Services

#### Before
```tsx
// Direct API call in component
const response = await api.post(apiConfig.endpoints.detectorsList, { creationType });
```

#### After
```tsx
// Use service layer
import { detectorService } from '@/services/api';

const detectors = await detectorService.getList({ page, limit, creationType });
```

### Step 4: Migrate Components to Use Hooks

#### Example: Detectors Page

**Before** (`/app/detectors/page.tsx`):
- Direct API calls with useState/useEffect
- Manual loading states
- Manual error handling
- Manual cache management

**After** (`/app/detectors/page.refactored.tsx`):
- Uses `useDetectors()` hook
- Automatic loading/error states
- Built-in caching
- Automatic refetching

#### Migration Steps:

1. **Import the new hook**:
```tsx
import { useDetectors, useDeleteDetector } from '@/hooks';
```

2. **Replace useState/useEffect with hook**:
```tsx
// Before
const [detectors, setDetectors] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  fetchDetectors();
}, [page, limit]);

// After
const { data, isLoading, error } = useDetectors({ page, limit, creationType });
```

3. **Update component to use query data**:
```tsx
// Before
if (loading) return <div>Loading...</div>;

// After
if (isLoading) return <PageLoader />;
if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
```

4. **Use mutation hooks for updates**:
```tsx
// Before
const handleDelete = async (id) => {
  try {
    await api.delete(apiConfig.endpoints.deleteDetector(id));
    toast.success("Deleted");
    fetchDetectors(); // Manually refetch
  } catch (error) {
    toast.error("Failed");
  }
};

// After
const deleteMutation = useDeleteDetector();

const handleDelete = (id) => {
  deleteMutation.mutate(id, {
    onSuccess: () => {
      // Automatic cache invalidation
      refetch();
    }
  });
};
```

### Step 5: Use Constants Instead of Magic Strings

#### Before
```tsx
<Link href="/detectors/new">
  <Button>Create</Button>
</Link>

toast.success("Detector created successfully!");
```

#### After
```tsx
import { ROUTES, SUCCESS_MESSAGES } from '@/constants';

<Link href={ROUTES.DETECTORS_NEW}>
  <Button>Create</Button>
</Link>

toast.success(SUCCESS_MESSAGES.DETECTOR_CREATED);
```

### Step 6: Use Utility Functions

#### Before
```tsx
// Inline date formatting
const date = new Date(detector.createdAt).toLocaleDateString();

// Inline percentage
const confidence = Math.round(detector.confidence * 100) + '%';

// Inline class merging
className={`px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-500'}`}
```

#### After
```tsx
import { formatDate, formatPercentage, cn } from '@/lib/utils';

const date = formatDate(detector.createdAt);
const confidence = formatPercentage(detector.confidence);
className={cn('px-4 py-2', isActive && 'bg-blue-500', !isActive && 'bg-gray-500')}
```

### Step 7: Add Error Boundaries

Wrap route segments or entire pages with ErrorBoundary:

```tsx
import { ErrorBoundary } from '@/components/shared';

export default function Page() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Step 8: Use Shared Components

#### Before (Custom loading spinners everywhere)
```tsx
<div className="flex justify-center">
  <div className="animate-spin">Loading...</div>
</div>
```

#### After (Shared components)
```tsx
import { PageLoader, LoadingSpinner, EmptyState } from '@/components/shared';

// Full page loading
<PageLoader message="Loading detectors..." />

// Inline loading
<LoadingSpinner size="sm" />

// Empty state
<EmptyState
  icon={Zap}
  title="No detectors found"
  description="Create your first detector"
  action={{
    label: "Create Detector",
    onClick: () => router.push(ROUTES.DETECTORS_NEW)
  }}
/>
```

### Step 9: Type Everything

#### Before
```tsx
const [detector, setDetector] = useState(null);
```

#### After
```tsx
import { Detector } from '@/types';

const [detector, setDetector] = useState<Detector | null>(null);
```

## 🔀 File-by-File Migration Checklist

### Components to Migrate

- [x] `/app/detectors/page.tsx` → Use `/app/detectors/page.refactored.tsx` as reference
- [ ] `/app/detectors/[id]/page.tsx` → Migrate to use `useDetector(id)` hook
- [ ] `/app/detectors/[id]/edit/page.tsx` → Use `useDetector()` and `useUpdateDetector()`
- [ ] `/app/detectors/new/page.tsx` → Use `useCreateDetector()`
- [ ] `/components/detectors/detector-form.tsx` → Refactor to use mutations
- [ ] `/components/detectors/detector-view.tsx` → Refactor to use `useDetector()`

### Quick Wins (Low Effort, High Impact)

1. **Replace magic strings with constants** (30 minutes)
   - Replace all route strings with `ROUTES.*`
   - Replace toast messages with `SUCCESS_MESSAGES.*` / `ERROR_MESSAGES.*`

2. **Add shared components** (15 minutes)
   - Replace loading states with `<LoadingSpinner />`
   - Replace empty states with `<EmptyState />`
   - Replace error states with `<ErrorMessage />`

3. **Use utility functions** (20 minutes)
   - Replace date formatting with `formatDate()`
   - Replace percentage formatting with `formatPercentage()`
   - Replace class concatenation with `cn()`

## 🧪 Testing Migration

After migrating each component:

1. **Manual Testing**:
   - Test all CRUD operations
   - Test loading states
   - Test error states
   - Test edge cases (empty lists, network errors)

2. **Check Console**:
   - No errors in console
   - TanStack Query DevTools shows proper queries

3. **Performance Check**:
   - Data caching works (no unnecessary refetches)
   - Optimistic updates work smoothly

## 🚀 Deploying the New Structure

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Testing Build
```bash
npm run build
# Check for TypeScript errors and warnings
```

## 📋 Post-Migration Cleanup

After successful migration:

1. **Remove old files**:
   - Old `/app/detectors/page.tsx` (after testing refactored version)
   - Old `/api/utils.ts` (use `/lib/utils/` instead)

2. **Update imports**:
   - Search for `@/api/axios` → Replace with `@/services/api`
   - Search for direct axios calls → Replace with service calls

3. **Documentation**:
   - Update README with new structure
   - Document new patterns for the team

## ⚠️ Common Pitfalls

1. **Forgetting to invalidate queries**: Always invalidate related queries after mutations
2. **Not handling loading states**: Use `isLoading` from hooks
3. **Mixing old and new patterns**: Be consistent
4. **Not using constants**: Avoid hardcoded strings
5. **Ignoring TypeScript errors**: Fix all type errors before committing

## 🎓 Learning Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Error Handling in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## 💡 Tips

- **Gradual Migration**: Migrate one page/feature at a time
- **Keep Old Files**: Keep `.old` or `.backup` suffix during migration
- **Test Thoroughly**: Test each migrated component before moving to next
- **Use DevTools**: Install React Query DevTools browser extension
- **Ask Questions**: Review `ARCHITECTURE.md` for patterns

## ✅ Migration Complete Checklist

- [ ] All API calls moved to services
- [ ] All components use TanStack Query hooks
- [ ] All magic strings replaced with constants
- [ ] All utility functions centralized
- [ ] Error boundaries added
- [ ] Shared components used consistently
- [ ] TypeScript errors resolved
- [ ] Manual testing completed
- [ ] Performance verified
- [ ] Documentation updated
