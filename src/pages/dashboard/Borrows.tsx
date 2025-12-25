import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, RotateCcw, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Borrow {
  id: string;
  borrow_date: string;
  due_date: string;
  returned_at: string | null;
  status: 'borrowed' | 'returned';
  books: {
    id: string;
    title: string;
    author: string;
  };
  users: {
    id: string;
    name: string;
    roll_or_faculty_id: string;
    role: string;
  };
}

interface Book {
  id: string;
  title: string;
  author: string;
  available_copies: number;
}

interface User {
  id: string;
  name: string;
  roll_or_faculty_id: string;
  role: string;
}

export default function Borrows() {
  const [borrows, setBorrows] = useState<Borrow[]>([]);
  const [filteredBorrows, setFilteredBorrows] = useState<Borrow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('borrowed');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isLibrarian = userProfile?.role === 'librarian';

  useEffect(() => {
    fetchBorrows();
    if (isLibrarian) {
      fetchBooksAndUsers();
    }
  }, [isLibrarian]);

  useEffect(() => {
    filterBorrows();
  }, [borrows, searchQuery, activeTab]);

  const fetchBorrows = async () => {
    try {
      const { data, error } = await supabase
        .from('borrows')
        .select(`
          *,
          books (id, title, author),
          users (id, name, roll_or_faculty_id, role)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBorrows(data || []);
    } catch (error) {
      console.error('Error fetching borrows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooksAndUsers = async () => {
    try {
      const [booksRes, usersRes] = await Promise.all([
        supabase.from('books').select('id, title, author, available_copies').gt('available_copies', 0),
        supabase.from('users').select('id, name, roll_or_faculty_id, role').eq('status', 'active').neq('role', 'librarian'),
      ]);

      setBooks(booksRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Error fetching books/users:', error);
    }
  };

  const filterBorrows = () => {
    let filtered = borrows.filter(b => b.status === activeTab);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.books.title.toLowerCase().includes(query) ||
        b.users.name.toLowerCase().includes(query) ||
        b.users.roll_or_faculty_id.toLowerCase().includes(query)
      );
    }

    setFilteredBorrows(filtered);
  };

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook || !selectedUser) return;

    setIsSubmitting(true);
    try {
      // Create borrow record
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 6);

      const { error: borrowError } = await supabase
        .from('borrows')
        .insert({
          user_id: selectedUser,
          book_id: selectedBook,
          due_date: dueDate.toISOString().split('T')[0],
        });

      if (borrowError) throw borrowError;

      // Decrease available copies
      const book = books.find(b => b.id === selectedBook);
      if (book) {
        await supabase
          .from('books')
          .update({ available_copies: book.available_copies - 1 })
          .eq('id', selectedBook);
      }

      toast({ title: 'Success', description: 'Book borrowed successfully.' });
      setIsDialogOpen(false);
      setSelectedBook('');
      setSelectedUser('');
      fetchBorrows();
      fetchBooksAndUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record borrow.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async (borrow: Borrow) => {
    try {
      // Update borrow record
      const { error: updateError } = await supabase
        .from('borrows')
        .update({
          status: 'returned',
          returned_at: new Date().toISOString().split('T')[0],
        })
        .eq('id', borrow.id);

      if (updateError) throw updateError;

      // Increase available copies
      const { data: bookData } = await supabase
        .from('books')
        .select('available_copies')
        .eq('id', borrow.books.id)
        .single();

      if (bookData) {
        await supabase
          .from('books')
          .update({ available_copies: bookData.available_copies + 1 })
          .eq('id', borrow.books.id);
      }

      toast({ title: 'Success', description: 'Book returned successfully.' });
      fetchBorrows();
      fetchBooksAndUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to record return.',
        variant: 'destructive',
      });
    }
  };

  const getCounts = () => ({
    borrowed: borrows.filter(b => b.status === 'borrowed').length,
    returned: borrows.filter(b => b.status === 'returned').length,
  });

  const counts = getCounts();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Borrow Records
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLibrarian ? 'Manage book borrowing and returns' : 'View your borrowed books'}
            </p>
          </div>
          {isLibrarian && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Borrow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Borrow</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleBorrow} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select User *</label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.roll_or_faculty_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Book *</label>
                    <Select value={selectedBook} onValueChange={setSelectedBook}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.map((book) => (
                          <SelectItem key={book.id} value={book.id}>
                            {book.title} by {book.author} ({book.available_copies} available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Due Date:</strong> {new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      <br />
                      <span className="text-xs">(6 months from today)</span>
                    </p>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !selectedBook || !selectedUser}>
                      {isSubmitting ? 'Recording...' : 'Record Borrow'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by book or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="borrowed">
              Active ({counts.borrowed})
            </TabsTrigger>
            <TabsTrigger value="returned">
              Returned ({counts.returned})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredBorrows.length === 0 ? (
              <div className="text-center py-20 library-card">
                <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No records found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'borrowed' ? 'No active borrows' : 'No returned books'}
                </p>
              </div>
            ) : (
              <div className="library-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Book</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Borrower</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Borrow Date</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Due Date</th>
                      {activeTab === 'returned' && (
                        <th className="text-left px-6 py-4 font-medium text-foreground">Returned</th>
                      )}
                      {activeTab === 'borrowed' && isLibrarian && (
                        <th className="text-right px-6 py-4 font-medium text-foreground">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBorrows.map((borrow) => {
                      const isOverdue = new Date(borrow.due_date) < new Date() && borrow.status === 'borrowed';
                      return (
                        <tr key={borrow.id} className="border-t border-border hover:bg-muted/50">
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{borrow.books.title}</p>
                            <p className="text-sm text-muted-foreground">{borrow.books.author}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{borrow.users.name}</p>
                            <p className="text-sm text-muted-foreground">{borrow.users.roll_or_faculty_id}</p>
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(borrow.borrow_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                              {new Date(borrow.due_date).toLocaleDateString()}
                              {isOverdue && ' (Overdue)'}
                            </span>
                          </td>
                          {activeTab === 'returned' && (
                            <td className="px-6 py-4 text-muted-foreground">
                              {borrow.returned_at ? new Date(borrow.returned_at).toLocaleDateString() : '-'}
                            </td>
                          )}
                          {activeTab === 'borrowed' && isLibrarian && (
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReturn(borrow)}
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Return
                              </Button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
