import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { queryClient, apiRequest } from '@/lib/queryClient'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { insertCommunityPostSchema, type InsertCommunityPost } from '@shared/schema'
import { z } from 'zod'
import { Link } from 'wouter'
import { 
  Search, 
  MapPin, 
  Clock, 
  MessageSquare, 
  Plus, 
  Filter,
  Heart,
  Users,
  Sparkles,
  AlertTriangle,
  User,
  ArrowLeft
} from 'lucide-react'

interface IsoPost {
  id: string
  title: string
  content: string
  authorId: string
  postType: string
  isoSeekingType: string
  isUrgent: boolean
  category: string
  city: string
  state: string
  country: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    displayName: string
    city?: string
    state?: string
  }
}

// ISO category options
const isoCategories = [
  'Dating', 'Travel', 'Events', 'Dining', 'Entertainment', 'Lifestyle', 'Friendship', 'Other'
]

// ISO seeking type options
const seekingTypes = [
  { value: 'all', label: 'All Posts' },
  { value: 'couples_seeking', label: 'Couples Seeking' },
  { value: 'singles_seeking', label: 'Singles Seeking' },
  { value: 'groups', label: 'Groups' }
]

function CreateIsoPostModal({ isOpen, onClose }: { 
  isOpen: boolean, 
  onClose: () => void 
}) {
  const { toast } = useToast()
  const { user } = useAuth()
  
  // Create form schema for ISO posts with required fields
  const isoPostSchema = insertCommunityPostSchema.extend({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Description is required"),
    isoSeekingType: z.string().min(1, "Seeking type is required"),
    category: z.string().min(1, "Category is required"),
    city: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    isUrgent: z.boolean().nullable().optional()
  }).omit({ authorId: true })

  const form = useForm<Omit<InsertCommunityPost, 'authorId'>>({
    resolver: zodResolver(isoPostSchema),
    defaultValues: {
      title: '',
      content: '',
      postType: 'iso',
      isoSeekingType: '',
      category: '',
      city: '',
      state: '',
      country: 'USA',
      isUrgent: false
    }
  })

  const createPostMutation = useMutation({
    mutationFn: async (newPost: InsertCommunityPost) => {
      return apiRequest('/api/community/posts', {
        method: 'POST',
        body: newPost
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/community/posts'] })
      toast({
        title: "ISO Post Created",
        description: "Your post has been created successfully.",
      })
      onClose()
      form.reset()
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive"
      })
    }
  })

  const handleSubmit = (data: Omit<InsertCommunityPost, 'authorId'>) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create posts",
        variant: "destructive"
      })
      return
    }

    createPostMutation.mutate({
      ...data,
      authorId: user.id
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-xl">Create ISO Post</DialogTitle>
          <DialogDescription className="text-white/70">
            Share what you're looking for with the community
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Title *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="What are you looking for?"
                      className="bg-black/50 border-pink-500/30 text-white"
                      data-testid="input-iso-title"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/80">Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Provide more details about what you're seeking..."
                      className="bg-black/50 border-pink-500/30 text-white min-h-[100px]"
                      data-testid="input-iso-content"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isoSeekingType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Seeking Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-pink-500/30 text-white" data-testid="select-iso-seeking-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-pink-500/30">
                        {seekingTypes.slice(1).map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-white hover:bg-pink-500/20">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Category *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger className="bg-black/50 border-pink-500/30 text-white" data-testid="select-iso-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-black border-pink-500/30">
                        {isoCategories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-white hover:bg-pink-500/20">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">City</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="Your city"
                        className="bg-black/50 border-pink-500/30 text-white"
                        data-testid="input-iso-city"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">State</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value || ''}
                        placeholder="Your state"
                        className="bg-black/50 border-pink-500/30 text-white"
                        data-testid="input-iso-state"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isUrgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      className="border-pink-500/30"
                      data-testid="checkbox-iso-urgent"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-white/80">
                      Mark as urgent
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={createPostMutation.isPending}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
                data-testid="button-create-iso-post"
              >
                {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                data-testid="button-cancel-iso-post"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function IsoPostCard({ post }: { post: IsoPost }) {
  const { toast } = useToast()
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 1) return 'Less than an hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const handleRespond = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Direct messaging functionality will be available soon.",
    })
  }

  return (
    <Card 
      className="bg-black/50 border-pink-500/30 p-4 hover:border-pink-500/60 transition-all duration-300 cursor-pointer"
      data-testid={`iso-post-card-${post.id}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-white text-sm leading-tight">{post.title}</h3>
          {post.isUrgent && (
            <Badge className="bg-red-500/90 text-white border-0 text-xs flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgent
            </Badge>
          )}
        </div>

        {/* Author Information */}
        <Link 
          href={`/profile/${post.author.id}`} 
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer group"
          data-testid={`link-author-${post.author.id}`}
        >
          <div className="w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center">
            <User className="h-3 w-3 text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white/80 group-hover:text-white transition-colors">
              {post.author.displayName}
            </p>
            {(post.author.city || post.author.state) && (
              <p className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
                {[post.author.city, post.author.state].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </Link>
        
        <p className="text-white/70 text-xs leading-relaxed line-clamp-3">
          {post.content}
        </p>
        
        <div className="space-y-2 text-xs text-white/60">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{formatTimeAgo(post.createdAt)}</span>
          </div>
          
          {post.city && post.state && (
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{post.city}, {post.state}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs border-pink-500/50 text-pink-400">
              {post.category}
            </Badge>
            {post.isoSeekingType && (
              <Badge variant="outline" className="text-xs border-purple-500/50 text-purple-400">
                {seekingTypes.find(t => t.value === post.isoSeekingType)?.label}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleRespond}
            className="bg-pink-600 hover:bg-pink-700 text-white text-xs px-3 py-1"
            data-testid={`button-respond-${post.id}`}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Respond
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function IsoPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { user } = useAuth()
  
  // Fetch user profile for location preferences
  const { data: userProfile } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: async () => {
      const response = await apiRequest('/api/profile')
      return response.json()
    },
    enabled: !!user?.id
  })
  
  // Fetch ISO posts with filtering and distance preferences
  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['/api/community/posts', { 
      postType: 'iso', 
      isoSeekingType: activeTab,
      search: searchQuery || undefined,
      userLocation: userProfile ? { city: userProfile.city, state: userProfile.state, maxDistance: userProfile.maxDistance } : undefined
    }],
    queryFn: async () => {
      const params = new URLSearchParams({
        postType: 'iso',
        ...(activeTab !== 'all' && { isoSeekingType: activeTab }),
        ...(searchQuery && { search: searchQuery })
      })
      
      // Temporarily use direct fetch to bypass auth issues
      const response = await fetch(`/api/community/posts?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: true // temporarily disabled auth requirement
  })

  // Debug logging
  console.log('IsoPage Debug:', { 
    user: user?.id, 
    posts: posts?.length || 0, 
    isLoading, 
    error: error?.message,
    activeTab,
    userProfile: userProfile?.city || 'no profile'
  });

  // Filter posts by search query (client-side for real-time feedback)
  const filteredPosts = posts.filter((post: IsoPost) =>
    searchQuery === '' ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/community">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-0" data-testid="button-back-to-community">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">ISO Posts</h1>
            <p className="text-white/70 text-sm">In Search Of - Find what you're looking for</p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            size="icon"
            onClick={() => setShowCreateModal(true)}
            className="bg-pink-600 hover:bg-pink-700 text-white"
            data-testid="button-create-iso"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-black/50 p-4 border-b border-pink-500/20">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ISO posts..."
              className="pl-10 bg-black/50 border-pink-500/30 text-white"
              data-testid="input-search-iso"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-black/30 p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/50 border border-pink-500/30">
            {seekingTypes.map((type) => (
              <TabsTrigger
                key={type.value}
                value={type.value}
                className="data-[state=active]:bg-pink-600 data-[state=active]:text-white text-white/70"
                data-testid={`tab-${type.value}`}
              >
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Content for each tab */}
          {seekingTypes.map((type) => (
            <TabsContent key={type.value} value={type.value} className="mt-6">
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <Sparkles className="h-8 w-8 text-pink-400 mx-auto mb-2 animate-spin" />
                    <p className="text-white/70">Loading posts...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400">Failed to load posts</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-white/40 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No posts found</h3>
                    <p className="text-white/60 mb-6">
                      {searchQuery
                        ? 'No posts match your search criteria'
                        : `No ${type.label.toLowerCase()} posts yet`
                      }
                    </p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-pink-600 hover:bg-pink-700 text-white"
                      data-testid="button-create-first-post"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create the first post
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredPosts.map((post: IsoPost) => (
                      <IsoPostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create Post Modal */}
      <CreateIsoPostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}