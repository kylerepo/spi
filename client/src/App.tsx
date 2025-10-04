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
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login');
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