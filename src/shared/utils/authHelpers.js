// Admin email list - HARDCODED for security
const ADMIN_EMAILS = [
    'quikserv@gmail.com',      // Primary admin account
    'admin@sjec.ac.in',
    'canteen@sjec.ac.in',
    'manager@sjec.ac.in'
];

// College domain for student validation
const COLLEGE_DOMAIN = '@sjec.ac.in';

/**
 * Determines user role based on email
 * @param {string} email - User's email from Firebase Auth
 * @returns {'admin' | 'user' | null} - User role
 */
export const getUserRole = (email) => {
    if (!email) return null;

    // Check admin list FIRST (highest priority)
    if (ADMIN_EMAILS.includes(email.toLowerCase())) {
        return 'admin';
    }

    // Allow any other email as a regular user
    return 'user';
};

/**
 * Get redirect path based on user role
 * @param {'admin' | 'user'} role - User role
 * @returns {string} - Redirect path
 */
export const getRedirectPath = (role) => {
    switch (role) {
        case 'admin':
            return '/admin/menu';
        case 'user':
            return '/users/menu';
        default:
            return '/login';
    }
};

/**
 * Check if user is authorized
 * @param {string} email - User's email
 * @returns {boolean} - Whether user is authorized
 */
export const isAuthorizedUser = (email) => {
    const role = getUserRole(email);
    return role !== null;
};

/**
 * Check if user is admin
 * @param {string} email - User's email
 * @returns {boolean} - Whether user is admin
 */
export const isAdmin = (email) => {
    return getUserRole(email) === 'admin';
};

/**
 * Check if user is regular user (student)
 * @param {string} email - User's email
 * @returns {boolean} - Whether user is a student
 */
export const isRegularUser = (email) => {
    return getUserRole(email) === 'user';
};
