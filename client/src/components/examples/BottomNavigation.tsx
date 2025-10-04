import { useState } from "react";
import BottomNavigation from '../BottomNavigation';

export default function BottomNavigationExample() {
  const [activeTab, setActiveTab] = useState<"discover" | "matches" | "messages" | "profile" | "premium">("discover");

  return (
    <div className="h-screen bg-background pb-16">
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Navigation Demo</h2>
        <p className="text-muted-foreground">
          Current tab: <span className="font-semibold text-primary">{activeTab}</span>
        </p>
      </div>
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchCount={3}
        messageCount={7}
      />
    </div>
  );
}