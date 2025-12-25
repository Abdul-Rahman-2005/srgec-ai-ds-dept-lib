// Hardcoded librarian credentials
export const LIBRARIAN_CREDENTIALS = {
  username: "AI&DSDEPTLIB@123",
  password: "AI&DSLibrarian@123",
};

// Roll number validation regex for AI&DS department
// Format: YYCCXABRNN where:
// YY = Year (23, 24, 25)
// CC = College code (48)
// X = 1 (Regular) or 5 (Lateral)
// A = Always 'A'
// B = Branch code (54 for AI&DS)
// RNN = Roll number (e.g., K9 or 73)
export const ROLL_NUMBER_REGEX = /^(23|24|25)48[15]A54[A-Z0-9]\d*$/i;

// Faculty ID format: aids_XXXXX
export const FACULTY_ID_REGEX = /^aids_\d{5}$/i;

// Phone number validation (Indian format)
export const PHONE_REGEX = /^[6-9]\d{9}$/;

// User roles
export type UserRole = 'student' | 'faculty' | 'librarian';

// User status
export type UserStatus = 'pending' | 'active' | 'rejected';

// Borrow status
export type BorrowStatus = 'borrowed' | 'returned';

// Academic years for CSP files
export const ACADEMIC_YEARS = [
  "2020-2021",
  "2021-2022",
  "2022-2023",
  "2023-2024",
  "2024-2025",
  "2025-2026",
];

// Navigation items for public pages
export const PUBLIC_NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Search Books", href: "/search" },
];

// Dashboard navigation items
export const STUDENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Search Books", href: "/dashboard/search", icon: "Search" },
  { label: "My Borrowed Books", href: "/dashboard/borrowed", icon: "BookOpen" },
  { label: "Magazines", href: "/dashboard/magazines", icon: "Newspaper" },
  { label: "Journals", href: "/dashboard/journals", icon: "FileText" },
  { label: "CSP Projects", href: "/dashboard/csp", icon: "FolderOpen" },
];

export const FACULTY_NAV_ITEMS = STUDENT_NAV_ITEMS;

export const LIBRARIAN_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Registrations", href: "/dashboard/registrations", icon: "Users" },
  { label: "Books", href: "/dashboard/books", icon: "Library" },
  { label: "Borrow Records", href: "/dashboard/borrows", icon: "ClipboardList" },
  { label: "Magazines", href: "/dashboard/magazines", icon: "Newspaper" },
  { label: "Journals", href: "/dashboard/journals", icon: "FileText" },
  { label: "CSP Projects", href: "/dashboard/csp", icon: "FolderOpen" },
  { label: "Reports", href: "/dashboard/reports", icon: "FileSpreadsheet" },
];
