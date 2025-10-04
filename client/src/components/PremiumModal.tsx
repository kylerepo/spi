import { useState } from "react";
import { Crown, Check, X, Star, Zap, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: "monthly" | "quarterly" | "yearly") => void;
}

export default function PremiumModal({
  isOpen,
  onClose,
  onSubscribe,
}: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  const plans = [
    {
      id: "monthly" as const,
      name: "Monthly",
      price: "$29.99",
      period: "/month",
      savings: null,
      popular: false,
    },
    {
      id: "quarterly" as const,
      name: "Quarterly", 
      price: "$74.99",
      period: "/3 months",
      savings: "Save 16%",
      popular: true,
    },
    {
      id: "yearly" as const,
      name: "Yearly",
      price: "$239.99",
      period: "/year",
      savings: "Save 33%",
      popular: false,
    },
  ];

  const features = [
    {
      icon: Eye,
      title: "See Who Likes You",
      description: "Know who's interested before you swipe",
    },
    {
      icon: Zap,
      title: "Unlimited Likes",
      description: "No daily limits on connections",
    },
    {
      icon: Star,
      title: "Priority Matching",
      description: "Your profile gets boosted to the top",
    },
    {
      icon: Heart,
      title: "Read Receipts",
      description: "See when your messages are read",
    },
  ];

  const handleSubscribe = () => {
    console.log(`Subscribing to ${selectedPlan} plan`);
    onSubscribe(selectedPlan);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gradient-to-b from-card to-card/90 border-card-border/60 shadow-3d backdrop-blur-sm glass-card max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10"
            onClick={onClose}
            data-testid="button-close-premium"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-chart-2 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-black" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-muted-foreground">
              Unlock exclusive features and find connections faster
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm" data-testid={`feature-${index}-title`}>
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Plans */}
          <div className="space-y-3 mb-6">
            <h3 className="text-lg font-semibold text-center mb-4">Choose Your Plan</h3>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                } ${plan.popular ? "ring-2 ring-chart-2" : ""}`}
                onClick={() => setSelectedPlan(plan.id)}
                data-testid={`plan-${plan.id}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-chart-2 text-black text-xs">
                    Most Popular
                  </Badge>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{plan.name}</h4>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-primary">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <span className="text-xs text-chart-3 font-medium">{plan.savings}</span>
                    )}
                  </div>
                  
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary"
                      : "border-border"
                  }`}>
                    {selectedPlan === plan.id && (
                      <Check className="w-3 h-3 text-primary-foreground" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
            data-testid="button-subscribe"
          >
            <Crown className="w-5 h-5 mr-2" />
            Start Premium Experience
          </Button>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            Subscription automatically renews. Cancel anytime in settings.
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}