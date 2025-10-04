import { useState } from "react";
import { Button } from "@/components/ui/button";
import PremiumModal from '../PremiumModal';

export default function PremiumModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const handleSubscribe = (plan: "monthly" | "quarterly" | "yearly") => {
    console.log(`Subscribing to ${plan} plan`);
    setIsOpen(false);
  };

  return (
    <div className="p-4">
      <Button onClick={() => setIsOpen(true)} data-testid="button-show-premium">
        Show Premium Modal
      </Button>
      
      <PremiumModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}