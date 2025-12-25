import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Download, FolderOpen, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ACADEMIC_YEARS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CSPFile {
  id: string;
  academic_year: string;
  file_name: string;
  file_path: string;
  created_at: string;
}

export default function CSPProjects() {
  const [files, setFiles] = useState<CSPFile[]>([]);
  const [selectedYear, setSelectedYear] = useState(ACADEMIC_YEARS[ACADEMIC_YEARS.length - 1]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadYear, setUploadYear] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { userProfile } = useAuth();

  const isLibrarian = userProfile?.role === 'librarian';

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('csp_project_files')
        .select('*')
        .order('academic_year', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error('Error fetching CSP files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileForYear = (year: string) => {
    return files.find(f => f.academic_year === year);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadYear) return;

    setIsUploading(true);
    try {
      // Check if file exists for this year
      const existingFile = getFileForYear(uploadYear);
      if (existingFile) {
        // Delete old file from storage
        await supabase.storage.from('csp-files').remove([existingFile.file_path]);
        // Delete old record
        await supabase.from('csp_project_files').delete().eq('id', existingFile.id);
      }

      // Upload new file
      const filePath = `${uploadYear}/${uploadFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('csp-files')
        .upload(filePath, uploadFile);

      if (uploadError) throw uploadError;

      // Create record
      const { error: insertError } = await supabase
        .from('csp_project_files')
        .insert({
          academic_year: uploadYear,
          file_name: uploadFile.name,
          file_path: filePath,
          uploaded_by: userProfile?.id,
        });

      if (insertError) throw insertError;

      toast({ title: 'Success', description: 'File uploaded successfully.' });
      setIsDialogOpen(false);
      setUploadFile(null);
      setUploadYear('');
      fetchFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload file.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: CSPFile) => {
    try {
      const { data, error } = await supabase.storage
        .from('csp-files')
        .download(file.file_path);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download file.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (file: CSPFile) => {
    try {
      await supabase.storage.from('csp-files').remove([file.file_path]);
      await supabase.from('csp_project_files').delete().eq('id', file.id);
      
      toast({ title: 'Success', description: 'File deleted successfully.' });
      fetchFiles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete file.',
        variant: 'destructive',
      });
    }
  };

  const currentFile = getFileForYear(selectedYear);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">
              CSP Project Titles
            </h1>
            <p className="text-muted-foreground mt-1">
              View and download CSP project titles by academic year
            </p>
          </div>
          {isLibrarian && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload CSP Project File</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Academic Year *</label>
                    <Select value={uploadYear} onValueChange={setUploadYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {ACADEMIC_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                            {getFileForYear(year) && ' (Replace existing)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">File (.docx) *</label>
                    <Input
                      type="file"
                      accept=".docx,.doc,.pdf"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading || !uploadFile || !uploadYear}>
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Year Selector */}
        <div className="library-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <span className="font-medium">Select Academic Year:</span>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* File Display */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : currentFile ? (
          <div className="library-card p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{currentFile.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Academic Year: {currentFile.academic_year}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded: {new Date(currentFile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleDownload(currentFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {isLibrarian && (
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(currentFile)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="library-card p-12 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No file uploaded</h3>
            <p className="text-muted-foreground">
              No CSP project file has been uploaded for {selectedYear}.
            </p>
            {isLibrarian && (
              <Button className="mt-4" onClick={() => {
                setUploadYear(selectedYear);
                setIsDialogOpen(true);
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Upload for {selectedYear}
              </Button>
            )}
          </div>
        )}

        {/* All Files Table (Librarian only) */}
        {isLibrarian && files.length > 0 && (
          <div className="library-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="font-medium text-foreground">All Uploaded Files</h3>
            </div>
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-foreground">Year</th>
                  <th className="text-left px-6 py-3 font-medium text-foreground">File Name</th>
                  <th className="text-left px-6 py-3 font-medium text-foreground">Uploaded</th>
                  <th className="text-right px-6 py-3 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-t border-border">
                    <td className="px-6 py-3 font-medium">{file.academic_year}</td>
                    <td className="px-6 py-3 text-muted-foreground">{file.file_name}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDownload(file)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(file)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
