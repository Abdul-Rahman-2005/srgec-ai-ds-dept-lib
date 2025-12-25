import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { LIBRARIAN_CREDENTIALS } from '@/lib/constants';

interface UserProfile {
  id: string;
  auth_id: string;
  name: string;
  role: 'student' | 'faculty' | 'librarian';
  roll_or_faculty_id: string;
  phone: string;
  status: 'pending' | 'active' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (identifier: string, password: string, role: 'student' | 'faculty' | 'librarian') => Promise<{ error: Error | null }>;
  signUp: (data: SignUpData) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  name: string;
  role: 'student' | 'faculty';
  identifier: string;
  phone: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as UserProfile | null;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.id);
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Defer profile fetch to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id).then(setUserProfile);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          setUserProfile(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (identifier: string, password: string, role: 'student' | 'faculty' | 'librarian') => {
    try {
      // Special handling for librarian with hardcoded credentials
      if (role === 'librarian') {
        if (identifier === LIBRARIAN_CREDENTIALS.username && password === LIBRARIAN_CREDENTIALS.password) {
          // Sign in with librarian email
          const { error } = await supabase.auth.signInWithPassword({
            email: 'librarian@library.edu',
            password: LIBRARIAN_CREDENTIALS.password,
          });

          if (error) {
            // If librarian doesn't exist, create the account
            if (error.message.includes('Invalid login credentials')) {
              const { error: signUpError } = await supabase.auth.signUp({
                email: 'librarian@library.edu',
                password: LIBRARIAN_CREDENTIALS.password,
                options: {
                  emailRedirectTo: `${window.location.origin}/`,
                },
              });

              if (signUpError) {
                return { error: signUpError };
              }

              // Sign in again after signup
              const { error: retryError, data } = await supabase.auth.signInWithPassword({
                email: 'librarian@library.edu',
                password: LIBRARIAN_CREDENTIALS.password,
              });

              if (retryError) {
                return { error: retryError };
              }

              // Create librarian profile
              if (data.user) {
                await supabase.from('users').insert({
                  auth_id: data.user.id,
                  name: 'AI&DS Department Librarian',
                  role: 'librarian',
                  roll_or_faculty_id: LIBRARIAN_CREDENTIALS.username,
                  phone: '0000000000',
                  status: 'active',
                });
              }

              return { error: null };
            }
            return { error };
          }

          return { error: null };
        } else {
          return { error: new Error('Invalid librarian credentials') };
        }
      }

      // For students and faculty, sign in first, then validate profile & status
      const email = `${identifier.toLowerCase()}@library.edu`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);

        if (!profile) {
          await supabase.auth.signOut();
          return { error: new Error('User profile not found. Please contact the librarian.') };
        }

        if (profile.role !== role) {
          await supabase.auth.signOut();
          return { error: new Error('You are not registered with this role. Please select the correct role and try again.') };
        }

        if (profile.status === 'pending') {
          await supabase.auth.signOut();
          return { error: new Error('Your account is pending approval. Please wait for the librarian to approve your registration.') };
        }

        if (profile.status === 'rejected') {
          await supabase.auth.signOut();
          return { error: new Error('Your account has been rejected. Please contact the librarian for more information.') };
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };
  const signUp = async (data: SignUpData) => {
    try {
      const email = `${data.identifier.toLowerCase()}@library.edu`;

      // First, sign up with Supabase Auth
      const { error: authError, data: authData } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) {
        return { error: authError };
      }

      // Create user profile
      if (authData.user) {
        const { error: profileError } = await supabase.from('users').insert({
          auth_id: authData.user.id,
          name: data.name,
          role: data.role,
          roll_or_faculty_id: data.identifier,
          phone: data.phone,
          status: 'pending',
        });

        if (profileError) {
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
