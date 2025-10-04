import SwipeInterface from '../SwipeInterface';

export default function SwipeInterfaceExample() {
  // TODO: remove mock functionality
  const mockProfiles = [
    {
      id: "1",
      name: "Alexandra",
      age: 28,
      location: "Manhattan, NY",
      photos: ["/api/placeholder/400/600"],
      bio: "Wine enthusiast and adventure seeker.",
      interests: ["Wine", "Travel", "Art"],
      isVerified: true,
      isPremium: true,
      profileType: "single" as const
    },
    {
      id: "2", 
      name: "Marcus & Sarah",
      age: 32,
      location: "Brooklyn, NY",
      photos: ["/api/placeholder/400/601"],
      bio: "Adventurous couple seeking new experiences.",
      interests: ["Dancing", "Travel", "Fine Dining"],
      isVerified: true,
      isPremium: false,
      profileType: "couple" as const
    },
    {
      id: "3",
      name: "James",
      age: 35,
      location: "Chelsea, NY",
      photos: ["/api/placeholder/400/602"],
      bio: "Entrepreneur with a passion for life.",
      interests: ["Business", "Fitness", "Wine"],
      isVerified: false,
      isPremium: true,
      profileType: "single" as const
    }
  ];

  const handleMatch = (profileId: string) => {
    console.log(`New match with profile ${profileId}!`);
  };

  const handleFilterClick = () => {
    console.log('Opening filters');
  };

  const handleSettingsClick = () => {
    console.log('Opening settings');
  };

  return (
    <div className="h-screen">
      <SwipeInterface
        profiles={mockProfiles}
        onMatch={handleMatch}
        onFilterClick={handleFilterClick}
        onSettingsClick={handleSettingsClick}
      />
    </div>
  );
}