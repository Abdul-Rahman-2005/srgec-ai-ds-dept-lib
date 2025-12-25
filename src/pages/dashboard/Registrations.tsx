import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface User {
  id: string;
  name: string;
  role: 'student' | 'faculty' | 'librarian';
  roll_or_faculty_id: string;
  phone: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
}

export default function Registrations() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, activeTab]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('role', 'librarian')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user registrations.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => user.status === activeTab);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.roll_or_faculty_id.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user =>
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      toast({
        title: newStatus === 'active' ? 'User Approved' : 'User Rejected',
        description: `The user has been ${newStatus === 'active' ? 'approved' : 'rejected'} successfully.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const getCounts = () => ({
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  });

  const counts = getCounts();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            User Registrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage student and faculty registration requests
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending
              {counts.pending > 0 && (
                <span className="bg-library-warning text-white text-xs px-2 py-0.5 rounded-full">
                  {counts.pending}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active ({counts.active})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-20 library-card">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">No {activeTab} registrations</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'pending'
                    ? 'All registration requests have been processed.'
                    : `No ${activeTab} users found.`}
                </p>
              </div>
            ) : (
              <div className="library-card overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Name</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Role</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">ID</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Phone</th>
                      <th className="text-left px-6 py-4 font-medium text-foreground">Date</th>
                      {activeTab === 'pending' && (
                        <th className="text-right px-6 py-4 font-medium text-foreground">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-border hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-foreground">{user.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="capitalize text-muted-foreground">{user.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {user.roll_or_faculty_id}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{user.phone}</td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        {activeTab === 'pending' && (
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => updateUserStatus(user.id, 'active')}
                                className="bg-library-success hover:bg-library-success/90"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateUserStatus(user.id, 'rejected')}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
