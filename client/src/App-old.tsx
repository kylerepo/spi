import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useMatches } from "@/hooks/useMatches";
import { useSwipe } from "@/hooks/useSwipe";

// Components
import HeroSection from "@/components/HeroSection";
import LoginForm from "@/components/LoginForm";
import SwipeInterface from "@/components/SwipeInterface";
import ChatInterface from "@/components/ChatInterface";
import BottomNavigation from "@/components/BottomNavigation";
import MatchModal from "@/components/MatchModal";
import PremiumModal from "@/components/PremiumModal";
import SignupForm from "@/components/SignupForm";
import ProfileSetup from "@/components/ProfileSetup";

// Mock data - TODO: remove mock functionality
import femaleProfile from "@assets/generated_images/Female_profile_photo_sample_cb9ac9a5.png";
import maleProfile from "@assets/generated_images/Male_profile_photo_sample_254e53d5.png";
import coupleProfile from "@assets/generated_images/Couple_profile_photo_sample_c7dce5fc.png";

function Router() {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, createProfile } = useProfile();
  const [currentView, setCurrentView] = useState<"landing" | "login" | "signup" | "profile-setup">("landing");
  const [activeTab, setActiveTab] = useState<"discover" | "matches" | "messages" | "profile" | "premium">("discover");
  const [showMatch, setShowMatch] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [matchedProfile, setMatchedProfile] = useState<any>(null);

  // Redirect logic based on auth state
  useEffect(() => {
    if (!authLoading) {
      if (user && !profile && !profileLoading) {
        setCurrentView("profile-setup");
      } else if (user && profile) {
        setCurrentView("app" as any);
      } else if (!user) {
        setCurrentView("landing");
      }
    }
  }, [user, profile, authLoading, profileLoading]);

  // Real data will be fetched from Supabase via hooks

  const handleSignIn = () => {
    setCurrentView("login");
  };

  const handleSignUp = () => {
    console.log("Sign up clicked");
    setCurrentView("signup");
  };

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Login error:', error);
      alert(error.message || 'Failed to login');
    }
    // Auth state change will handle navigation
  };

  const handleSignupSubmit = async (userData: {
    email: string;
    password: string;
    name: string;
    age: string;
  }) => {
    // Signup is handled in SignupForm component
    // After successful signup, user will be redirected to profile setup
  };

  const handleBackToLogin = () => {
    setCurrentView("login");
  };

  const handleBackToSignup = () => {
    setCurrentView("signup");
  };

  const handleMatch = (profile: any) => {
    setMatchedProfile(profile);
    setShowMatch(true);
  };

  const handleStartChat = (userId: string) => {
    setSelectedMatch(mockProfiles.find(p => p.id === userId));
    setShowChat(true);
    setShowMatch(false);
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === "premium") {
      setShowPremium(true);
    } else if (tab === "messages" && mockMessages.length > 0) {
      setSelectedMatch(mockProfiles[0]);
      setShowChat(true);
    }
  };

  // Show loading while checking auth
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

  // Landing Page
  if (currentView === "landing") {
    return (
      <div className="min-h-screen bg-background">
        <HeroSection onSignIn={handleSignIn} onSignUp={handleSignUp} />
      </div>
    );
  }

  // Login Page
  if (currentView === "login") {
    return (
      <div className="min-h-screen bg-background">
        <LoginForm
          onLogin={handleLogin}
          onSignup={handleSignUp}
          onForgotPassword={() => console.log("Navigate to forgot password")}
        />
      </div>
    );
  }

  // Signup Page
  if (currentView === "signup") {
    return (
      <div className="min-h-screen bg-background">
        <SignupForm
          onSignup={handleSignupSubmit}
          onLogin={() => setCurrentView("login")}
          isLoading={false}
        />
      </div>
    );
  }

  // Profile Setup Page
  if (currentView === "profile-setup") {
    return (
      <div className="min-h-screen bg-background">
        <ProfileSetup onComplete={() => setCurrentView("app" as any)} />
      </div>
    );
  }


  // Main App
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - Same as Hero Section */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/attached_assets/Pink_silhouettes_dark_background_fd06a0c6_1758731816680.png)',
          filter: 'blur(2px)',
        }}
      />

      {/* Overlay Gradient */}
      <div className="fixed inset-0 bg-black/80" />

      <div className="relative z-10 h-screen flex flex-col">
        {/* Chat Interface */}
        {showChat && selectedMatch ? (
          <ChatInterface
            matchId={selectedMatch.id}
            matchName={selectedMatch.name}
            matchPhoto={selectedMatch.photos[0]}
            messages={mockMessages}
            currentUserId="current-user"
            onSendMessage={(text) => console.log(`Sending: ${text}`)}
            onBack={() => setShowChat(false)}
          />
        ) : (
          <>
            {/* Main Content */}
            <div className="flex-1 pb-16">
              {activeTab === "discover" && (
                <SwipeInterface
                  onMatch={handleMatch}
                  onFilterClick={() => console.log("Opening filters")}
                  onSettingsClick={() => console.log("Opening settings")}
                />
              )}
              {activeTab === "matches" && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {/* SPICE Logo */}
                  <div className="mb-8 text-center">
                    <h1
                      className="text-4xl font-bold mb-2"
                      style={{
                        background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
                      }}
                    >
                      SPICE
                    </h1>
                    <div
                      className="w-16 h-1 mx-auto rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
                        boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
                      }}
                    />
                  </div>
                  <div className="bg-black/70 rounded-2xl border-2 border-pink-500/60 p-6 shadow-lg shadow-pink-500/20">
                    <h2 className="text-2xl font-bold mb-4 text-white">Your Matches</h2>
                    <p className="text-white/80">
                      Matches will appear here when you connect with someone special.
                    </p>
                  </div>
                </div>
              )}
              {activeTab === "profile" && (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  {/* SPICE Logo */}
                  <div className="mb-8 text-center">
                    <h1
                      className="text-4xl font-bold mb-2"
                      style={{
                        background: 'linear-gradient(135deg, #ff1493, #ff69b4, #ff91a4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textShadow: '0 0 20px rgba(255, 20, 147, 0.5)',
                      }}
                    >
                      SPICE
                    </h1>
                    <div
                      className="w-16 h-1 mx-auto rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #ff1493, #ff69b4)',
                        boxShadow: '0 0 10px rgba(255, 20, 147, 0.8)'
                      }}
                    />
                  </div>
                  <div className="bg-black/70 rounded-2xl border-2 border-pink-500/60 p-6 shadow-lg shadow-pink-500/20">
                    <h2 className="text-2xl font-bold mb-4 text-white">Your Profile</h2>
                    <p className="text-white/80">
                      Profile management coming soon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={handleTabChange}
              matchCount={3}
              messageCount={1}
            />
          </>
        )}
      </div>

      {/* Modals */}
      {showMatch && selectedMatch && (
        <MatchModal
          isOpen={showMatch}
          onClose={() => setShowMatch(false)}
          matchedUser={{
            id: selectedMatch.id,
            name: selectedMatch.name,
            photo: selectedMatch.photos[0],
            age: selectedMatch.age
          }}
          currentUser={{
            name: "You",
            photo: "/api/placeholder/200/200"
          }}
          onStartChat={handleStartChat}
          onKeepSwiping={() => setShowMatch(false)}
        />
      )}

      {showPremium && (
        <PremiumModal
          isOpen={showPremium}
          onClose={() => setShowPremium(false)}
          onSubscribe={(plan) => {
            console.log(`Subscribing to ${plan}`);
            setShowPremium(false);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;