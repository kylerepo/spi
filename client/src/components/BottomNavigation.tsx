import { Heart, MessageCircle, Compass, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface BottomNavigationProps {
  activeTab: "discover" | "matches" | "messages" | "profile" | "premium";
  onTabChange: (tab: "discover" | "matches" | "messages" | "profile" | "premium") => void;
  matchCount?: number;
  messageCount?: number;
}

export default function BottomNavigation({
  activeTab,
  onTabChange,
  matchCount = 0,
  messageCount = 0,
}: BottomNavigationProps) {
  const tabs = [
    {
      id: "discover" as const,
      icon: Compass,
      label: "Discover",
      badge: null,
    },
    {
      id: "matches" as const,
      icon: Heart,
      label: "Matches",
      badge: matchCount > 0 ? matchCount : null,
    },
    {
      id: "messages" as const,
      icon: MessageCircle,
      label: "Messages",
      badge: messageCount > 0 ? messageCount : null,
    },
    {
      id: "profile" as const,
      icon: User,
      label: "Profile",
      badge: null,
    },
    {
      id: "premium" as const,
      icon: Crown,
      label: "Premium",
      badge: null,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex flex-col items-center gap-1 p-2 h-auto relative ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
              onClick={() => {
                console.log(`Navigating to ${tab.id}`);
                onTabChange(tab.id);
              }}
              data-testid={`nav-${tab.id}`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
                {tab.badge && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center"
                    data-testid={`badge-${tab.id}`}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}