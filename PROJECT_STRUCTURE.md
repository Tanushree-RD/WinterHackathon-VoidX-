# College Canteen Food Ordering App - Project Structure

## 📁 Folder Structure

```
src/
├── Users/                    ← Student-side web app (NEW)
│   ├── pages/               ← User pages (Menu, Cart, Orders, etc.)
│   ├── components/          ← User-specific components
│   ├── context/             ← User-specific context (CartContext)
│   ├── hooks/               ← Custom hooks for Users app
│   └── styles/              ← User-specific styles
│
├── canteen/                 ← Admin dashboard (EXISTING - DO NOT TOUCH)
│
├── shared/                  ← Shared logic & utilities (EXISTING)
│   ├── components/          ← Reusable UI components (Loading, Toast)
│   ├── context/             ← Shared context (ToastContext)
│   ├── firebase/            ← Firebase configuration
│   └── services/            ← API services (menuService, orderService)
│
├── App.jsx                  ← Auth router (entry point)
├── main.jsx                 ← React entry point
└── index.css                ← Global styles
```

## 🎯 Architecture Overview

### Role-Based Routing
- **Login Page**: Separates Admin and User authentication
- **After Google Sign-In**:
  - Admin → `/admin/*`
  - User → `/users/*`

### Tech Stack
- ✅ Vite + React.js
- ✅ Firebase Authentication
- ✅ Firestore (real-time listeners)
- ✅ React Context for global cart state
- ✅ localStorage for persistence
- ✅ React Router DOM

## 📋 Step 1 Completion Status

✅ Vite + React project initialized
✅ Firebase SDK installed
✅ Firebase configuration set up (`src/shared/firebase/firebase.js`)
✅ Created `src/Users/` folder structure:
   - pages/
   - components/
   - context/
   - hooks/
   - styles/
✅ Existing `src/shared/` folder verified

## 🔥 Firebase Configuration
- **Project**: quikserv-d7594
- **Services Initialized**:
  - Authentication
  - Firestore
  - Storage

## 📝 Next Steps
- Step 2: Set up authentication and role-based routing
- Step 3: Create cart context and state management
- Step 4: Build user pages (Menu, Cart, Orders)
- Step 5: Implement Firebase integration
