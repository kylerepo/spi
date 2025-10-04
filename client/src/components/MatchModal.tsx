import { useState } from "react";
import { Heart, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    id: string;
    name: string;
    photo: string;
    age: number;
  };
  currentUser: {
    name: string;
    photo: string;
  };
  onStartChat: (userId: string) => void;
  onKeepSwiping: () => void;
}

export default function MatchModal({
  isOpen,
  onClose,
  matchedUser,
  currentUser,
  onStartChat,
  onKeepSwiping,
}: MatchModalProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  const handleStartChat = () => {
    console.log(`Starting chat with ${matchedUser.id}`);
    onStartChat(matchedUser.id);
    onClose();
  };

  const handleKeepSwiping = () => {
    console.log('Continuing to swipe');
    onKeepSwiping();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-card to-card/90 border-card-border/60 shadow-3d backdrop-blur-sm glass-card">
        <div className="relative p-6 text-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onClose}
            data-testid="button-close-match"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header */}
          <div className="mb-6">
            <div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-bold text-primary mb-2">It's a Match!</h2>
            <p className="text-muted-foreground">
              You and {matchedUser.name} liked each other
            </p>
          </div>

          {/* Profile Photos */}
          <div className="flex justify-center items-center gap-4 mb-8 relative">
            {/* Current User Photo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src={currentUser.photo}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Heart Icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <Heart className="w-6 h-6 text-primary-foreground fill-current" />
              </div>
            </div>

            {/* Matched User Photo */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary">
                <img
                  src={matchedUser.photo}
                  alt={matchedUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* User Names */}
          <div className="mb-8">
            <p className="text-foreground font-medium">
              <span data-testid="text-current-user">{currentUser.name}</span>
              {" & "}
              <span data-testid="text-matched-user">{matchedUser.name}, {matchedUser.age}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartChat}
              className="w-full bg-primary hover:bg-primary/90"
              data-testid="button-start-chat"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chatting
            </Button>
            <Button
              variant="outline"
              onClick={handleKeepSwiping}
              className="w-full"
              data-testid="button-keep-swiping"
            >
              Keep Swiping
            </Button>
          </div>

          {/* Premium Upgrade Hint */}
          <div className="mt-6 p-3 bg-accent/50 rounded-lg border border-accent">
            <p className="text-xs text-muted-foreground">
              💎 Premium members can see who liked them first
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}