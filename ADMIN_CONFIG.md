# Admin Configuration

## 🔑 Authorized Admin Emails

The following emails have admin access to the canteen dashboard:

1. **quikserv@gmail.com** (Primary Admin)
2. **admin@sjec.ac.in**
3. **canteen@sjec.ac.in**
4. **manager@sjec.ac.in**

## 📝 How to Add/Remove Admin Emails

**Location**: `src/shared/utils/authHelpers.js`

```javascript
const ADMIN_EMAILS = [
    'admin@sjec.ac.in',
    'canteen@sjec.ac.in',
    'manager@sjec.ac.in'
    // Add new admin emails here
];
```

### To Add Admin:
1. Open `src/shared/utils/authHelpers.js`
2. Add email to `ADMIN_EMAILS` array
3. Save file
4. Restart dev server (if running)

### To Remove Admin:
1. Open `src/shared/utils/authHelpers.js`
2. Remove email from `ADMIN_EMAILS` array
3. Save file
4. Restart dev server (if running)

## 👨‍🎓 Student Access

Any email ending with `@sjec.ac.in` (not in admin list) will have student/user access.

Examples:
- `student123@sjec.ac.in` → User access
- `john.doe@sjec.ac.in` → User access
- `faculty@sjec.ac.in` → User access

## ❌ Unauthorized Access

Emails that don't match either criteria will be rejected:
- `test@gmail.com` → Rejected
- `user@yahoo.com` → Rejected
- `admin@othercollege.ac.in` → Rejected

## 🔒 Security Notes

- Admin emails are **hardcoded** in the application
- They are **NOT stored** in Firestore or any database
- Changes require code modification and redeployment
- This prevents unauthorized admin access through database manipulation
