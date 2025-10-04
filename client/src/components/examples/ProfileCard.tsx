import ProfileCard from '../ProfileCard';

export default function ProfileCardExample() {
  // TODO: remove mock functionality
  const mockProfile = {
    id: "1",
    name: "Alexandra",
    age: 28,
    location: "Manhattan, NY",
    photos: [
      "/api/placeholder/400/600", // Using placeholder for demo
      "/api/placeholder/400/601"
    ],
    bio: "Wine enthusiast, yoga instructor, and adventure seeker. Looking for genuine connections with like-minded individuals.",
    interests: ["Wine Tasting", "Yoga", "Travel", "Fine Dining", "Art", "Dancing", "Hiking", "Photography"],
    isVerified: true,
    isPremium: true,
    profileType: "single" as const
  };

  const handleLike = (id: string) => {
    console.log(`Liked profile ${id}`);
  };

  const handlePass = (id: string) => {
    console.log(`Passed on profile ${id}`);
  };

  return (
    <ProfileCard
      {...mockProfile}
      onLike={handleLike}
      onPass={handlePass}
    />
  );
}