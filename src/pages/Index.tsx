import { Link } from 'react-router-dom';
import { BookOpen, Search, Users, Clock, ArrowRight, Library, Newspaper, FileText } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Library,
    title: "Extensive Collection",
    description: "Access thousands of books, journals, and magazines in the AI&DS department library.",
  },
  {
    icon: Search,
    title: "Easy Search",
    description: "Find the resources you need quickly with our powerful search functionality.",
  },
  {
    icon: Clock,
    title: "6-Month Borrowing",
    description: "Borrow books for up to 6 months with automatic due date reminders.",
  },
  {
    icon: Newspaper,
    title: "Digital Resources",
    description: "Browse magazines, journals, and CSP project archives online.",
  },
];

const stats = [
  { value: "5000+", label: "Books" },
  { value: "500+", label: "Journals" },
  { value: "200+", label: "Students" },
  { value: "50+", label: "Faculty" },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden library-gradient py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              AI&DS Department Library
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-8 animate-fade-in">
              Your gateway to knowledge. Access books, journals, magazines, and research materials 
              from the Artificial Intelligence & Data Science department.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/search">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Search className="h-4 w-4 mr-2" />
                  Search Books
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-primary">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="font-serif text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our library management system provides all the tools you need to discover, 
              borrow, and manage academic resources.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="library-card p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="container">
          <div className="library-card p-8 md:p-12 text-center max-w-3xl mx-auto">
            <Users className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              Join Our Library Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Students and faculty members can register for an account to borrow books, 
              access digital resources, and receive notifications about new arrivals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg">
                  Register Now
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card border-t border-border">
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
