import { Link } from 'react-router-dom';
import { XCircle, Home, Mail } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';

export default function RejectedAccount() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      <main className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md text-center animate-slide-up">
          <div className="library-card p-8">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <h1 className="font-serif text-2xl font-bold text-foreground mb-3">
              Registration Rejected
            </h1>
            <p className="text-muted-foreground mb-6">
              Unfortunately, your account registration has been rejected by the librarian.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              If you believe this was a mistake or need more information, 
              please contact the library staff for assistance.
            </p>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link to="/">
                <Button className="w-full" variant="outline">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
              <Button className="w-full" variant="secondary">
                <Mail className="h-4 w-4 mr-2" />
                Contact Library
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
