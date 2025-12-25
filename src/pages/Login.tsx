import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RoleSelector } from '@/components/auth/RoleSelector';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { useToast } from '@/hooks/use-toast';

type Role = 'student' | 'faculty' | 'librarian';

export default function Login() {
  const [role, setRole] = useState<Role>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const getIdentifierLabel = () => {
    switch (role) {
      case 'student':
        return 'Roll Number';
      case 'faculty':
        return 'Faculty ID';
      case 'librarian':
        return 'Username';
    }
  };

  const getIdentifierPlaceholder = () => {
    switch (role) {
      case 'student':
        return 'Enter your Roll Number (e.g., 23481A54K9)';
      case 'faculty':
        return 'Enter your Faculty ID (e.g., aids_00001)';
      case 'librarian':
        return 'Enter your username';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(identifier, password, role);

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        navigate('/dashboard');
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md animate-slide-up">
          <div className="library-card p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
                <BookOpen className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="text-muted-foreground mt-1">
                Sign in to your account
              </p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <RoleSelector selectedRole={role} onRoleChange={setRole} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {getIdentifierLabel()}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={getIdentifierPlaceholder()}
                  className="library-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="library-input"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="library-btn-primary mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Footer */}
            {role !== 'librarian' && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
