import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface Journal {
  id: string;
  title: string;
  author_editor: string;
  journal_name: string;
  publisher: string;
  publication_date: string;
  category: string | null;
  volume: string | null;
  issue: string | null;
}

const initialFormData = {
  title: '',
  author_editor: '',
  journal_name: '',
  publisher: '',
  publication_date: '',
  category: '',
  volume: '',
  issue: '',
};

export default function Journals() {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isLibrarian = userProfile?.role === 'librarian';

  useEffect(() => {
    fetchJournals();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredJournals(journals.filter(j =>
        j.title.toLowerCase().includes(query) ||
        j.author_editor.toLowerCase().includes(query) ||
        j.journal_name.toLowerCase().includes(query)
      ));
    } else {
      setFilteredJournals(journals);
    }
  }, [journals, searchQuery]);

  const fetchJournals = async () => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const journalData = {
        title: formData.title,
        author_editor: formData.author_editor,
        journal_name: formData.journal_name,
        publisher: formData.publisher,
        publication_date: formData.publication_date,
        category: formData.category || null,
        volume: formData.volume || null,
        issue: formData.issue || null,
      };

      if (selectedJournal) {
        const { error } = await supabase
          .from('journals')
          .update(journalData)
          .eq('id', selectedJournal.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Journal updated successfully.' });
      } else {
        const { error } = await supabase
          .from('journals')
          .insert(journalData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Journal added successfully.' });
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setSelectedJournal(null);
      fetchJournals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save journal.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (journal: Journal) => {
    setSelectedJournal(journal);
    setFormData({
      title: journal.title,
      author_editor: journal.author_editor,
      journal_name: journal.journal_name,
      publisher: journal.publisher,
      publication_date: journal.publication_date,
      category: journal.category || '',
      volume: journal.volume || '',
      issue: journal.issue || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedJournal) return;

    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', selectedJournal.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Journal deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setSelectedJournal(null);
      fetchJournals();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete journal.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              Journals
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLibrarian ? 'Manage journal collection' : 'Browse research journals'}
            </p>
          </div>
          {isLibrarian && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setFormData(initialFormData);
                setSelectedJournal(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Journal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {selectedJournal ? 'Edit Journal' : 'Add New Journal'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Author/Editor *</label>
                      <Input
                        value={formData.author_editor}
                        onChange={(e) => setFormData({ ...formData, author_editor: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Journal Name *</label>
                      <Input
                        value={formData.journal_name}
                        onChange={(e) => setFormData({ ...formData, journal_name: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Publisher *</label>
                      <Input
                        value={formData.publisher}
                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Publication Date *</label>
                      <Input
                        type="date"
                        value={formData.publication_date}
                        onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Volume</label>
                      <Input
                        value={formData.volume}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue</label>
                      <Input
                        value={formData.issue}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : selectedJournal ? 'Update' : 'Add'}
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
            placeholder="Search journals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredJournals.length === 0 ? (
          <div className="text-center py-20 library-card">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No journals found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add some journals to get started'}
            </p>
          </div>
        ) : (
          <div className="library-card overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Title</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Author</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Journal</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Vol/Issue</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Date</th>
                  {isLibrarian && (
                    <th className="text-right px-6 py-4 font-medium text-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredJournals.map((journal) => (
                  <tr key={journal.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{journal.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{journal.author_editor}</td>
                    <td className="px-6 py-4 text-muted-foreground">{journal.journal_name}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {journal.volume && `Vol. ${journal.volume}`}
                      {journal.volume && journal.issue && ', '}
                      {journal.issue && `Issue ${journal.issue}`}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(journal.publication_date).toLocaleDateString()}
                    </td>
                    {isLibrarian && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(journal)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedJournal(journal);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Journal</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedJournal?.title}"?
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
