import { useState, useEffect } from 'react'
import Support from './Support'
import { useAuth } from '@/contexts/AuthContext'
import { useLocation } from 'wouter'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { storage, supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

import {
  User,
  Settings,
  Edit3,
  Heart,
  Shield,
  HelpCircle,
  LogOut,
  Camera,
  MapPin,
  Mail,
  Crown,
  Sparkles,
  ChevronRight,
  Verified,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Lock,
  Trash2,
  Download,
  CreditCard
} from 'lucide-react'

interface ProfileData {
  id: string
  userId: string
  displayName: string
  age: number
  bio: string
  city: string
  state: string
  membershipType: 'free' | 'premium' | 'vip' | 'elite'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  isVisible: boolean
  seekingAccountTypes?: string[]
  ageRangeMin?: number
  ageRangeMax?: number
  photos: Array<{
    id: string
    url: string
    isProfile: boolean
    order: number
  }>
  interests?: Array<{ id: string; name: string; customInterest?: string }>
  boundaries?: { customBoundaries: string }
  safeSex?: {
    condomUse: boolean
    regularTesting: boolean
    customPractices: string
  }
}

interface UserSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  profileVisible: boolean
  showOnlineStatus: boolean
  privateMode: boolean
  readReceipts: boolean
}

// Helper function to compress and convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('File too large. Please choose an image under 2MB.'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions (max 800x800)
      let { width, height } = img
      const maxSize = 800

      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)

      // Convert to base64 with compression
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '')
          reader.onerror = reject
          reader.readAsDataURL(blob)
        } else {
          reject(new Error('Failed to compress image'))
        }
      }, 'image/jpeg', 0.8) // 80% quality
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export default function Profile() {
  const { user, signOut } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [, setLocation] = useLocation()
  const [selectedSection, setSelectedSection] = useState<string>('account')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editField, setEditField] = useState('')
  const [editValue, setEditValue] = useState('')
  const [lifestyleInterests, setLifestyleInterests] = useState<string[]>([])
  const [boundaries, setBoundaries] = useState({ hardLimits: '', softLimits: '' })
  const [safeSexPractices, setSafeSexPractices] = useState({
    protectionRequired: false,
    recentTesting: false,
    openCommunication: false
  })
  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    profileVisible: true,
    showOnlineStatus: true,
    privateMode: false,
    readReceipts: true
  })
  
  const [datingPreferences, setDatingPreferences] = useState({
    seekingAccountTypes: [] as string[],
    seekingGenders: [] as string[],
    ageRangeMin: 18,
    ageRangeMax: 65,
    maxDistance: 25,
    showOnlyVerified: false,
    showOnlyWithPhotos: true,
    requiredInterests: [] as string[],
    excludedInterests: [] as string[]
  })

  // Fetch user profile with real-time updates
  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ['/api/profile'],
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds for real-time updates
    staleTime: 0 // Always consider data stale for immediate updates
  })

  // Update settings when profile data loads
  useEffect(() => {
    if (profile) {
      setSettings(prev => ({
        ...prev,
        profileVisible: profile.isVisible || false,
        // Add other profile-based settings here as they become available
      }))

      // Load dating preferences
      setDatingPreferences(prev => ({
        ...prev,
        seekingAccountTypes: profile.seekingAccountTypes || [],
        seekingGenders: profile.seekingGenders || [],
        ageRangeMin: profile.ageRangeMin || 18,
        ageRangeMax: profile.ageRangeMax || 65,
        maxDistance: profile.maxDistance || 25,
        showOnlyVerified: profile.showOnlyVerified || false,
        showOnlyWithPhotos: profile.showOnlyWithPhotos !== false,
        requiredInterests: profile.requiredInterests || [],
        excludedInterests: profile.excludedInterests || []
      }))

      // Load lifestyle interests
      if (profile.interests) {
        const interestNames = profile.interests.map((interest: any) => interest.name || interest.customInterest).filter(Boolean)
        setLifestyleInterests(interestNames)
      }

      // Load boundaries
      if (profile.boundaries) {
        const boundariesText = profile.boundaries.customBoundaries || ''
        const hardMatch = boundariesText.match(/Hard limits: ([^.]+)/)
        const softMatch = boundariesText.match(/Soft limits: ([^.]+)/)
        setBoundaries({
          hardLimits: hardMatch ? hardMatch[1].trim() : '',
          softLimits: softMatch ? softMatch[1].trim() : ''
        })
      }

      // Load safe sex practices
      if (profile.safeSex) {
        setSafeSexPractices({
          protectionRequired: profile.safeSex.condomUse || false,
          recentTesting: profile.safeSex.regularTesting || false,
          openCommunication: profile.safeSex.customPractices?.includes('Open communication about health status') || false
        })
      }
    }
  }, [profile])

  // Real-time subscription for profile changes
  useEffect(() => {
    if (!user || !profile) return

    console.log('Setting up real-time subscription for profile changes')

    // Subscribe to profile table changes
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Profile change detected:', payload)
          // Invalidate and refetch profile data
          queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
        }
      )
      .subscribe()

    // Subscribe to profile photos changes  
    const photosSubscription = supabase
      .channel('photos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profile_photos',
          filter: `profile_id=eq.${profile.id}`
        },
        (payload) => {
          console.log('Profile photos change detected:', payload)
          // Invalidate and refetch profile data
          queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up real-time subscriptions')
      profileSubscription.unsubscribe()
      photosSubscription.unsubscribe()
    }
  }, [user, profile, queryClient])

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<UserSettings>) => {
      return apiRequest('/api/profile/settings', {
        method: 'PATCH',
        body: newSettings
      })
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return apiRequest('/api/profile', {
        method: 'PATCH',
        body: profileData
      })
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
      setShowEditModal(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: any) => {
      return apiRequest('/api/profile/preferences', {
        method: 'PATCH',
        body: preferencesData
      })
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your dating preferences have been saved successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
      setSelectedSection('preferences')
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Update lifestyle preferences mutation
  const updateLifestyleMutation = useMutation({
    mutationFn: async (lifestyleData: any) => {
      // Save interests
      if (lifestyleData.interests) {
        await apiRequest('/api/profile/interests', {
          method: 'POST',
          body: { interests: lifestyleData.interests }
        })
      }

      // Save boundaries
      if (lifestyleData.boundaries) {
        await apiRequest('/api/profile/boundaries', {
          method: 'POST',
          body: lifestyleData.boundaries
        })
      }

      // Save safe sex practices
      if (lifestyleData.safeSex) {
        await apiRequest('/api/profile/safe-sex', {
          method: 'POST',
          body: lifestyleData.safeSex
        })
      }

      return { success: true }
    },
    onSuccess: () => {
      toast({
        title: "Lifestyle Preferences Updated",
        description: "Your lifestyle preferences have been saved successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
      setSelectedSection('preferences')
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update lifestyle preferences. Please try again.",
        variant: "destructive"
      })
    }
  })

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/auth/delete-account', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })
      signOut()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive"
      })
    }
  })

  const handleLogout = async () => {
    await signOut()
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    })
  }

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    updateSettingsMutation.mutate({ [key]: value })
  }

  const handleEditProfile = (field: string, currentValue: string) => {
    setEditField(field)
    setEditValue(currentValue || '')
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!editField || !editValue.trim()) return

    updateProfileMutation.mutate({
      [editField]: editValue.trim()
    })
  }

  const menuSections = [
    {
      id: 'account',
      title: 'My Account',
      icon: User,
      description: 'Basic account information and membership'
    },
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: Edit3,
      description: 'Photos, bio, and personal information'
    },
    {
      id: 'preferences',
      title: 'Dating Preferences',
      icon: Heart,
      description: 'Dating preferences and matching settings'
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Interests',
      icon: Settings,
      description: 'Interests, boundaries, and safe practices'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: Settings,
      description: 'Privacy, notifications, and app preferences'
    },
    {
      id: 'support',
      title: 'Support',
      icon: HelpCircle,
      description: 'Help center, safety, and report issues'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Profile</h1>
        <p className="text-white/70 text-sm">Manage your account and preferences</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">

        {selectedSection === 'account' && (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profile?.photos?.find(p => p.isProfile)?.url} />
                      <AvatarFallback className="bg-pink-500/20 text-pink-400 text-xl">
                        {profile?.displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {profile?.verificationStatus === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <Verified className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-xl font-semibold text-white">
                        {profile?.displayName || 'Complete your profile'}
                      </h2>
                      {profile?.membershipType === 'premium' && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                          <Crown className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                      {profile?.membershipType === 'vip' && (
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                          <Crown className="h-3 w-3 mr-1" />
                          VIP
                        </Badge>
                      )}
                      {profile?.membershipType === 'elite' && (
                        <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/50">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Elite
                        </Badge>
                      )}
                    </div>
                    <div className="text-white/70 text-sm space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{user?.email}</span>
                      </div>
                      {profile?.city && profile?.state && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.city}, {profile.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSection('edit-profile')}
                    className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                    data-testid="button-edit-profile"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-black/50 border-pink-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-pink-400 mb-1">
                    {profile?.photos?.length || 0}
                  </div>
                  <div className="text-white/70 text-sm">Photos</div>
                </CardContent>
              </Card>
              <Card className="bg-black/50 border-pink-500/30">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">
                    {profile?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                  </div>
                  <div className="text-white/70 text-sm">Status</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={() => setSelectedSection('edit-profile')}
                  data-testid="button-quick-edit-profile"
                >
                  <Edit3 className="h-4 w-4 mr-3" />
                  Edit Profile
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={() => setSelectedSection('preferences')}
                  data-testid="button-quick-preferences"
                >
                  <Heart className="h-4 w-4 mr-3" />
                  Dating Preferences
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={() => setLocation('/membership')}
                  data-testid="button-upgrade-membership"
                >
                  <CreditCard className="h-4 w-4 mr-3" />
                  Upgrade Membership
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={() => setSelectedSection('settings')}
                  data-testid="button-quick-settings"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Privacy & Settings
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={() => setSelectedSection('support')}
                  data-testid="button-quick-support"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Support & Help
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSection === 'edit-preferences' && (
          <div className="space-y-6" data-testid="section-edit-preferences">
            {/* Edit Dating Preferences */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-400" />
                  Edit Dating Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Looking For - Account Types */}
                <div>
                  <Label className="text-white font-medium mb-3 block">Looking For (Account Types)</Label>
                  <div className="space-y-2">
                    {['single men', 'single women', 'couples', 'groups'].map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={`seeking-${option.replace(' ', '-')}`}
                          checked={datingPreferences.seekingAccountTypes.includes(option)}
                          onCheckedChange={(checked) => {
                            setDatingPreferences(prev => ({
                              ...prev,
                              seekingAccountTypes: checked
                                ? [...prev.seekingAccountTypes, option]
                                : prev.seekingAccountTypes.filter(t => t !== option)
                            }))
                          }}
                          className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                          data-testid={`checkbox-seeking-${option.replace(' ', '-')}`}
                        />
                        <Label htmlFor={`seeking-${option.replace(' ', '-')}`} className="text-white/80">
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Looking For - Genders */}
                <div>
                  <Label className="text-white font-medium mb-3 block">Interested in (Gender)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {['male', 'female', 'non-binary', 'transgender', 'any'].map((gender) => (
                      <div key={gender} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gender-${gender}`}
                          checked={datingPreferences.seekingGenders.includes(gender)}
                          onCheckedChange={(checked) => {
                            setDatingPreferences(prev => ({
                              ...prev,
                              seekingGenders: checked
                                ? [...prev.seekingGenders, gender]
                                : prev.seekingGenders.filter(g => g !== gender)
                            }))
                          }}
                          className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                        />
                        <Label htmlFor={`gender-${gender}`} className="text-white/80">
                          {gender.charAt(0).toUpperCase() + gender.slice(1)}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Age Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white font-medium mb-2 block">Min Age</Label>
                    <Input
                      type="number"
                      min="18"
                      max="100"
                      value={datingPreferences.ageRangeMin}
                      onChange={(e) => {
                        setDatingPreferences(prev => ({
                          ...prev,
                          ageRangeMin: parseInt(e.target.value) || 18
                        }))
                      }}
                      className="bg-black/50 border-pink-500/30 text-white"
                      data-testid="input-age-min"
                    />
                  </div>
                  <div>
                    <Label className="text-white font-medium mb-2 block">Max Age</Label>
                    <Input
                      type="number"
                      min="18"
                      max="100"
                      value={datingPreferences.ageRangeMax}
                      onChange={(e) => {
                        setDatingPreferences(prev => ({
                          ...prev,
                          ageRangeMax: parseInt(e.target.value) || 65
                        }))
                      }}
                      className="bg-black/50 border-pink-500/30 text-white"
                      data-testid="input-age-max"
                    />
                  </div>
                </div>

                {/* Max Distance */}
                <div>
                  <Label className="text-white font-medium mb-2 block">Max Distance (miles)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="500"
                    value={datingPreferences.maxDistance}
                    onChange={(e) => {
                      setDatingPreferences(prev => ({
                        ...prev,
                        maxDistance: parseInt(e.target.value) || 25
                      }))
                    }}
                    className="bg-black/50 border-pink-500/30 text-white"
                    data-testid="input-max-distance"
                  />
                </div>

                {/* Filter Options */}
                <div>
                  <Label className="text-white font-medium mb-3 block">Filter Preferences</Label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Show Only Verified Users</div>
                        <div className="text-white/70 text-sm">Only show profiles with verified status</div>
                      </div>
                      <Switch
                        checked={datingPreferences.showOnlyVerified}
                        onCheckedChange={(checked) => {
                          setDatingPreferences(prev => ({
                            ...prev,
                            showOnlyVerified: checked
                          }))
                        }}
                        data-testid="switch-verified-only"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">Show Only Users with Photos</div>
                        <div className="text-white/70 text-sm">Only show profiles with at least one photo</div>
                      </div>
                      <Switch
                        checked={datingPreferences.showOnlyWithPhotos}
                        onCheckedChange={(checked) => {
                          setDatingPreferences(prev => ({
                            ...prev,
                            showOnlyWithPhotos: checked
                          }))
                        }}
                        data-testid="switch-photos-only"
                      />
                    </div>
                  </div>
                </div>

                {/* Interest Filters */}
                <div>
                  <Label className="text-white font-medium mb-3 block">Interest Filters</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white/80 mb-2 block">Must Have Interests (select interests they must have)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {[
                          'BDSM', 'Threesomes', 'Role Play', 'Voyeurism',
                          'Exhibitionism', 'Swinging', 'Polyamory', 'Tantric',
                          'Fetish Play', 'Dom/Sub', 'Sensual Massage'
                        ].map((interest) => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              checked={datingPreferences.requiredInterests.includes(interest)}
                              onCheckedChange={(checked) => {
                                setDatingPreferences(prev => ({
                                  ...prev,
                                  requiredInterests: checked
                                    ? [...prev.requiredInterests, interest]
                                    : prev.requiredInterests.filter(i => i !== interest)
                                }))
                              }}
                              className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                            />
                            <Label htmlFor={`required-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-white/80 text-sm">
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-white/80 mb-2 block">Exclude Interests (hide profiles with these interests)</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {[
                          'BDSM', 'Threesomes', 'Role Play', 'Voyeurism',
                          'Exhibitionism', 'Swinging', 'Polyamory', 'Tantric',
                          'Fetish Play', 'Dom/Sub', 'Sensual Massage'
                        ].map((interest) => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox
                              id={`excluded-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                              checked={datingPreferences.excludedInterests.includes(interest)}
                              onCheckedChange={(checked) => {
                                setDatingPreferences(prev => ({
                                  ...prev,
                                  excludedInterests: checked
                                    ? [...prev.excludedInterests, interest]
                                    : prev.excludedInterests.filter(i => i !== interest)
                                }))
                              }}
                              className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                            />
                            <Label htmlFor={`excluded-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-white/80 text-sm">
                              {interest}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      const preferencesData = {
                        seekingAccountTypes: datingPreferences.seekingAccountTypes,
                        seekingGenders: datingPreferences.seekingGenders,
                        ageRangeMin: datingPreferences.ageRangeMin,
                        ageRangeMax: datingPreferences.ageRangeMax,
                        maxDistance: datingPreferences.maxDistance,
                        showOnlyVerified: datingPreferences.showOnlyVerified,
                        showOnlyWithPhotos: datingPreferences.showOnlyWithPhotos,
                        requiredInterests: datingPreferences.requiredInterests,
                        excludedInterests: datingPreferences.excludedInterests
                      }

                      updatePreferencesMutation.mutate(preferencesData)
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    data-testid="button-save-preferences"
                    disabled={updatePreferencesMutation.isPending}
                  >
                    {updatePreferencesMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSection('preferences')}
                    className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                    data-testid="button-cancel-preferences"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSection === 'lifestyle' && (
          <div className="space-y-6" data-testid="section-edit-lifestyle">
            {/* Edit Lifestyle Preferences */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-400" />
                  Edit Lifestyle Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interests Section */}
                <div>
                  <Label className="text-white font-medium mb-3 block text-lg">Interests & Kinks</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'BDSM', 'Threesomes', 'Role Play', 'Voyeurism',
                      'Exhibitionism', 'Swinging', 'Polyamory', 'Tantric',
                      'Fetish Play', 'Dom/Sub', 'Sensual Massage', 'Other'
                    ].map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox
                          id={`interest-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          checked={lifestyleInterests.includes(interest)}
                          onCheckedChange={(checked) => {
                            setLifestyleInterests(prev =>
                              checked
                                ? [...prev, interest]
                                : prev.filter(i => i !== interest)
                            )
                          }}
                          className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                          data-testid={`checkbox-interest-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                        />
                        <Label htmlFor={`interest-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="text-white/80 text-sm">
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="bg-pink-500/30" />

                {/* Boundaries Section */}
                <div>
                  <Label className="text-white font-medium mb-3 block text-lg">Boundaries & Limits</Label>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-white/80 mb-2 block">Hard Limits (Never)</Label>
                      <Input
                        placeholder="e.g., No pain, No public play..."
                        value={boundaries.hardLimits}
                        onChange={(e) => setBoundaries(prev => ({ ...prev, hardLimits: e.target.value }))}
                        className="bg-black/50 border-pink-500/30 text-white"
                        data-testid="input-hard-limits"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80 mb-2 block">Soft Limits (Maybe/Discuss)</Label>
                      <Input
                        placeholder="e.g., Light bondage, Role reversal..."
                        value={boundaries.softLimits}
                        onChange={(e) => setBoundaries(prev => ({ ...prev, softLimits: e.target.value }))}
                        className="bg-black/50 border-pink-500/30 text-white"
                        data-testid="input-soft-limits"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="bg-pink-500/30" />

                {/* Safe Sex Practices */}
                <div>
                  <Label className="text-white font-medium mb-3 block text-lg">Safe Sex Practices</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="protection-required"
                        checked={safeSexPractices.protectionRequired}
                        onCheckedChange={(checked) => setSafeSexPractices(prev => ({ ...prev, protectionRequired: !!checked }))}
                        className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                        data-testid="checkbox-protection-required"
                      />
                      <Label htmlFor="protection-required" className="text-white/80">
                        Protection always required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recent-testing"
                        checked={safeSexPractices.recentTesting}
                        onCheckedChange={(checked) => setSafeSexPractices(prev => ({ ...prev, recentTesting: !!checked }))}
                        className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                        data-testid="checkbox-recent-testing"
                      />
                      <Label htmlFor="recent-testing" className="text-white/80">
                        Recent STD testing required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="open-communication"
                        checked={safeSexPractices.openCommunication}
                        onCheckedChange={(checked) => setSafeSexPractices(prev => ({ ...prev, openCommunication: !!checked }))}
                        className="border-pink-500/50 data-[state=checked]:bg-pink-500"
                        data-testid="checkbox-open-communication"
                      />
                      <Label htmlFor="open-communication" className="text-white/80">
                        Open communication about health status
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    onClick={() => {
                      const lifestyleData = {
                        interests: lifestyleInterests.map(interest => ({ name: interest })),
                        boundaries: {
                          customBoundaries: boundaries.hardLimits || boundaries.softLimits
                            ? `Hard limits: ${boundaries.hardLimits}. Soft limits: ${boundaries.softLimits}`
                            : ''
                        },
                        safeSex: {
                          condomUse: safeSexPractices.protectionRequired,
                          regularTesting: safeSexPractices.recentTesting,
                          customPractices: safeSexPractices.openCommunication ? 'Open communication about health status' : ''
                        }
                      }

                      updateLifestyleMutation.mutate(lifestyleData)
                    }}
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    data-testid="button-save-lifestyle"
                    disabled={updateLifestyleMutation.isPending}
                  >
                    {updateLifestyleMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedSection('account')}
                    className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                    data-testid="button-cancel-lifestyle"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSection === 'support' && (
          <Support onBack={() => setSelectedSection('account')} />
        )}

        {selectedSection === 'settings' && (
          <div className="space-y-6">
            {/* Privacy Settings */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-pink-400" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Profile Visibility</div>
                    <div className="text-white/70 text-sm">Show your profile to other users</div>
                  </div>
                  <Switch
                    checked={settings.profileVisible}
                    onCheckedChange={(checked) => handleSettingChange('profileVisible', checked)}
                    data-testid="switch-profile-visibility"
                  />
                </div>
                <Separator className="bg-pink-500/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Show Online Status</div>
                    <div className="text-white/70 text-sm">Let others see when you're online</div>
                  </div>
                  <Switch
                    checked={settings.showOnlineStatus}
                    onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
                    data-testid="switch-online-status"
                  />
                </div>
                <Separator className="bg-pink-500/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Private Mode</div>
                    <div className="text-white/70 text-sm">Only show profile to people you've liked</div>
                  </div>
                  <Switch
                    checked={settings.privateMode}
                    onCheckedChange={(checked) => handleSettingChange('privateMode', checked)}
                    data-testid="switch-private-mode"
                  />
                </div>
                <Separator className="bg-pink-500/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Read Receipts</div>
                    <div className="text-white/70 text-sm">Show when you've read messages</div>
                  </div>
                  <Switch
                    checked={settings.readReceipts}
                    onCheckedChange={(checked) => handleSettingChange('readReceipts', checked)}
                    data-testid="switch-read-receipts"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-pink-400" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Email Notifications</div>
                    <div className="text-white/70 text-sm">Receive updates via email</div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    data-testid="switch-email-notifications"
                  />
                </div>
                <Separator className="bg-pink-500/30" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Push Notifications</div>
                    <div className="text-white/70 text-sm">Receive push notifications on your device</div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    data-testid="switch-push-notifications"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Management */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-pink-400" />
                  Account Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={() => {
                    // For now, just show a message - in a real app this would redirect to password change
                    toast({
                      title: "Change Password",
                      description: "This feature will be available in a future update.",
                    })
                  }}
                  data-testid="button-change-password"
                >
                  <Lock className="h-4 w-4 mr-3" />
                  Change Password
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  onClick={async () => {
                    try {
                      // Download user data as JSON
                      const response = await apiRequest('/api/profile/export', {
                        method: 'GET'
                      })

                      const blob = new Blob([JSON.stringify(response, null, 2)], {
                        type: 'application/json'
                      })
                      const url = window.URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `spice-profile-data-${new Date().toISOString().split('T')[0]}.json`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      window.URL.revokeObjectURL(url)

                      toast({
                        title: "Data Downloaded",
                        description: "Your profile data has been downloaded successfully.",
                      })
                    } catch (error) {
                      toast({
                        title: "Download Failed",
                        description: "Failed to download your data. Please try again.",
                        variant: "destructive"
                      })
                    }
                  }}
                  data-testid="button-download-data"
                >
                  <Download className="h-4 w-4 mr-3" />
                  Download My Data
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
                      deleteAccountMutation.mutate()
                    }
                  }}
                  data-testid="button-delete-account"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete Account
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSection === 'edit-profile' && (
          <div className="space-y-6">
            {/* Profile Photos */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-pink-400" />
                  Profile Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {profile?.photos?.map((photo, index) => (
                    <div key={photo.id} className="relative aspect-square">
                      <img
                        src={photo.url}
                        alt={`Profile photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {photo.isProfile && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-pink-500/20 text-pink-400 border-pink-500/50 text-xs">
                            Main
                          </Badge>
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        onClick={async () => {
                          if (confirm('Delete this photo?')) {
                            try {
                              await apiRequest(`/api/profile/photos/${photo.id}`, {
                                method: 'DELETE'
                              })
                              toast({
                                title: "Photo Deleted",
                                description: "Photo has been removed from your profile.",
                              })
                              queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
                            } catch (error) {
                              toast({
                                title: "Error",
                                description: "Failed to delete photo. Please try again.",
                                variant: "destructive"
                              })
                            }
                          }
                        }}
                        data-testid={`button-delete-photo-${index}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {(!profile?.photos || profile.photos.length < 5) && (
                    <div className="aspect-square border-2 border-dashed border-pink-500/30 rounded-lg flex items-center justify-center">
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Button
                          variant="ghost"
                          className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                          data-testid="button-add-photo"
                          asChild
                        >
                          <div>
                            <Camera className="h-6 w-6" />
                            <input
                              id="photo-upload"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = e.target.files
                                if (!files || files.length === 0) return

                                try {
                                  if (!user) {
                                    throw new Error('User not authenticated')
                                  }

                                  for (const file of Array.from(files)) {
                                    // Upload directly to our backend
                                    const uploadResponse = await apiRequest('/api/profile/photos', {
                                      method: 'POST',
                                      body: {
                                        url: `data:${file.type};base64,${await fileToBase64(file)}`,
                                        filename: file.name,
                                        isProfile: (profile?.photos?.length || 0) === 0,
                                        order: profile?.photos?.length || 0
                                      }
                                    })

                                    console.log('Photo uploaded successfully:', uploadResponse)
                                  }

                                  toast({
                                    title: "Photos Uploaded",
                                    description: `${files.length} photo(s) uploaded successfully.`,
                                  })
                                  queryClient.invalidateQueries({ queryKey: ['/api/profile'] })
                                } catch (error) {
                                  console.error('Upload error:', error)
                                  toast({
                                    title: "Upload Failed",
                                    description: error instanceof Error ? error.message : "Failed to upload photos. Please try again.",
                                    variant: "destructive"
                                  })
                                }
                                e.target.value = '' // Reset input
                              }}
                            />
                          </div>
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
                <p className="text-white/70 text-sm">
                  Add up to 5 photos. Your first photo will be your main profile picture.
                </p>
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2 text-pink-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-white font-medium mb-1 block">Display Name</label>
                    <div className="text-white/70">{profile?.displayName || 'Not set'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProfile('displayName', profile?.displayName || '')}
                    className="text-pink-400 hover:bg-pink-500/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-white font-medium mb-1 block">Age</label>
                    <div className="text-white/70">{profile?.age || 'Not set'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProfile('age', profile?.age?.toString() || '')}
                    className="text-pink-400 hover:bg-pink-500/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-white font-medium mb-1 block">City</label>
                    <div className="text-white/70">{profile?.city || 'Not set'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProfile('city', profile?.city || '')}
                    className="text-pink-400 hover:bg-pink-500/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="text-white font-medium mb-1 block">State</label>
                    <div className="text-white/70">{profile?.state || 'Not set'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProfile('state', profile?.state || '')}
                    className="text-pink-400 hover:bg-pink-500/10"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <label className="text-white font-medium mb-1 block">Bio</label>
                    <div className="text-white/70">{profile?.bio || 'Tell us about yourself...'}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditProfile('bio', profile?.bio || '')}
                    className="text-pink-400 hover:bg-pink-500/10 ml-2"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-pink-400" />
                  Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">Profile Verification</div>
                    <div className="text-white/70 text-sm">
                      {profile?.verificationStatus === 'verified'
                        ? 'Your profile is verified'
                        : profile?.verificationStatus === 'pending'
                        ? 'Verification pending review'
                        : 'Get verified to boost your profile'
                      }
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {profile?.verificationStatus === 'verified' ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                        <Verified className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : profile?.verificationStatus === 'pending' ? (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                        Pending
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                        data-testid="button-start-verification"
                      >
                        Get Verified
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSection === 'preferences' && (
          <div className="space-y-6">
            {/* Dating Preferences */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-pink-400" />
                  Dating Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Looking For (Account Types)</label>
                  <div className="text-white/70">
                    {datingPreferences.seekingAccountTypes.length > 0 
                      ? datingPreferences.seekingAccountTypes.join(', ')
                      : 'Not specified'
                    }
                  </div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Interested in (Gender)</label>
                  <div className="text-white/70">
                    {datingPreferences.seekingGenders.length > 0 
                      ? datingPreferences.seekingGenders.join(', ')
                      : 'Any'
                    }
                  </div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Age Range</label>
                  <div className="text-white/70">
                    {datingPreferences.ageRangeMin} - {datingPreferences.ageRangeMax} years
                  </div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Max Distance</label>
                  <div className="text-white/70">Within {profile?.maxDistance || datingPreferences.maxDistance} miles</div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Filters</label>
                  <div className="text-white/70 space-y-1">
                    <div>Verified only: {(profile?.showOnlyVerified !== undefined ? profile.showOnlyVerified : datingPreferences.showOnlyVerified) ? 'Yes' : 'No'}</div>
                    <div>Photos required: {(profile?.showOnlyWithPhotos !== undefined ? profile.showOnlyWithPhotos : datingPreferences.showOnlyWithPhotos) ? 'Yes' : 'No'}</div>
                    {(profile?.requiredInterests || datingPreferences.requiredInterests).length > 0 && (
                      <div>Must have: {(profile?.requiredInterests || datingPreferences.requiredInterests).join(', ')}</div>
                    )}
                    {(profile?.excludedInterests || datingPreferences.excludedInterests).length > 0 && (
                      <div>Exclude: {(profile?.excludedInterests || datingPreferences.excludedInterests).join(', ')}</div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  onClick={() => {
                    setSelectedSection('edit-preferences');
                  }}
                  data-testid="button-edit-preferences"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Lifestyle Interests */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white">Lifestyle Interests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white font-medium mb-2 block">Interests</label>
                  <div className="text-white/70">
                    {lifestyleInterests.length > 0 ? lifestyleInterests.join(', ') : 'Not set'}
                  </div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Boundaries</label>
                  <div className="text-white/70">
                    {(boundaries.hardLimits || boundaries.softLimits)
                      ? `Hard: ${boundaries.hardLimits || 'None'}. Soft: ${boundaries.softLimits || 'None'}`
                      : 'Not set'
                    }
                  </div>
                </div>
                <div>
                  <label className="text-white font-medium mb-2 block">Safe Sex Practices</label>
                  <div className="text-white/70">
                    {(() => {
                      const parts = [];
                      if (safeSexPractices.protectionRequired) parts.push('Protection required');
                      if (safeSexPractices.recentTesting) parts.push('Recent testing');
                      if (safeSexPractices.openCommunication) parts.push('Open communication');
                      return parts.length > 0 ? parts.join(', ') : 'Not set';
                    })()}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  onClick={() => setSelectedSection('lifestyle')}
                  data-testid="button-edit-lifestyle"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Lifestyle
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedSection === 'support' && (
          <div className="space-y-6">
            {/* Help & Support */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-pink-400" />
                  Help & Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  data-testid="button-faq"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Frequently Asked Questions
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  data-testid="button-safety-tips"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Safety Tips
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  data-testid="button-contact-support"
                >
                  <Mail className="h-4 w-4 mr-3" />
                  Contact Support
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-white hover:bg-pink-500/10"
                  data-testid="button-report-issue"
                >
                  <Shield className="h-4 w-4 mr-3" />
                  Report a User or Issue
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Community Guidelines */}
            <Card className="bg-black/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-white">Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-white/70 text-sm space-y-2">
                <p>SPICE is committed to creating a safe, respectful environment for all members:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Treat all members with respect and kindness</li>
                  <li>Use recent, authentic photos of yourself</li>
                  <li>Be honest about your intentions and boundaries</li>
                  <li>Respect consent and communication preferences</li>
                  <li>Report any inappropriate behavior immediately</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Menu Navigation */}
        {selectedSection === 'account' && (
          <div className="space-y-4 mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Settings & Support</h3>
            {menuSections.slice(1).map((section) => {
              const Icon = section.icon
              return (
                <Card
                  key={section.id}
                  className="bg-black/50 border-pink-500/30 cursor-pointer hover:bg-pink-500/5 transition-colors"
                  onClick={() => setSelectedSection(section.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-pink-500/20">
                        <Icon className="h-5 w-5 text-pink-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{section.title}</div>
                        <div className="text-white/70 text-sm">{section.description}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/50" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Navigation Bar for non-account sections */}
        {selectedSection !== 'account' && (
          <div className="fixed bottom-20 left-4 right-4 z-30">
            <Card className="bg-black/90 border-pink-500/30 backdrop-blur-sm">
              <CardContent className="p-2">
                <div className="flex justify-between items-center">
                  {menuSections.map((section) => {
                    const Icon = section.icon
                    const isActive = selectedSection === section.id
                    return (
                      <Button
                        key={section.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSection(section.id)}
                        className={`flex-1 ${
                          isActive
                            ? 'text-pink-400 bg-pink-500/20'
                            : 'text-white/70 hover:text-white hover:bg-pink-500/10'
                        }`}
                        data-testid={`button-nav-${section.id}`}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logout Button - With extra bottom padding to avoid bottom nav */}
        <div className="mt-8 pb-32">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-black/90 border-pink-500/30 text-white">
          <DialogHeader>
            <DialogTitle>Edit {editField?.charAt(0).toUpperCase() + editField?.slice(1)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editField === 'bio' ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="Tell us about yourself..."
                className="bg-black/50 border-pink-500/30 text-white rounded-md p-3 w-full resize-none"
                rows={4}
              />
            ) : (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder={`Enter your ${editField}`}
                className="bg-black/50 border-pink-500/30 text-white"
                type={editField === 'age' ? 'number' : 'text'}
              />
            )}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="bg-pink-500 hover:bg-pink-600 text-white"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}