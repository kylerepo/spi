import { useState } from "react";
import { Heart, X, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProfileCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  bio: string;
  interests: string[];
  isVerified?: boolean;
  isPremium?: boolean;
  profileType: "single" | "couple";
  onLike: (id: string) => void;
  onPass: (id: string) => void;
}

export default function ProfileCard({
  id,
  name,
  age,
  location,
  photos,
  bio,
  interests,
  isVerified = false,
  isPremium = false,
  profileType,
  onLike,
  onPass,
}: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handleLike = () => {
    console.log(`Liked user ${id}`);
    onLike(id);
  };

  const handlePass = () => {
    console.log(`Passed on user ${id}`);
    onPass(id);
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-card to-card/80 rounded-2xl overflow-hidden shadow-3d hover:shadow-3d-hover transition-all duration-300 border border-card-border/60 backdrop-blur-sm glass-card">
      {/* Photo Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={photos[currentPhotoIndex]}
          alt={`${name} photo ${currentPhotoIndex + 1}`}
          className="w-full h-full object-cover"
        />
        
        {/* Photo Navigation */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover-elevate"
              data-testid="button-prev-photo"
            >
              ‹
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover-elevate"
              data-testid="button-next-photo"
            >
              ›
            </button>
            
            {/* Photo Indicators */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {isVerified && (
            <Badge variant="secondary" className="bg-blue-500 text-white text-xs">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {isPremium && (
            <Badge variant="secondary" className="bg-chart-2 text-black text-xs">
              Premium
            </Badge>
          )}
        </div>

        {/* Profile Type */}
        <div className="absolute top-4 left-4">
          <Badge variant="outline" className="bg-black/50 border-white/30 text-white text-xs">
            {profileType === "couple" ? "Couple" : "Single"}
          </Badge>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Name and Age */}
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-2xl font-bold" data-testid="text-profile-name">
            {name}, {age}
          </h3>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="w-4 h-4" />
            <span data-testid="text-profile-location">{location}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Bio */}
        <p className="text-sm text-muted-foreground" data-testid="text-profile-bio">
          {bio}
        </p>

        {/* Interests */}
        <div className="flex flex-wrap gap-2">
          {interests.slice(0, 6).map((interest, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {interest}
            </Badge>
          ))}
          {interests.length > 6 && (
            <Badge variant="secondary" className="text-xs">
              +{interests.length - 6} more
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={handlePass}
            data-testid="button-pass"
          >
            <X className="w-5 h-5 mr-2" />
            Pass
          </Button>
          <Button
            variant="default"
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={handleLike}
            data-testid="button-like"
          >
            <Heart className="w-5 h-5 mr-2" />
            Like
          </Button>
        </div>
      </div>
    </div>
  );
}