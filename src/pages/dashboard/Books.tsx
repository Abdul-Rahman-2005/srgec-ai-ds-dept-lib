import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookCard } from '@/components/books/BookCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  edition: string | null;
  total_copies: number;
  available_copies: number;
  cover_url: string | null;
  category: string | null;
  isbn: string | null;
}

const initialFormData = {
  title: '',
  author: '',
  publisher: '',
  edition: '',
  total_copies: 1,
  available_copies: 1,
  cover_url: '',
  category: '',
  isbn: '',
};

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isLibrarian = userProfile?.role === 'librarian';

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredBooks(books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      ));
    } else {
      setFilteredBooks(books);
    }
  }, [books, searchQuery]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const bookData = {
        title: formData.title,
        author: formData.author,
        publisher: formData.publisher,
        edition: formData.edition || null,
        total_copies: formData.total_copies,
        available_copies: formData.available_copies,
        cover_url: formData.cover_url || null,
        category: formData.category || null,
        isbn: formData.isbn || null,
      };

      if (selectedBook) {
        // Update
        const { error } = await supabase
          .from('books')
          .update(bookData)
          .eq('id', selectedBook.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Book updated successfully.' });
      } else {
        // Create
        const { error } = await supabase
          .from('books')
          .insert(bookData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Book added successfully.' });
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setSelectedBook(null);
      fetchBooks();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save book.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      edition: book.edition || '',
      total_copies: book.total_copies,
      available_copies: book.available_copies,
      cover_url: book.cover_url || '',
      category: book.category || '',
      isbn: book.isbn || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedBook) return;

    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', selectedBook.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Book deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete book.',
        variant: 'destructive',
      });
    }
  };

  const openDeleteDialog = (book: Book) => {
    setSelectedBook(book);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Books
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLibrarian ? 'Manage library book collection' : 'Browse available books'}
            </p>
          </div>
          {isLibrarian && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setFormData(initialFormData);
                setSelectedBook(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedBook ? 'Edit Book' : 'Add New Book'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">Title *</label>
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Author *</label>
                      <Input
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Publisher *</label>
                      <Input
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Edition</label>
                      <Input
                        value={formData.edition}
                        onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                        placeholder="e.g., 3rd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Machine Learning"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Copies *</label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.total_copies}
                        onChange={(e) => setFormData({ ...formData, total_copies: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Available Copies *</label>
                      <Input
                        type="number"
                        min="0"
                        max={formData.total_copies}
                        value={formData.available_copies}
                        onChange={(e) => setFormData({ ...formData, available_copies: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">ISBN</label>
                      <Input
                        value={formData.isbn}
                        onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cover Image URL</label>
                      <Input
                        value={formData.cover_url}
                        onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : selectedBook ? 'Update Book' : 'Add Book'}
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
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 library-card">
            <Library className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No books found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add some books to get started'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard
                  id={book.id}
                  title={book.title}
                  author={book.author}
                  publisher={book.publisher}
                  edition={book.edition}
                  totalCopies={book.total_copies}
                  availableCopies={book.available_copies}
                  coverUrl={book.cover_url}
                  category={book.category}
                />
                {isLibrarian && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => handleEdit(book)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8"
                      onClick={() => openDeleteDialog(book)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Book</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
