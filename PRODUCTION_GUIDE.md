# Production-Level Development Guide

## 🚀 Quick Start with New Structure

### Creating a New Feature

#### 1. Define Types (`/types`)

```typescript
// types/feature.types.ts
export interface Feature {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface CreateFeaturePayload {
  name: string;
  status: "active" | "inactive";
}
```

#### 2. Create Service (`/services/api`)

```typescript
// services/api/feature.service.ts
import { apiClient } from "./api-client";
import { handleApiError } from "@/lib/utils";
import { Feature, CreateFeaturePayload } from "@/types";

export const featureService = {
  async getList(): Promise<Feature[]> {
    try {
      const response = await apiClient.get<{ data: Feature[] }>("/features");
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Get Features");
    }
  },

  async create(payload: CreateFeaturePayload): Promise<Feature> {
    try {
      const response = await apiClient.post<{ data: Feature }>("/features", payload);
      return response.data.data || response.data;
    } catch (error) {
      return handleApiError(error, "Create Feature");
    }
  },
};
```

#### 3. Create Query Keys (`/lib/react-query/query-keys.ts`)

```typescript
// Add to existing queryKeys object
features: {
  all: ["features"] as const,
  lists: () => [...queryKeys.features.all, "list"] as const,
  detail: (id: string) => [...queryKeys.features.all, "detail", id] as const,
},
```

#### 4. Create Custom Hook (`/hooks`)

```typescript
// hooks/use-features.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { featureService } from "@/services/api";
import { queryKeys } from "@/lib/react-query";
import { CreateFeaturePayload } from "@/types";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";

export function useFeatures() {
  return useQuery({
    queryKey: queryKeys.features.lists(),
    queryFn: () => featureService.getList(),
  });
}

export function useCreateFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateFeaturePayload) => featureService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.features.lists() });
      toast.success("Feature created successfully!");
    },
    onError: () => {
      toast.error("Failed to create feature");
    },
  });
}
```

#### 5. Use in Component

```typescript
// app/features/page.tsx
"use client";

import { useFeatures } from "@/hooks/use-features";
import { PageLoader, ErrorMessage } from "@/components/shared";

export default function FeaturesPage() {
  const { data, isLoading, error, refetch } = useFeatures();

  if (isLoading) return <PageLoader />;
  if (error) return <ErrorMessage message="Failed to load" onRetry={refetch} />;

  return (
    <div>
      {data?.map((feature) => (
        <div key={feature.id}>{feature.name}</div>
      ))}
    </div>
  );
}
```

## 📋 Code Patterns & Best Practices

### Pattern 1: List with Filters

```typescript
function UserList() {
  const [filters, setFilters] = useState({ status: "active", search: "" });
  const { data, isLoading } = useUsers(filters);
  
  return (
    <>
      <FilterBar filters={filters} onChange={setFilters} />
      {isLoading ? <LoadingSpinner /> : <UserTable users={data} />}
    </>
  );
}
```

### Pattern 2: Create Form with Mutation

```typescript
function CreateUserForm() {
  const createMutation = useCreateUser();
  const router = useRouter();

  const onSubmit = (data: CreateUserPayload) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        router.push(ROUTES.USERS);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <Button disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
```

### Pattern 3: Detail View with Edit

```typescript
function UserDetail({ id }: { id: string }) {
  const { data: user, isLoading } = useUser(id);
  const updateMutation = useUpdateUser();

  if (isLoading) return <PageLoader />;
  if (!user) return <EmptyState title="User not found" />;

  const handleUpdate = (data: UpdateUserPayload) => {
    updateMutation.mutate({ id, payload: data });
  };

  return <UserForm initialData={user} onSubmit={handleUpdate} />;
}
```

### Pattern 4: Optimistic Updates

```typescript
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: boolean }) =>
      userService.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(id));

      // Optimistically update
      queryClient.setQueryData(queryKeys.users.detail(id), (old: User) => ({
        ...old,
        status,
      }));

      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.users.detail(variables.id),
        context?.previousUser
      );
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
    },
  });
}
```

### Pattern 5: Infinite Scroll

```typescript
export function useInfiniteUsers() {
  return useInfiniteQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: ({ pageParam = 1 }) => userService.getList({ page: pageParam }),
    getNextPageParam: (lastPage) => 
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    initialPageParam: 1,
  });
}

function UserListInfinite() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteUsers();

  return (
    <>
      {data?.pages.map((page) =>
        page.users.map((user) => <UserCard key={user.id} user={user} />)
      )}
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </Button>
      )}
    </>
  );
}
```

## 🎨 Component Patterns

### Loading States

```typescript
// Full page
<PageLoader message="Loading users..." />

// Inline
<LoadingSpinner size="sm" />

// With text
<InlineLoader message="Saving..." />

// Skeleton (recommended)
<Skeleton className="h-12 w-full" />
```

### Error States

```typescript
// With retry
<ErrorMessage message="Failed to load" onRetry={() => refetch()} />

// Inline
<InlineError message="Invalid input" />

// Empty state
<EmptyState
  icon={Users}
  title="No users found"
  description="Get started by creating a user"
  action={{ label: "Create User", onClick: handleCreate }}
/>
```

### Form Validation with Zod

```typescript
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormData = z.infer<typeof schema>;

function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // Handle submission
  };

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>;
}
```

## 🔐 Authentication Pattern

```typescript
// In component
import { useAuth } from "@/contexts/auth-context";

function Profile() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}

// Protected route
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function Page() {
  return (
    <ProtectedRoute>
      <YourComponent />
    </ProtectedRoute>
  );
}
```

## 🧪 Testing Examples

### Testing Hooks

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUsers } from "./use-users";

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test("fetches users successfully", async () => {
  const { result } = renderHook(() => useUsers(), {
    wrapper: createWrapper(),
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(3);
});
```

### Testing Components

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserList from "./UserList";

test("displays users after loading", async () => {
  const queryClient = new QueryClient();
  
  render(
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  );

  expect(screen.getByText("Loading...")).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });
});
```

## 🎯 Performance Tips

### 1. Memoization

```typescript
import { useMemo } from "react";

function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(
    () => users.sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  return <>{sortedUsers.map((user) => <UserCard key={user.id} user={user} />)}</>;
}
```

### 2. Query Prefetching

```typescript
import { useQueryClient } from "@tanstack/react-query";

function UserCard({ user }: { user: User }) {
  const queryClient = useQueryClient();

  const prefetchUserDetail = () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.users.detail(user.id),
      queryFn: () => userService.getById(user.id),
    });
  };

  return (
    <Link 
      href={`/users/${user.id}`} 
      onMouseEnter={prefetchUserDetail}
    >
      {user.name}
    </Link>
  );
}
```

### 3. Debounced Search

```typescript
import { useDeferredValue } from "react";

function SearchableList() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  
  const { data } = useUsers({ search: deferredSearch });

  return (
    <>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} />
      <UserList users={data} />
    </>
  );
}
```

## 🐛 Debugging

### React Query DevTools

Already enabled in development mode. Access via browser DevTools.

### Console Logging

```typescript
// In service
try {
  const response = await apiClient.get("/users");
  console.log("[UserService] Fetched users:", response.data);
  return response.data;
} catch (error) {
  console.error("[UserService] Failed to fetch:", error);
  throw error;
}
```

### Network Tab

Check the Network tab in browser DevTools to inspect:
- Request headers (Authorization token)
- Response status codes
- Response payloads

## 📦 Deployment Checklist

- [ ] All TypeScript errors resolved
- [ ] Environment variables configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] API endpoints point to production
- [ ] Authentication tokens secured
- [ ] CORS configured on backend
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in production build
- [ ] Performance tested
- [ ] Mobile responsive verified

## 🆘 Common Issues & Solutions

### Issue: "Query not updating after mutation"

**Solution**: Make sure to invalidate queries:
```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
```

### Issue: "Stale data showing"

**Solution**: Adjust staleTime:
```typescript
useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 0, // Always fresh
});
```

### Issue: "Too many re-renders"

**Solution**: Use proper dependency arrays:
```typescript
const { data } = useUsers({ filters }); // ❌ filters object recreated
const { data } = useUsers(useMemo(() => ({ filters }), [filters])); // ✅
```

### Issue: "Authentication token not included"

**Solution**: Check axios interceptor in `api-client.ts`:
```typescript
// Should automatically add token
headers.set("Authorization", `Bearer ${token}`);
```

---

For more details, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture overview
- [MIGRATION.md](./MIGRATION.md) - Migration from old structure
- [README.md](./README.md) - Project setup and basics
