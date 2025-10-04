import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Heart, X, Filter, MapPin, Users, Crown, Shield, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Profile, ProfilePhoto } from '@shared/schema'

interface BrowseProfile extends Profile {
  profilePhotos: ProfilePhoto[]
  distance?: number
  isLiked?: boolean
}

interface FilterOptions {
  minAge: number
  maxAge: number
  seekingGenders: string[]
  accountTypes: string[]
  maxDistance: number
  onlyVerified: boolean
  onlyPremium: boolean
}

export default function Browse() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    minAge: 18,
    maxAge: 65,
    seekingGenders: ['all'],
    accountTypes: ['all'],
    maxDistance: 50,
    onlyVerified: false,
    onlyPremium: false
  })

  // Fetch browseable profiles
  const { data: profiles = [], isLoading, refetch } = useQuery<BrowseProfile[]>({
    queryKey: ['/api/browse/profiles', filters],
    enabled: !!user,
    staleTime: 30000 // Cache for 30 seconds
  })

  // Like profile mutation
  const likeProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return apiRequest('/api/browse/like', {
        method: 'POST',
        body: JSON.stringify({ likedProfileId: profileId })
      })
    },
    onSuccess: (data: any) => {
      if (data?.isMatch) {
        toast({
          title: 'It\'s a Match! 🎉',
          description: 'You can now start chatting!',
          duration: 5000
        })
      } else {
        toast({ title: 'Profile liked!' })
      }
      handleNextProfile()
    },
    onError: (error: any) => {
      toast({
        title: 'Error liking profile',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    }
  })

  // Pass/skip profile mutation
  const passProfileMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return apiRequest('/api/browse/pass', {
        method: 'POST',
        body: JSON.stringify({ passedProfileId: profileId })
      })
    },
    onSuccess: () => {
      handleNextProfile()
    }
  })

  const currentProfile = profiles[currentProfileIndex]

  const handleLike = () => {
    if (currentProfile) {
      likeProfileMutation.mutate(currentProfile.id)
    }
  }

  const handlePass = () => {
    if (currentProfile) {
      passProfileMutation.mutate(currentProfile.id)
    }
  }

  const handleNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(prev => prev + 1)
    } else {
      // Refresh profiles when we reach the end
      refetch()
      setCurrentProfileIndex(0)
    }
  }

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentProfileIndex(0) // Reset to first profile
  }

  const getProfilePhoto = (profile: BrowseProfile) => {
    const mainPhoto = profile.profilePhotos.find(p => p.isProfile) || profile.profilePhotos[0]
    return mainPhoto?.url || '/placeholder-avatar.jpg'
  }

  const calculateAge = (birthDate: number) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to browse profiles.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen bg-transparent">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white" data-testid="text-browse-title">
            Discover
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-pink-400 hover:bg-pink-500/10"
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-black/90 border-b border-pink-500/30 p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Age Range</Label>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-white/60">{filters.minAge}</span>
                <Slider
                  value={[filters.minAge, filters.maxAge]}
                  onValueChange={([min, max]) => handleFilterChange({ minAge: min, maxAge: max })}
                  min={18}
                  max={80}
                  step={1}
                  className="flex-1"
                />
                <span className="text-sm text-white/60">{filters.maxAge}</span>
              </div>
            </div>
            
            <div>
              <Label className="text-white/70">Max Distance (km)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={([distance]) => handleFilterChange({ maxDistance: distance })}
                  min={5}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm text-white/60">{filters.maxDistance}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/70">Account Type</Label>
              <Select 
                value={filters.accountTypes[0] || 'all'} 
                onValueChange={(value) => handleFilterChange({ accountTypes: [value] })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Singles</SelectItem>
                  <SelectItem value="couple">Couples</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Verified Only</Label>
                <Switch
                  checked={filters.onlyVerified}
                  onCheckedChange={(checked) => handleFilterChange({ onlyVerified: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white/70">Premium Only</Label>
                <Switch
                  checked={filters.onlyPremium}
                  onCheckedChange={(checked) => handleFilterChange({ onlyPremium: checked })}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Cards */}
      <div className="p-4 pb-20">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-white/60">Finding profiles for you...</p>
          </div>
        ) : !currentProfile ? (
          <Card className="bg-card/50 border-pink-500/20">
            <CardContent className="text-center py-8">
              <Eye className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No more profiles</h3>
              <p className="text-white/60 mb-4">
                Try adjusting your filters or check back later for new members!
              </p>
              <Button
                onClick={() => refetch()}
                className="bg-pink-600 hover:bg-pink-700"
                data-testid="button-refresh-profiles"
              >
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Profile Counter */}
            <div className="text-center">
              <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                {currentProfileIndex + 1} of {profiles.length}
              </Badge>
            </div>

            {/* Main Profile Card */}
            <Card className="bg-card/50 border-pink-500/20 overflow-hidden" data-testid={`card-profile-${currentProfile.id}`}>
              <div className="relative">
                <img
                  src={getProfilePhoto(currentProfile)}
                  alt={currentProfile.displayName}
                  className="w-full h-96 object-cover"
                />
                
                {/* Profile badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {currentProfile.verificationStatus === 'verified' && (
                    <Badge className="bg-blue-500/90 text-white border-0">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {currentProfile.membershipType === 'premium' && (
                    <Badge className="bg-yellow-500/90 text-black border-0">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>

                {/* Distance badge */}
                {currentProfile.distance && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-black/70 text-white border-0">
                      <MapPin className="h-3 w-3 mr-1" />
                      {currentProfile.distance}km away
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white" data-testid={`text-profile-name-${currentProfile.id}`}>
                      {currentProfile.displayName}
                    </h2>
                    <div className="flex items-center gap-2 text-white/60">
                      <span>{currentProfile.age || 'Age not specified'}</span>
                      <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                        {currentProfile.accountType}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60"
                    data-testid="button-profile-options"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Location */}
                {(currentProfile.city || currentProfile.state) && (
                  <div className="flex items-center text-white/60">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {[currentProfile.city, currentProfile.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {/* Bio */}
                {currentProfile.bio && (
                  <p className="text-white/80" data-testid={`text-profile-bio-${currentProfile.id}`}>
                    {currentProfile.bio}
                  </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{currentProfile.profilePhotos.length} photos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-6">
              <Button
                variant="outline"
                size="lg"
                onClick={handlePass}
                disabled={passProfileMutation.isPending}
                className="h-16 w-16 rounded-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                data-testid="button-pass-profile"
              >
                <X className="h-6 w-6" />
              </Button>
              
              <Button
                size="lg"
                onClick={handleLike}
                disabled={likeProfileMutation.isPending}
                className="h-16 w-16 rounded-full bg-pink-600 hover:bg-pink-700 text-white"
                data-testid="button-like-profile"
              >
                <Heart className="h-6 w-6" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}