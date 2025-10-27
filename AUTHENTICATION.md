# Authentication System Documentation

## Overview

This project implements a comprehensive authentication system with company-based login, route protection, and user session management.

## Features

- **Company-based Login**: Users authenticate with company, email, password, and remember me option
- **Route Protection**: Automatic protection of authenticated routes and redirection for unauthenticated users
- **Session Management**: Token-based authentication with configurable expiration
- **User Context**: Global user state management with React Context
- **Logout Functionality**: Secure logout with token cleanup

## API Integration

### Company Login Endpoint

```
POST http://localhost:3000/api/auth/company/login
```

**Request Body:**
```json
{
    "company": "string",
    "email": "string", 
    "password": "string",
    "rememberMe": boolean
}
```

**Response:**
```json
{
    "token": "jwt_token_here",
    "user": {
        "id": "string",
        "email": "string",
        "company": "string",
        "name": "string"
    }
}
```

## Components

### Authentication Context (`/src/contexts/auth-context.tsx`)

Provides global authentication state and methods:

```tsx
const { user, isLoading, isAuthenticated, login, logout, refreshUser } = useAuth();
```

### Route Protection Components

#### ProtectedRoute (`/src/components/auth/protected-route.tsx`)
Protects routes that require authentication:

```tsx
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

#### PublicRoute (`/src/components/auth/public-route.tsx`)
For public routes with optional redirect when authenticated:

```tsx
<PublicRoute redirectIfAuthenticated={true}>
  <LoginForm />
</PublicRoute>
```

### Layout Integration

#### MainLayout (`/src/components/layout/main-layout.tsx`)
Automatically protects all pages using MainLayout and includes:
- User information display
- Logout functionality
- Navigation sidebar

## Usage Examples

### Protecting a Page

```tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Protected content here</div>
    </ProtectedRoute>
  );
}
```

### Using Authentication Hook

```tsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Login Form Integration

```tsx
import { useAuth } from '@/contexts/auth-context';

function LoginForm() {
  const { login } = useAuth();
  
  const handleSubmit = async (formData) => {
    try {
      await login({
        company: formData.company,
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });
      // Redirect handled automatically
    } catch (error) {
      // Error handling (toast shown automatically)
    }
  };
}
```

## Route Configuration

### Protected Routes (require authentication)
- `/` - Dashboard
- `/projects/*` - Project management
- `/policies/*` - Policy management  
- `/detectors/*` - Detector management
- `/tests/*` - Testing interface
- `/agentic-radar/*` - Agentic radar features
- `/configurations/*` - Configuration management

### Public Routes (no authentication required)
- `/login` - Login page
- `/signup` - Registration page

## Token Management

### Storage
- Tokens are stored in HTTP-only cookies for security
- Configurable expiration (7 days default, 30 days with "Remember Me")

### Automatic Refresh
- User data is automatically refreshed on app initialization
- Invalid tokens trigger automatic logout and redirect

### Security Features
- Automatic token cleanup on logout
- 401 response handling with redirect to login
- Secure cookie configuration with SameSite=Lax

## Middleware Integration

The existing middleware (`/middleware.ts`) works alongside the new authentication system:

- Handles route-level protection
- Supports `NEXT_PUBLIC_SKIP_AUTH` environment variable for development
- Redirects unauthenticated users to login with return URL

## Environment Variables

```env
# Skip authentication for development (optional)
NEXT_PUBLIC_SKIP_AUTH=false

# API base URL for authentication endpoints
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Error Handling

- Network errors are displayed via toast notifications
- Authentication failures redirect to login
- Invalid sessions are automatically cleared
- User-friendly error messages for all scenarios

## Development Notes

### Testing Authentication

1. Set `NEXT_PUBLIC_SKIP_AUTH=true` in `.env.local` to bypass authentication during development
2. Use the login form with valid company credentials
3. Check browser cookies for token storage
4. Test logout functionality and automatic redirects

### Customization

- Modify `LoginCredentials` interface to add/remove fields
- Update API endpoints in `/src/config/api.ts`
- Customize redirect behavior in route components
- Extend user interface in auth context

## Troubleshooting

### Common Issues

1. **"Authentication required" errors**: Check if AuthProvider is wrapped around your app
2. **Infinite redirects**: Ensure public routes are properly configured
3. **Token not persisting**: Check cookie settings and domain configuration
4. **API errors**: Verify API endpoint URLs and request format

### Debug Tips

- Check browser developer tools for cookie storage
- Monitor network requests for authentication calls
- Use React DevTools to inspect auth context state
- Check console for authentication-related errors
