# Garak Frontend - Production Architecture

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── detectors/
│   │   ├── page.tsx             # Detectors list (original)
│   │   ├── page.refactored.tsx  # Detectors list (production version)
│   │   ├── [id]/
│   │   │   ├── page.tsx         # Detector detail
│   │   │   └── edit/page.tsx    # Detector edit
│   │   └── new/page.tsx         # Create detector
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── auth/                    # Authentication components
│   │   ├── protected-route.tsx
│   │   └── public-route.tsx
│   ├── detectors/               # Feature-specific components
│   │   ├── detector-form.tsx
│   │   └── detector-view.tsx
│   ├── dialogs/                 # Modal/Dialog components
│   ├── layout/                  # Layout components
│   ├── shared/                  # Shared/reusable components
│   │   ├── error-boundary.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-message.tsx
│   │   └── pagination.tsx
│   ├── ui/                      # shadcn/ui components
│   └── providers.tsx            # App providers wrapper
│
├── config/
│   └── api.ts                   # API endpoint configuration
│
├── constants/                   # Application constants
│   ├── detector.constants.ts
│   ├── routes.constants.ts
│   ├── storage.constants.ts
│   ├── messages.constants.ts
│   └── index.ts
│
├── contexts/                    # React contexts
│   └── auth-context.tsx
│
├── hooks/                       # Custom React hooks
│   ├── use-detectors.ts        # TanStack Query hooks for detectors
│   └── index.ts
│
├── lib/                         # Library code
│   ├── react-query/            # TanStack Query configuration
│   │   ├── query-client.ts
│   │   ├── query-keys.ts
│   │   ├── query-provider.tsx
│   │   └── index.ts
│   └── utils/                  # Utility functions
│       ├── cn.util.ts
│       ├── storage.util.ts
│       ├── error.util.ts
│       ├── format.util.ts
│       ├── validation.util.ts
│       └── index.ts
│
├── services/                   # API service layer
│   └── api/
│       ├── api-client.ts       # Axios client with interceptors
│       ├── detector.service.ts # Detector API calls
│       ├── auth.service.ts     # Auth API calls
│       └── index.ts
│
├── types/                      # TypeScript type definitions
│   ├── detector.types.ts
│   ├── auth.types.ts
│   ├── api.types.ts
│   └── index.ts
│
└── api/                        # Legacy (for backward compatibility)
    ├── axios.ts
    └── utils.ts
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **Services Layer**: Handles all API calls
- **Hooks Layer**: Manages data fetching and state with TanStack Query
- **Components Layer**: Pure presentation components
- **Utils Layer**: Reusable utility functions

### 2. **Type Safety**
- Centralized TypeScript types in `/types`
- Strict typing throughout the application
- No `any` types in production code

### 3. **Error Handling**
- Global error boundary for uncaught errors
- Consistent error messaging through constants
- Proper error extraction and user-friendly messages
- API error interceptors in axios client

### 4. **State Management**
- Server state managed by TanStack Query
- Local UI state managed by React hooks
- Auth state managed by Context API
- Optimistic updates for better UX

### 5. **Constants & Configuration**
- All magic strings moved to constants
- Centralized API endpoint configuration
- Reusable constant definitions

## 🔄 Data Flow

```
User Action
    ↓
Component Event Handler
    ↓
Custom Hook (TanStack Query)
    ↓
Service Layer
    ↓
API Client (Axios)
    ↓
Backend API
    ↓
Response
    ↓
Service Layer Processing
    ↓
Query Cache Update
    ↓
Component Re-render
```

## 🎯 Key Features

### TanStack Query Integration
- **Automatic caching**: Data is cached and reused
- **Background refetching**: Stale data is automatically refreshed
- **Optimistic updates**: UI updates before server confirms
- **Infinite queries**: For pagination
- **Query invalidation**: Smart cache invalidation

### Error Boundary
- Catches JavaScript errors anywhere in component tree
- Provides fallback UI
- Logs errors in development
- Graceful error recovery

### API Client
- Centralized axios instance
- Request/response interceptors
- Automatic token injection
- 401 redirect handling
- Retry logic for failed requests

### Utility Functions
- **Storage**: Safe localStorage/sessionStorage wrapper
- **Error**: Consistent error message extraction
- **Format**: Date, number, percentage formatting
- **Validation**: Email, URL, regex validation
- **CN**: Tailwind class merging

## 📦 Core Packages

- **@tanstack/react-query**: Server state management
- **axios**: HTTP client
- **zod**: Schema validation
- **react-hook-form**: Form handling
- **sonner**: Toast notifications
- **lucide-react**: Icons
- **next-themes**: Theme management

## 🚀 Best Practices

### Component Design
```tsx
// ✅ Good: Separation of concerns
function UserList() {
  const { data, isLoading, error } = useUsers();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return <UserTable users={data} />;
}

// ❌ Bad: Direct API calls in component
function UserList() {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);
  
  return <UserTable users={users} />;
}
```

### API Service Pattern
```tsx
// ✅ Good: Service layer
export const userService = {
  async getList(): Promise<User[]> {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'Get Users');
    }
  }
};

// Usage in hook
export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => userService.getList(),
  });
}
```

### Error Handling
```tsx
// ✅ Good: Centralized error handling
try {
  await userService.create(data);
  toast.success(SUCCESS_MESSAGES.USER_CREATED);
} catch (error) {
  const message = getErrorMessage(error);
  toast.error(message);
}

// ❌ Bad: Inconsistent error handling
try {
  await fetch('/api/users', { method: 'POST', body: JSON.stringify(data) });
  alert('User created!');
} catch (error) {
  alert('Error: ' + error.message);
}
```

## 🔐 Security

- Token stored in localStorage (consider httpOnly cookies for production)
- Automatic token injection via interceptors
- Protected routes with authentication checks
- XSS protection via React's built-in escaping
- CSRF protection recommended for production

## 🧪 Testing Strategy (Recommended)

```typescript
// Unit tests for utilities
describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate('2024-01-01')).toBe('Jan 1, 2024');
  });
});

// Integration tests for hooks
describe('useDetectors', () => {
  it('fetches detectors successfully', async () => {
    const { result } = renderHook(() => useDetectors());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

// E2E tests for critical flows
describe('Detector CRUD', () => {
  it('creates, reads, updates, and deletes a detector', () => {
    // Test implementation
  });
});
```

## 📈 Performance Optimizations

1. **Code Splitting**: Next.js automatic code splitting
2. **Query Caching**: TanStack Query caching strategy
3. **Lazy Loading**: Dynamic imports for heavy components
4. **Memoization**: React.memo for expensive renders
5. **Debouncing**: Search inputs debounced
6. **Prefetching**: Link hover prefetching

## 🔧 Environment Variables

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
```

## 📝 Migration Guide

See [MIGRATION.md](./MIGRATION.md) for detailed migration steps from old structure to new production structure.
