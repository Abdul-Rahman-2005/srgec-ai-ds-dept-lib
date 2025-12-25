import { Link } from 'react-router-dom';
import { Clock, Home } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="library-card p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
            </div>

            {/* Content */}
            <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
              Registration Pending
            </h1>
            <p className="text-muted-foreground mb-6">
              Your account registration has been submitted successfully. 
              Please wait for the librarian to review and approve your request.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              You will receive an SMS notification once your account is activated.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link to="/">
                <Button className="w-full" variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
              <Link to="/login">
                <Button className="w-full">
                  Try to Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
