# 🔴 CRITICAL: Enable Google Sign-In in Firebase Console

## Current Error
```
FirebaseError: auth/operation-not-allowed
```

This error means **Google Sign-In provider is DISABLED** in your Firebase project.

## ✅ Step-by-Step Fix

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Click on your project: **quikserv-d7594**

### Step 2: Navigate to Authentication
1. In the left sidebar, click **"Authentication"**
2. Click on the **"Sign-in method"** tab at the top

### Step 3: Enable Google Provider
1. Look for **"Google"** in the list of providers
2. You should see it with status **"Disabled"** or not configured
3. Click on **"Google"** to open the configuration

### Step 4: Configure Google Sign-In
1. Toggle the **"Enable"** switch to **ON**
2. Fill in the required fields:
   - **Project support email**: Select `quikserv@gmail.com` from dropdown
   - **Project public-facing name**: Enter "QuikServ" or "SJEC Canteen"
3. Click **"Save"**

### Step 5: Verify Authorized Domains
1. Still in Authentication, click on **"Settings"** tab
2. Scroll to **"Authorized domains"**
3. Make sure these domains are listed:
   - `localhost` (should be there by default)
   - If deploying, add your production domain

### Step 6: Test Login
1. Go back to: http://localhost:5174
2. Click "Continue with Google"
3. Sign in with `quikserv@gmail.com`
4. Should redirect to `/admin/menu` ✅

## 📋 Checklist

- [ ] Opened Firebase Console
- [ ] Selected project: quikserv-d7594
- [ ] Went to Authentication → Sign-in method
- [ ] Clicked on Google provider
- [ ] Enabled the toggle
- [ ] Set support email to quikserv@gmail.com
- [ ] Saved changes
- [ ] Tested login

## ⚠️ Important Notes

1. **You must have owner/admin access** to the Firebase project
2. **Changes are immediate** - no need to restart dev server
3. **This is a one-time setup** - once enabled, it stays enabled
4. **Without this step, NO Google login will work** - not even for authorized users

## 🎯 What Happens After Enabling

Once Google Sign-In is enabled:
- `quikserv@gmail.com` → Admin access → `/admin/menu`
- `admin@sjec.ac.in` → Admin access → `/admin/menu`
- `student@sjec.ac.in` → User access → `/users/menu`
- `test@gmail.com` → Rejected with error message

## 🆘 Still Having Issues?

If you still see the error after enabling:
1. Clear browser cache and cookies
2. Try in incognito/private window
3. Check Firebase Console → Authentication → Users to see if sign-in attempts are being logged
4. Share a screenshot of your Firebase Console Authentication page
