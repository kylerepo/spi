import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, MessageCircle, Users, Crown, Shield, Lock, Star } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'wouter'
import type { Match, ProfileLike, Profile, ProfilePhoto } from '@shared/schema'

interface MatchWithProfiles extends Match {
  profile1: Profile & { profilePhotos: ProfilePhoto[] }
  profile2: Profile & { profilePhotos: ProfilePhoto[] }
  hasUnreadMessages?: boolean
  lastMessageTime?: string
}

interface LikeWithProfile extends ProfileLike {
  likedProfile: Profile & { profilePhotos: ProfilePhoto[] }
}

interface ProfileWithPhotos extends Profile {
  profilePhotos: ProfilePhoto[]
}

export default function Matches() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('matches')

  // Fetch user's matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery<MatchWithProfiles[]>({
    queryKey: ['/api/matches'],
    enabled: !!user && activeTab === 'matches'
  })

  // Fetch profiles the user liked
  const { data: likedProfiles = [], isLoading: likedLoading } = useQuery<LikeWithProfile[]>({
    queryKey: ['/api/matches/liked'],
    enabled: !!user && activeTab === 'liked'
  })

  // Fetch profiles that liked the user (premium feature)
  const { data: likedByProfiles = [], isLoading: likedByLoading } = useQuery<ProfileWithPhotos[]>({
    queryKey: ['/api/matches/liked-by'],
    enabled: !!user && activeTab === 'liked-by'
  })

  // Check if user has premium membership
  const { data: userProfile } = useQuery<Profile>({
    queryKey: ['/api/profile'],
    enabled: !!user
  })

  const isPremium = userProfile?.membershipType === 'premium' || userProfile?.membershipType === 'vip' || userProfile?.membershipType === 'elite'

  // Unmatch mutation
  const unmatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      return apiRequest(`/api/matches/${matchId}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/matches'] })
      toast({ title: 'Match removed' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error removing match',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    }
  })

  const getProfilePhoto = (photos: ProfilePhoto[]) => {
    const mainPhoto = photos.find(p => p.isProfile) || photos[0]
    return mainPhoto?.url || '/placeholder-avatar.jpg'
  }

  const getOtherProfile = (match: MatchWithProfiles) => {
    return match.profile1.userId === user?.id ? match.profile2 : match.profile1
  }

  const handleStartChat = (matchId: string) => {
    // Navigate to chat with this match
    window.location.href = `/messages/${matchId}`
  }

  const formatLastSeen = (timeString?: string) => {
    if (!timeString) return 'Recently'
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your matches.</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
        <h1 className="text-xl font-bold text-white" data-testid="text-matches-title">
          Matches
        </h1>
        <p className="text-white/60 text-sm">Your connections and activity</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/50 border-b border-pink-500/30 rounded-none">
          <TabsTrigger 
            value="matches" 
            className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
            data-testid="tab-matches"
          >
            Matches
          </TabsTrigger>
          <TabsTrigger 
            value="liked" 
            className="data-[state=active]:bg-pink-600 data-[state=active]:text-white"
            data-testid="tab-liked"
          >
            Who I Like
          </TabsTrigger>
          <TabsTrigger 
            value="liked-by" 
            className="data-[state=active]:bg-pink-600 data-[state=active]:text-white relative"
            data-testid="tab-liked-by"
          >
            Who Likes Me
            {!isPremium && (
              <Lock className="h-3 w-3 ml-1 text-yellow-400" />
            )}
          </TabsTrigger>
        </TabsList>

        {/* Matches Tab */}
        <TabsContent value="matches" className="p-4 pb-20">
          {matchesLoading ? (
            <div className="text-center py-8">
              <p className="text-white/60">Loading your matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <Card className="bg-card/50 border-pink-500/20">
              <CardContent className="text-center py-8">
                <Heart className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No matches yet</h3>
                <p className="text-white/60 mb-4">
                  Start browsing profiles to find your perfect match!
                </p>
                <Link href="/browse">
                  <Button className="bg-pink-600 hover:bg-pink-700" data-testid="button-start-browsing">
                    Start Browsing
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => {
                const otherProfile = getOtherProfile(match)
                return (
                  <Card 
                    key={match.id} 
                    className="bg-card/50 border-pink-500/20 hover:border-pink-500/40 transition-colors"
                    data-testid={`card-match-${match.id}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={getProfilePhoto(otherProfile.profilePhotos)} />
                              <AvatarFallback className="bg-pink-600">
                                {otherProfile.displayName[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {match.hasUnreadMessages && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 bg-pink-500 rounded-full border-2 border-black" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white" data-testid={`text-match-name-${match.id}`}>
                              {otherProfile.displayName}
                            </h3>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                                {otherProfile.accountType}
                              </Badge>
                              {otherProfile.verificationStatus === 'verified' && (
                                <Shield className="h-3 w-3 text-blue-400" />
                              )}
                              {otherProfile.membershipType === 'premium' && (
                                <Crown className="h-3 w-3 text-yellow-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/60">
                            {formatLastSeen(match.lastMessageTime)}
                          </p>
                          <Badge className="bg-green-500/20 text-green-400 text-xs mt-1">
                            Matched
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStartChat(match.id)}
                          className="flex-1 bg-pink-600 hover:bg-pink-700"
                          data-testid={`button-chat-${match.id}`}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {match.hasUnreadMessages ? 'Reply' : 'Chat'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => unmatchMutation.mutate(match.id)}
                          disabled={unmatchMutation.isPending}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          data-testid={`button-unmatch-${match.id}`}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Who I Like Tab */}
        <TabsContent value="liked" className="p-4 pb-20">
          {likedLoading ? (
            <div className="text-center py-8">
              <p className="text-white/60">Loading profiles you liked...</p>
            </div>
          ) : likedProfiles.length === 0 ? (
            <Card className="bg-card/50 border-pink-500/20">
              <CardContent className="text-center py-8">
                <Heart className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No likes yet</h3>
                <p className="text-white/60 mb-4">
                  Profiles you like will appear here
                </p>
                <Link href="/browse">
                  <Button className="bg-pink-600 hover:bg-pink-700" data-testid="button-browse-to-like">
                    Start Liking
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {likedProfiles.map((like) => (
                <Card 
                  key={like.id} 
                  className="bg-card/50 border-pink-500/20"
                  data-testid={`card-liked-${like.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={getProfilePhoto(like.likedProfile.profilePhotos)} />
                          <AvatarFallback className="bg-pink-600">
                            {like.likedProfile.displayName[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-white" data-testid={`text-liked-name-${like.id}`}>
                            {like.likedProfile.displayName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                              {like.likedProfile.accountType}
                            </Badge>
                            {like.likedProfile.verificationStatus === 'verified' && (
                              <Shield className="h-3 w-3 text-blue-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/60">
                          {formatLastSeen(new Date(like.createdAt).toISOString())}
                        </p>
                        <Badge className="bg-yellow-500/20 text-yellow-400 text-xs mt-1">
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Who Likes Me Tab */}
        <TabsContent value="liked-by" className="p-4 pb-20">
          {!isPremium ? (
            <Card className="bg-card/50 border-yellow-500/20">
              <CardContent className="text-center py-8">
                <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Premium Feature</h3>
                <p className="text-white/60 mb-4">
                  Upgrade to Premium to see who likes you and get unlimited likes!
                </p>
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-black" data-testid="button-upgrade-premium">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              </CardContent>
            </Card>
          ) : likedByLoading ? (
            <div className="text-center py-8">
              <p className="text-white/60">Loading profiles that like you...</p>
            </div>
          ) : likedByProfiles.length === 0 ? (
            <Card className="bg-card/50 border-pink-500/20">
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No secret admirers yet</h3>
                <p className="text-white/60">
                  Profiles that like you will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {likedByProfiles.map((profile) => (
                <Card 
                  key={profile.id} 
                  className="bg-card/50 border-pink-500/20"
                  data-testid={`card-liked-by-${profile.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={getProfilePhoto(profile.profilePhotos)} />
                            <AvatarFallback className="bg-pink-600">
                              {profile.displayName[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-pink-500 rounded-full flex items-center justify-center">
                            <Heart className="h-3 w-3 text-white fill-current" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white" data-testid={`text-liked-by-name-${profile.id}`}>
                            {profile.displayName}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-pink-500/50 text-pink-400 text-xs">
                              {profile.accountType}
                            </Badge>
                            {profile.verificationStatus === 'verified' && (
                              <Shield className="h-3 w-3 text-blue-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-pink-500/20 text-pink-400 text-xs">
                        Likes You
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Link href="/browse" className="flex-1">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700" data-testid={`button-view-profile-${profile.id}`}>
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}