import { BookOpen, MapPin, Clock, Phone, Mail, GraduationCap, Users } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      
      {/* Hero */}
      <section className="library-gradient py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              About Our Library
            </h1>
            <p className="text-lg text-white/80">
              Serving the AI & Data Science department since 2020
            </p>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="library-card p-8 md:p-12 mb-8">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                Our Mission
              </h2>
              <p className="text-muted-foreground mb-6">
                The AI&DS Department Library is dedicated to supporting the academic and research 
                needs of students and faculty in the field of Artificial Intelligence and Data Science. 
                We provide access to a comprehensive collection of books, journals, magazines, and 
                digital resources to foster learning and innovation.
              </p>
              <p className="text-muted-foreground">
                Our library serves as a hub for knowledge exchange, offering resources that cover 
                machine learning, deep learning, data analytics, computer vision, natural language 
                processing, and related fields.
              </p>
            </div>

            {/* Services */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="library-card p-6">
                <GraduationCap className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">For Students</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Borrow books for up to 6 months</li>
                  <li>• Access digital journals and magazines</li>
                  <li>• View and download CSP project titles</li>
                  <li>• Receive SMS reminders for due dates</li>
                </ul>
              </div>
              <div className="library-card p-6">
                <Users className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-foreground mb-2">For Faculty</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Extended borrowing privileges</li>
                  <li>• Access to research journals</li>
                  <li>• Resource recommendation system</li>
                  <li>• Priority reservation for new books</li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="library-card p-8">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                Contact Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">
                        AI&DS Department Building, 2nd Floor<br />
                        College Campus, City - 500001
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Working Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday - Friday: 9:00 AM - 5:00 PM<br />
                        Saturday: 9:00 AM - 1:00 PM
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">+91 XXXXX XXXXX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">library.aids@college.edu</p>
                    </div>
                  </div>
                </div>
              </div>
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
