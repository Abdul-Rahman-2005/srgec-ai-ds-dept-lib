import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Loader2, GraduationCap, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { useToast } from '@/hooks/use-toast';
import { ROLL_NUMBER_REGEX, FACULTY_ID_REGEX, PHONE_REGEX } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Role = 'student' | 'faculty';

export default function Signup() {
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter your full name.", variant: "destructive" });
      return false;
    }

    if (role === 'student' && !ROLL_NUMBER_REGEX.test(identifier)) {
      toast({ 
        title: "Invalid Roll Number", 
        description: "Roll number must follow the format: 23481A54K9", 
        variant: "destructive" 
      });
      return false;
    }

    if (role === 'faculty' && !FACULTY_ID_REGEX.test(identifier)) {
      toast({ 
        title: "Invalid Faculty ID", 
        description: "Faculty ID must follow the format: aids_00001", 
        variant: "destructive" 
      });
      return false;
    }

    if (!PHONE_REGEX.test(phone)) {
      toast({ 
        title: "Invalid Phone Number", 
        description: "Please enter a valid 10-digit Indian phone number.", 
        variant: "destructive" 
      });
      return false;
    }

    if (password.length < 6) {
      toast({ 
        title: "Weak Password", 
        description: "Password must be at least 6 characters long.", 
        variant: "destructive" 
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const { error } = await signUp({
        name,
        role,
        identifier,
        phone,
        password,
      });

      if (error) {
        toast({
          title: "Signup Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Submitted!",
          description: "Your account is pending approval. The librarian will review your request.",
        });
        navigate('/pending-approval');
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
      
      <main className="flex items-center justify-center px-4 py-12 md:py-16">
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
                Create Account
              </h1>
              <p className="text-muted-foreground mt-1">
                Sign up to access the library
              </p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'student' as Role, label: 'Student', icon: GraduationCap },
                { id: 'faculty' as Role, label: 'Faculty', icon: User },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={cn(
                      "role-tab",
                      isSelected && "role-tab-active"
                    )}
                  >
                    <Icon className={cn(
                      "h-6 w-6 mb-1",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name <span className="text-muted-foreground">(as per ID card)</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="library-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {role === 'student' ? 'Roll Number' : 'Faculty ID'}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === 'student' ? 'e.g., 23481A54K9' : 'e.g., aids_00001'}
                  className="library-input"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {role === 'student' 
                    ? 'Format: YYCCXABBRnn (e.g., 23481A54K9)' 
                    : 'Format: aids_XXXXX (e.g., aids_00001)'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit phone number"
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
                  placeholder="Create a password"
                  className="library-input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
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
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
