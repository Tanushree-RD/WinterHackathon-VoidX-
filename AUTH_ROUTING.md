# Authentication & Routing Structure

## Overview
The application now supports role-based authentication and routing, separating concerns between canteen staff and client (student) users.

## Folder Structure

```
src/
├── shared/
│   ├── auth/
│   │   ├── Login.jsx          # Shared login component (role-agnostic)
│   │   ├── Login.css          # Login styles
│   │   └── RoleBasedRoute.jsx # Role-based routing logic
│   ├── components/            # Shared UI components
│   ├── context/               # Shared contexts (Toast, etc.)
│   ├── firebase/              # Firebase configuration
│   └── services/              # Shared services (menu, orders)
├── canteen/
│   ├── pages/                 # Canteen-specific pages
│   │   ├── Menu.jsx
│   │   └── Orders.jsx
│   └── components/            # Canteen-specific components
│       ├── Layout.jsx
│       ├── AddItemModal.jsx
│       └── ProtectedRoute.jsx
└── client/                    # Future: Client/Student app
```

## Routing Logic

### Public Routes
- `/login` - Login page (accessible to all)

### Protected Routes
- `/` - Root route that redirects based on user role
- `/canteen/*` - Canteen staff dashboard
  - `/canteen/menu` - Menu management
  - `/canteen/orders` - Order management
- `/client/*` - Client/Student dashboard (coming soon)

## Role-Based Authentication

### How It Works
1. User logs in via the shared `Login` component
2. `RoleBasedRoute` component checks the user's role from Firestore (`Users` collection)
3. User is redirected to the appropriate dashboard:
   - `role: 'canteen'` → `/canteen/menu`
   - `role: 'client'` → `/client/home`

### User Role Storage (Firestore)
```
Users (collection)
  └── {userId} (document)
      ├── email: string
      ├── role: 'canteen' | 'client'
      └── ... other fields
```

### Backward Compatibility
- If a user document doesn't exist in Firestore, the system defaults to `'canteen'` role
- This ensures existing authenticated users continue to work without migration

## Key Components

### `RoleBasedRoute.jsx`
- Listens to Firebase auth state
- Fetches user role from Firestore
- Redirects to appropriate dashboard based on role
- Shows loading state during authentication check

### `Login.jsx`
- Role-agnostic login form
- Handles Firebase authentication
- Redirects to `/` after successful login (role-based routing takes over)

### `ProtectedRoute.jsx` (Canteen)
- Protects canteen-specific routes
- Ensures only authenticated users can access canteen pages
- Redirects to `/login` if not authenticated

## Future Development

### Adding Client Routes
1. Create `src/client/pages/` and `src/client/components/`
2. Add client-specific routes in `App.jsx`
3. Create a client-specific `ProtectedRoute` if needed
4. Ensure users have `role: 'client'` in Firestore

### Adding New Roles
1. Update `RoleBasedRoute.jsx` to handle new role
2. Add corresponding route in `App.jsx`
3. Create role-specific folder structure
