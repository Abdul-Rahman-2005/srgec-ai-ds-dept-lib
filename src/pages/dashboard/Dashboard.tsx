import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookOpen, Users, ClipboardList, Library, TrendingUp, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalBooks: number;
  borrowedBooks: number;
  pendingRegistrations: number;
  activeUsers: number;
}

export default function Dashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalBooks: 0,
    borrowedBooks: 0,
    pendingRegistrations: 0,
    activeUsers: 0,
  });
  const [recentBorrows, setRecentBorrows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userProfile]);

  const fetchDashboardData = async () => {
    try {
      // Fetch books count
      const { count: booksCount } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true });

      // Fetch active borrows
      const { count: borrowsCount } = await supabase
        .from('borrows')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'borrowed');

      if (userProfile?.role === 'librarian') {
        // Fetch pending registrations for librarian
        const { count: pendingCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch active users
        const { count: activeCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        setStats({
          totalBooks: booksCount || 0,
          borrowedBooks: borrowsCount || 0,
          pendingRegistrations: pendingCount || 0,
          activeUsers: activeCount || 0,
        });
      } else {
        // For students/faculty, fetch their borrowed books
        if (userProfile?.id) {
          const { count: myBorrowsCount } = await supabase
            .from('borrows')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userProfile.id)
            .eq('status', 'borrowed');

          setStats({
            totalBooks: booksCount || 0,
            borrowedBooks: myBorrowsCount || 0,
            pendingRegistrations: 0,
            activeUsers: 0,
          });
        }
      }

      // Fetch recent borrows
      const borrowQuery = supabase
        .from('borrows')
        .select(`
          *,
          books (title, author),
          users (name, roll_or_faculty_id)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (userProfile?.role !== 'librarian' && userProfile?.id) {
        borrowQuery.eq('user_id', userProfile.id);
      }

      const { data: borrows } = await borrowQuery;
      setRecentBorrows(borrows || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatCards = () => {
    if (userProfile?.role === 'librarian') {
      return [
        { icon: Library, label: 'Total Books', value: stats.totalBooks, color: 'text-primary' },
        { icon: ClipboardList, label: 'Active Borrows', value: stats.borrowedBooks, color: 'text-library-blue' },
        { icon: Users, label: 'Pending Approvals', value: stats.pendingRegistrations, color: 'text-library-warning' },
        { icon: TrendingUp, label: 'Active Users', value: stats.activeUsers, color: 'text-library-success' },
      ];
    }
    return [
      { icon: Library, label: 'Library Books', value: stats.totalBooks, color: 'text-primary' },
      { icon: BookOpen, label: 'My Borrowed Books', value: stats.borrowedBooks, color: 'text-library-blue' },
    ];
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Welcome back, {userProfile?.name?.split(' ')[0]}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening in the library today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {getStatCards().map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="library-card p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="library-card p-6">
          <h2 className="font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : recentBorrows.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No recent activity to display.
            </p>
          ) : (
            <div className="space-y-4">
              {recentBorrows.map((borrow) => (
                <div key={borrow.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{borrow.books?.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {userProfile?.role === 'librarian' 
                          ? `Borrowed by ${borrow.users?.name}`
                          : `by ${borrow.books?.author}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`status-badge ${borrow.status === 'borrowed' ? 'status-borrowed' : 'status-returned'}`}>
                      {borrow.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due: {new Date(borrow.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
