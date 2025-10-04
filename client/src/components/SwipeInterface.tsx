import { useState, useEffect } from "react";
import ProfileCard from "./ProfileCard";
import { Button } from "@/components/ui/button";
import { Settings, Filter } from "lucide-react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useSwipe } from "@/hooks/useSwipe";
import { Profile } from "@/lib/supabase";

interface SwipeInterfaceProps {
  onMatch: (profile: Profile) => void;
  onFilterClick: () => void;
  onSettingsClick: () => void;
}

export default function SwipeInterface({
  onMatch,
  onFilterClick,
  onSettingsClick,
}: SwipeInterfaceProps) {
  const { profiles, loading: profilesLoading, refetch } = useDiscovery();
  const { like, pass, loading: swipeLoading } = useSwipe();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<string[]>([]);

  const currentProfile = profiles[currentIndex];

  const handleLike = async (id: string) => {
    if (!currentProfile) return;
    
    const { isMatch } = await like(currentProfile);
    
    if (isMatch) {
      setMatches(prev => [...prev, id]);
      onMatch(currentProfile);
    }
    nextProfile();
  };

  const handlePass = async () => {
    if (!currentProfile) return;
    
    await pass(currentProfile);
    nextProfile();
  };

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1);
  };

  if (profilesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-white/80">Loading profiles...</div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2 text-white" data-testid="text-no-more-profiles">
          You've seen everyone!
        </h2>
        <p className="text-white/80 mb-6">
          Check back later for new members or adjust your filters to see more profiles.
        </p>
        <Button onClick={onFilterClick} data-testid="button-adjust-filters">
          <Filter className="w-4 h-4 mr-2" />
          Adjust Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-primary">SPICE</h1>
          <p className="text-sm text-muted-foreground">Discover • Connect • Explore</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFilterClick}
            data-testid="button-filters"
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            data-testid="button-settings"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <ProfileCard
          id={currentProfile.id}
          name={currentProfile.name}
          age={currentProfile.age}
          location={currentProfile.location}
          photos={currentProfile.photos}
          bio={currentProfile.bio || ''}
          interests={currentProfile.interests}
          isVerified={currentProfile.is_verified}
          isPremium={currentProfile.is_premium}
          profileType={currentProfile.profile_type}
          onLike={handleLike}
          onPass={handlePass}
        />
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-primary" data-testid="text-match-count">
              {matches.length}
            </div>
            <div className="text-xs text-muted-foreground">Matches</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground" data-testid="text-profile-count">
              {currentIndex + 1}/{profiles.length}
            </div>
            <div className="text-xs text-muted-foreground">Profiles</div>
          </div>
        </div>
      </div>
    </div>
  );
}