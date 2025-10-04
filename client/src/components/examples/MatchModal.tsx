import { useState } from "react";
import { Button } from "@/components/ui/button";
import MatchModal from '../MatchModal';

export default function MatchModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  // TODO: remove mock functionality
  const mockMatchedUser = {
    id: "2",
    name: "Alexandra",
    photo: "/api/placeholder/200/200",
    age: 28
  };

  const mockCurrentUser = {
    name: "You",
    photo: "/api/placeholder/200/201"
  };

  const handleStartChat = (userId: string) => {
    console.log(`Starting chat with ${userId}`);
  };

  const handleKeepSwiping = () => {
    console.log('Keep swiping');
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)} data-testid="button-show-match">
        Show Match Modal
      </Button>
      
      <MatchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        matchedUser={mockMatchedUser}
        currentUser={mockCurrentUser}
        onStartChat={handleStartChat}
        onKeepSwiping={handleKeepSwiping}
      />
    </div>
  );
}