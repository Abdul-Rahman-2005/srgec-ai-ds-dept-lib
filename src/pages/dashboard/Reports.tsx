import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileSpreadsheet, Download, Users, BookOpen, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Reports() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast({
        title: 'No Data',
        description: 'No records found to export.',
        variant: 'destructive',
      });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle values with commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `${filename} has been downloaded.`,
    });
  };

  const exportBorrowRecords = async () => {
    setIsExporting('borrows');
    try {
      const { data, error } = await supabase
        .from('borrows')
        .select(`
          borrow_date,
          due_date,
          returned_at,
          status,
          books (title),
          users (name, roll_or_faculty_id)
        `)
        .order('borrow_date', { ascending: false });

      if (error) throw error;

      const formatted = data?.map(b => ({
        'User Name': b.users?.name || '',
        'User ID': b.users?.roll_or_faculty_id || '',
        'Book Title': b.books?.title || '',
        'Borrow Date': b.borrow_date,
        'Due Date': b.due_date,
        'Return Date': b.returned_at || '-',
        'Status': b.status,
      })) || [];

      exportToCSV(formatted, 'borrow_records');
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportAvailableBooks = async () => {
    setIsExporting('books');
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .gt('available_copies', 0)
        .order('title');

      if (error) throw error;

      const formatted = data?.map(b => ({
        'Title': b.title,
        'Author': b.author,
        'Publisher': b.publisher,
        'Edition': b.edition || '-',
        'Category': b.category || '-',
        'ISBN': b.isbn || '-',
        'Available Copies': b.available_copies,
        'Total Copies': b.total_copies,
      })) || [];

      exportToCSV(formatted, 'available_books');
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportActiveUsers = async () => {
    setIsExporting('users');
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'active')
        .neq('role', 'librarian')
        .order('name');

      if (error) throw error;

      const formatted = data?.map(u => ({
        'Name': u.name,
        'Role': u.role,
        'ID': u.roll_or_faculty_id,
        'Phone': u.phone,
        'Status': u.status,
        'Registered': new Date(u.created_at).toLocaleDateString(),
      })) || [];

      exportToCSV(formatted, 'active_users');
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(null);
    }
  };

  const reports = [
    {
      id: 'borrows',
      title: 'Borrow Records Report',
      description: 'Export all book borrowing records including user details, book titles, dates, and status.',
      icon: ClipboardList,
      action: exportBorrowRecords,
    },
    {
      id: 'books',
      title: 'Available Books Report',
      description: 'Export all currently available books with details like title, author, category, and ISBN.',
      icon: BookOpen,
      action: exportAvailableBooks,
    },
    {
      id: 'users',
      title: 'Active Users Report',
      description: 'Export all active students and faculty members with their registration details.',
      icon: Users,
      action: exportActiveUsers,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Reports & Exports
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate and download reports in CSV format
          </p>
        </div>

        {/* Report Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => {
            const Icon = report.icon;
            const isLoading = isExporting === report.id;

            return (
              <div key={report.id} className="library-card p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">{report.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                    <Button
                      onClick={report.action}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="library-card p-6 bg-accent/50">
          <div className="flex items-start gap-4">
            <FileSpreadsheet className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-medium text-foreground mb-1">About Reports</h3>
              <p className="text-sm text-muted-foreground">
                Reports are exported in CSV format, which can be opened in Microsoft Excel, 
                Google Sheets, or any spreadsheet application. The exported files include 
                all relevant data fields for each report type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
