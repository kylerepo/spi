import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  Crown,
  Check,
  Star,
  Zap,
  Shield,
  Heart,
  MessageCircle,
  Eye,
  ChevronLeft,
  Sparkles
} from 'lucide-react'

interface ProfileData {
  membershipType: 'free' | 'premium' | 'vip' | 'elite'
}

export default function Membership() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch user profile to check current membership
  const { data: profile } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  })

  const handleUpgrade = async (tier: 'vip' | 'elite') => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to upgrade your membership.',
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)
    
    try {
      if (tier === 'vip') {
        // Navigate to VIP subscription checkout
        setLocation('/checkout/vip-subscription')
      } else {
        // Navigate to Elite one-time payment checkout  
        setLocation('/checkout/elite-payment')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const features = {
    free: [
      'Basic profile creation',
      'Browse other profiles',
      'Send up to 5 likes per day',
      'Basic matching',
      'Community access'
    ],
    vip: [
      'Everything in Free',
      'Unlimited likes and super likes',
      'See who liked you',
      'Advanced search filters',
      'Priority customer support',
      'Boost your profile visibility',
      'Read receipts for messages',
      'Incognito browsing mode'
    ],
    elite: [
      'Everything in VIP',
      'Lifetime membership - no monthly fees',
      'Exclusive Elite badge',
      'VIP events and meetups access',
      'Personal matchmaking consultation',
      'Premium profile verification',
      'Early access to new features',
      'Concierge customer support'
    ]
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/profile')}
            className="text-white hover:bg-pink-500/10"
            data-testid="button-back-to-profile"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Membership Plans</h1>
            <p className="text-white/70 text-sm">Unlock premium features and enhance your experience</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Current Membership Status */}
          {profile && (
            <Card className="bg-black/50 border-pink-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold mb-1">Current Membership</h3>
                    <div className="flex items-center space-x-2">
                      {profile.membershipType === 'free' && (
                        <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">
                          Free
                        </Badge>
                      )}
                      {profile.membershipType === 'premium' && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                          <Crown className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                      {profile.membershipType === 'vip' && (
                        <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/50">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Elite
                        </Badge>
                      )}
                    </div>
                  </div>
                  {profile.membershipType !== 'vip' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                      data-testid="button-upgrade-now"
                    >
                      Upgrade Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Membership Tiers */}
          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Free Tier */}
            <Card className="bg-black/50 border-gray-500/30 relative">
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-500/20 rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-gray-400" />
                  </div>
                  <CardTitle className="text-white text-xl mb-2">Free</CardTitle>
                  <div className="text-3xl font-bold text-white mb-1">$0</div>
                  <div className="text-gray-400 text-sm">Forever</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.free.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  disabled
                  className="w-full bg-gray-500/20 text-gray-400 cursor-not-allowed"
                  data-testid="button-free-tier"
                >
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* VIP Tier */}
            <Card className="bg-black/50 border-purple-500/30 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                  Most Popular
                </Badge>
              </div>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Crown className="h-8 w-8 text-purple-400" />
                  </div>
                  <CardTitle className="text-white text-xl mb-2">VIP</CardTitle>
                  <div className="text-3xl font-bold text-white mb-1">$24.99</div>
                  <div className="text-purple-400 text-sm">per month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.vip.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade('vip')}
                  disabled={isProcessing || profile?.membershipType === 'premium' || profile?.membershipType === 'vip' || profile?.membershipType === 'elite'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  data-testid="button-upgrade-vip"
                >
                  {isProcessing ? 'Processing...' : 'Upgrade to VIP'}
                </Button>
              </CardContent>
            </Card>

            {/* Elite Tier */}
            <Card className="bg-black/50 border-yellow-500/30 relative">
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/50">
                  Lifetime Deal
                </Badge>
              </div>
              <CardHeader>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-yellow-400" />
                  </div>
                  <CardTitle className="text-white text-xl mb-2">Elite</CardTitle>
                  <div className="text-3xl font-bold text-white mb-1">$299.99</div>
                  <div className="text-yellow-400 text-sm">one-time payment</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.elite.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade('elite')}
                  disabled={isProcessing || profile?.membershipType === 'vip' || profile?.membershipType === 'elite'}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  data-testid="button-upgrade-elite"
                >
                  {isProcessing ? 'Processing...' : 'Upgrade to Elite'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Feature Comparison */}
          <Card className="bg-black/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white text-center">Why Upgrade?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <Eye className="h-6 w-6 text-pink-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Enhanced Visibility</h4>
                  <p className="text-white/70 text-sm">Get noticed by more potential matches with profile boosts and priority placement.</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-purple-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Better Connections</h4>
                  <p className="text-white/70 text-sm">See who likes you and connect with serious members looking for meaningful relationships.</p>
                </div>
                <div>
                  <div className="w-12 h-12 mx-auto mb-3 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-semibold mb-2">Premium Experience</h4>
                  <p className="text-white/70 text-sm">Enjoy exclusive features, events, and personalized support for the ultimate experience.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-black/50 border-pink-500/30">
            <CardHeader>
              <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Can I cancel my VIP subscription anytime?</h4>
                <p className="text-white/70 text-sm">Yes, you can cancel your VIP subscription at any time. You'll continue to have access to VIP features until the end of your current billing period.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">What happens if I upgrade from VIP to Elite?</h4>
                <p className="text-white/70 text-sm">Your VIP subscription will be canceled and you'll receive a prorated refund. You'll immediately gain access to all Elite features.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Is Elite membership really lifetime?</h4>
                <p className="text-white/70 text-sm">Yes! Elite membership is a one-time payment that gives you lifetime access to all premium features with no recurring charges.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}