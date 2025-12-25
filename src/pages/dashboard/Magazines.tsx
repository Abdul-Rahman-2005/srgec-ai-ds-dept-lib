import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Edit, Trash2, Newspaper } from 'lucide-react';
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

interface Magazine {
  id: string;
  title: string;
  publisher: string;
  issue_number: string;
  publication_date: string;
  category: string | null;
}

const initialFormData = {
  title: '',
  publisher: '',
  issue_number: '',
  publication_date: '',
  category: '',
};

export default function Magazines() {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [filteredMagazines, setFilteredMagazines] = useState<Magazine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMagazine, setSelectedMagazine] = useState<Magazine | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isLibrarian = userProfile?.role === 'librarian';

  useEffect(() => {
    fetchMagazines();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredMagazines(magazines.filter(mag =>
        mag.title.toLowerCase().includes(query) ||
        mag.publisher.toLowerCase().includes(query)
      ));
    } else {
      setFilteredMagazines(magazines);
    }
  }, [magazines, searchQuery]);

  const fetchMagazines = async () => {
    try {
      const { data, error } = await supabase
        .from('magazines')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setMagazines(data || []);
    } catch (error) {
      console.error('Error fetching magazines:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const magazineData = {
        title: formData.title,
        publisher: formData.publisher,
        issue_number: formData.issue_number,
        publication_date: formData.publication_date,
        category: formData.category || null,
      };

      if (selectedMagazine) {
        const { error } = await supabase
          .from('magazines')
          .update(magazineData)
          .eq('id', selectedMagazine.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Magazine updated successfully.' });
      } else {
        const { error } = await supabase
          .from('magazines')
          .insert(magazineData);

        if (error) throw error;
        toast({ title: 'Success', description: 'Magazine added successfully.' });
      }

      setIsDialogOpen(false);
      setFormData(initialFormData);
      setSelectedMagazine(null);
      fetchMagazines();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save magazine.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (magazine: Magazine) => {
    setSelectedMagazine(magazine);
    setFormData({
      title: magazine.title,
      publisher: magazine.publisher,
      issue_number: magazine.issue_number,
      publication_date: magazine.publication_date,
      category: magazine.category || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMagazine) return;

    try {
      const { error } = await supabase
        .from('magazines')
        .delete()
        .eq('id', selectedMagazine.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Magazine deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setSelectedMagazine(null);
      fetchMagazines();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete magazine.',
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
              Magazines
            </h1>
            <p className="text-muted-foreground mt-1">
              {isLibrarian ? 'Manage magazine collection' : 'Browse available magazines'}
            </p>
          </div>
          {isLibrarian && (
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setFormData(initialFormData);
                setSelectedMagazine(null);
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Magazine
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {selectedMagazine ? 'Edit Magazine' : 'Add New Magazine'}
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Publisher *</label>
                    <Input
                      value={formData.publisher}
                      onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Issue Number *</label>
                      <Input
                        value={formData.issue_number}
                        onChange={(e) => setFormData({ ...formData, issue_number: e.target.value })}
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Input
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Technology, Science"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : selectedMagazine ? 'Update' : 'Add'}
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
            placeholder="Search magazines..."
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
        ) : filteredMagazines.length === 0 ? (
          <div className="text-center py-20 library-card">
            <Newspaper className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No magazines found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try a different search term' : 'Add some magazines to get started'}
            </p>
          </div>
        ) : (
          <div className="library-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Title</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Publisher</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Issue</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Date</th>
                  <th className="text-left px-6 py-4 font-medium text-foreground">Category</th>
                  {isLibrarian && (
                    <th className="text-right px-6 py-4 font-medium text-foreground">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredMagazines.map((magazine) => (
                  <tr key={magazine.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{magazine.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">{magazine.publisher}</td>
                    <td className="px-6 py-4 text-muted-foreground">{magazine.issue_number}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(magazine.publication_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {magazine.category && (
                        <span className="px-2 py-1 text-xs bg-muted rounded">{magazine.category}</span>
                      )}
                    </td>
                    {isLibrarian && (
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleEdit(magazine)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => {
                              setSelectedMagazine(magazine);
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
              <AlertDialogTitle>Delete Magazine</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedMagazine?.title}"?
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
