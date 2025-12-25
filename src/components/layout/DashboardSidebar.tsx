import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  Search, 
  Users, 
  Library, 
  ClipboardList, 
  Newspaper, 
  FileText, 
  FolderOpen,
  FileSpreadsheet,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { STUDENT_NAV_ITEMS, FACULTY_NAV_ITEMS, LIBRARIAN_NAV_ITEMS } from '@/lib/constants';

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Search,
  BookOpen,
  Users,
  Library,
  ClipboardList,
  Newspaper,
  FileText,
  FolderOpen,
  FileSpreadsheet,
};

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavItems = () => {
    switch (userProfile?.role) {
      case 'librarian':
        return LIBRARIAN_NAV_ITEMS;
      case 'faculty':
        return FACULTY_NAV_ITEMS;
      case 'student':
      default:
        return STUDENT_NAV_ITEMS;
    }
  };

  const navItems = getNavItems();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen library-gradient transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary/20">
                <BookOpen className="h-5 w-5 text-sidebar-primary" />
              </div>
              <span className="font-serif text-lg font-semibold text-sidebar-foreground">
                AI&DS Library
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* User info */}
        {!isCollapsed && userProfile && (
          <div className="border-b border-sidebar-border px-4 py-3">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userProfile.name}
            </p>
            <p className="text-xs text-sidebar-foreground/60 capitalize">
              {userProfile.role}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "sidebar-link",
                  isActive && "sidebar-link-active",
                  isCollapsed && "justify-center px-2"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={handleSignOut}
            className={cn(
              "sidebar-link w-full text-red-300 hover:text-red-200 hover:bg-red-500/20",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
