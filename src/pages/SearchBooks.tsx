import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { BookCard } from '@/components/books/BookCard';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

export default function SearchBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchQuery, categoryFilter, availabilityFilter]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('title');

      if (error) throw error;

      setBooks(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(b => b.category).filter(Boolean))] as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBooks = () => {
    let filtered = [...books];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.publisher.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(book => book.category === categoryFilter);
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      filtered = filtered.filter(book => book.available_copies > 0);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter(book => book.available_copies === 0);
    }

    setFilteredBooks(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Header */}
      <section className="library-gradient py-12 md:py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
              Search Books
            </h1>
            <p className="text-white/80">
              Browse our collection of books, journals, and academic resources
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-8 border-b border-border bg-card">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Books</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">No books found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No books have been added to the library yet"}
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Showing {filteredBooks.length} of {books.length} books
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
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
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border mt-auto">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-serif font-semibold text-foreground">AI&DS Library</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 AI&DS Department Library. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
