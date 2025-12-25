import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Calendar, AlertTriangle } from 'lucide-react';

interface BorrowedBook {
  id: string;
  borrow_date: string;
  due_date: string;
  status: 'borrowed' | 'returned';
  books: {
    title: string;
    author: string;
    publisher: string;
    cover_url: string | null;
  };
}

export default function BorrowedBooks() {
  const [borrows, setBorrows] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userProfile } = useAuth();

  useEffect(() => {
    if (userProfile?.id) {
      fetchBorrowedBooks();
    }
  }, [userProfile]);

  const fetchBorrowedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('borrows')
        .select(`
          *,
          books (title, author, publisher, cover_url)
        `)
        .eq('user_id', userProfile?.id)
        .eq('status', 'borrowed')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBorrows(data || []);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            My Borrowed Books
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your currently borrowed books and due dates
          </p>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : borrows.length === 0 ? (
          <div className="text-center py-20 library-card">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No borrowed books</h3>
            <p className="text-muted-foreground">
              You haven't borrowed any books yet. Visit the library to borrow books!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {borrows.map((borrow) => {
              const daysUntilDue = getDaysUntilDue(borrow.due_date);
              const isOverdue = daysUntilDue < 0;
              const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

              return (
                <div key={borrow.id} className="library-card p-6">
                  <div className="flex gap-6">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                      {borrow.books.cover_url ? (
                        <img
                          src={borrow.books.cover_url}
                          alt={borrow.books.title}
                          className="w-24 h-32 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-32 bg-muted rounded-lg flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-foreground mb-1">
                        {borrow.books.title}
                      </h3>
                      <p className="text-muted-foreground mb-1">
                        by {borrow.books.author}
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {borrow.books.publisher}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Borrowed: {new Date(borrow.borrow_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 ${isOverdue ? 'text-destructive' : isDueSoon ? 'text-library-warning' : ''}`}>
                          {(isOverdue || isDueSoon) && <AlertTriangle className="h-4 w-4" />}
                          <span className={isOverdue || isDueSoon ? 'font-medium' : 'text-muted-foreground'}>
                            Due: {new Date(borrow.due_date).toLocaleDateString()}
                            {isOverdue && ` (${Math.abs(daysUntilDue)} days overdue)`}
                            {isDueSoon && !isOverdue && ` (${daysUntilDue} days left)`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
