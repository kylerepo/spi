import { Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider as AuthHookProvider } from "@/hooks/useAuth";
import { AuthProvider } from "@/contexts/AuthContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/lib/supabase";

// Import pages
import HeroSection from "@/components/HeroSection";
import LoginForm from "@/components/LoginForm";
import SignupForm from "@/components/SignupForm";
import ProfileSetupPage from "@/pages/ProfileSetup";
import Browse from "@/pages/Browse";
import Matches from "@/pages/Matches";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Community from "@/pages/Community";
import Support from "@/pages/Support";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/not-found";
import IsoPage from "@/pages/IsoPage";

// Protected Route Component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
    } else if (!authLoading && !profileLoading && user && !profile) {
      setLocation("/profile-setup");
    }
  }, [user, profile, authLoading, profileLoading, setLocation]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SPICE
          </h1>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;
  if (user && !profile) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

// Public Route Component (redirects to browse if already logged in)
function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !profileLoading && user && profile) {
      setLocation("/browse");
    }
  }, [user, profile, loading, profileLoading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1
            className="text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SPICE
          </h1>
          <p className="text-white/80">Loading...</p>
        </div>
      </div>
    );
  }

  return <Component />;
}

// Auth wrapper for login/signup
function AuthWrapper({ type }: { type: 'login' | 'signup' }) {
  const { signIn } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = async (email: string, password: string) => {
    try {
      console.log('🔐 Starting login process...');
      
      const { data, error } = await signIn(email, password);
      
      if (error) {
        console.error('❌ Login error:', error);
        alert(error.message || 'Failed to login');
        return;
      }
      
      console.log('✅ Login successful!', data);
      
      // Check if user has a profile
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ No user found after login');
        alert('Login failed - no user found');
        return;
      }
      
      console.log('👤 User found:', user.id);
      console.log('📧 Email verified:', user.email_confirmed_at);
      
      try {
        // Check for existing profile with better error handling
        console.log('🔍 Checking for existing profile...');
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        console.log('🏠 Profile check result:', { profile, profileError });
        
        if (profileError) {
          if (profileError.code === 'PGRST116') {
            // No profile found - this is expected for new users
            console.log('📝 No profile found (new user), redirecting to profile setup');
            alert('Welcome! Please complete your profile...');
            setLocation("/profile-setup");
            return;
          } else {
            // Actual error - provide detailed information
            console.error('❌ Profile check error:', profileError);
            console.error('Error details:', {
              code: profileError.code,
              message: profileError.message,
              details: profileError.details,
              hint: profileError.hint
            });
            
            // Check if it's an RLS policy issue
            if (profileError.message?.includes('RLS') || profileError.message?.includes('policy')) {
              alert('Database security policies need to be configured. Please check the setup guide.');
            } else if (profileError.message?.includes('relation') && profileError.message?.includes('does not exist')) {
              alert('Database tables need to be created. Please run the database setup.');
            } else {
              alert(`Error checking profile: ${profileError.message}. Please check the console for details.`);
            }
            return;
          }
        }
        
        if (profile) {
          console.log('✅ Profile found, redirecting to browse');
          alert('Welcome back! Redirecting to browse...');
          setLocation("/browse");
        } else {
          console.log('📝 No profile found, redirecting to profile setup');
          alert('Welcome! Please complete your profile...');
          setLocation("/profile-setup");
        }
        
      } catch (profileCheckError) {
        console.error('💥 Profile check exception:', profileCheckError);
        alert('Error checking profile. Please check the console and setup guide.');
      }
      
    } catch (error) {
      console.error('💥 Login exception:', error);
      alert('An error occurred during login');
    }
  };

  if (type === 'login') {
    return (
      <Layout showNav={false}>
        <LoginForm
          onLogin={handleLogin}
          onSignup={() => setLocation("/signup")}
          onForgotPassword={() => console.log("Navigate to forgot password")}
        />
      </Layout>
    );
  }

  return (
    <Layout showNav={false}>
      <SignupForm
        onSignup={() => {}}
        onLogin={() => setLocation("/login")}
        isLoading={false}
      />
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <Layout showNav={false}>
          <PublicRoute component={HeroSection} />
        </Layout>
      </Route>
      <Route path="/login" component={() => <AuthWrapper type="login" />} />
      <Route path="/signup" component={() => <AuthWrapper type="signup" />} />
      
      {/* Profile Setup (semi-protected) */}
      <Route path="/profile-setup">
        <Layout showNav={false}>
          <ProfileSetupPage />
        </Layout>
      </Route>
      
      {/* Protected Routes */}
      <Route path="/community" component={() => <ProtectedRoute component={Community} />} />
      <Route path="/matches" component={() => <ProtectedRoute component={Matches} />} />
      <Route path="/browse" component={() => <ProtectedRoute component={Browse} />} />
      <Route path="/messages" component={() => <ProtectedRoute component={Messages} />} />
      <Route path="/messages/:matchId" component={() => <ProtectedRoute component={Messages} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
      
      {/* Public Info Pages */}
      <Route path="/support">
        <Layout showNav={false}>
          <Support />
        </Layout>
      </Route>
      <Route path="/privacy">
        <Layout showNav={false}>
          <PrivacyPolicy />
        </Layout>
      </Route>
      <Route path="/terms">
        <Layout showNav={false}>
          <TermsOfService />
        </Layout>
      </Route>
      <Route path="/iso">
        <Layout showNav={false}>
          <IsoPage />
        </Layout>
      </Route>
      
      {/* 404 */}
      <Route>
        <Layout showNav={false}>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthHookProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </AuthHookProvider>
    </QueryClientProvider>
  );
}

export default App;