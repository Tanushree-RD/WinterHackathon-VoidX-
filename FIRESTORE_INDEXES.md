# Firestore Indexes Required

The application uses advanced queries that require specific **Composite Indexes** in Cloud Firestore to function correctly.

## 1. Orders Query
To filter by `status` AND sort by `createdAt`, you must create the following index:

- **Collection ID:** `Orders`
- **Fields Indexed:**
  - `status`: **Ascending**
  - `createdAt`: **Ascending**
- **Query Scope:** Collection

### How to Create the Index
1. **Developer Console Method (Easiest)**:
   - Run the application (`npm run dev`).
   - Open the **Orders** page.
   - Open your browser's **Developer Tools** (F12) -> **Console** tab.
   - You will see a Firebase error message that looks like:
     `Uncaught (in promise) FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/...`
   - **Click that link**. It will take you directly to the Firebase Console with the correct index configuration pre-filled.
   - Click **Create Index**.

2. **Manual Method**:
   - Go to [Firebase Console](https://console.firebase.google.com/).
   - Navigate to **Firestore Database** -> **Indexes**.
   - Click **Add Index**.
   - Enter `Orders` as the Collection ID.
   - Add field `status` (Ascending).
   - Add field `createdAt` (Ascending).
   - Click **Create Index**.
   - Wait a few minutes for the index to build.
