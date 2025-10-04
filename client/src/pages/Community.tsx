import { useState } from 'react'
import { Link } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Users, Calendar, MessageSquare, MapPin, Clock, Heart, ChevronRight, Star, Camera, Shield, Crown } from 'lucide-react'

// Types for community data
type OnlineUser = {
  id: string
  name: string
  age: number
  location: string
  profileImage: string
  isVerified: boolean
  isPremium: boolean
  accountType: string
  lastActive: string
  distance: string
}

type CommunityEvent = {
  id: string
  title: string
  date: string
  time: string
  location: string
  attendees: number
  maxAttendees: number
  price: string
  image: string
  isVIP: boolean
  distance: string
}

type IsoPost = {
  id: string
  title: string
  author: string
  postedTime: string
  location: string
  responses: number
  category: string
  isUrgent: boolean
}

// Modal Components
function UserDetailModal({ user, isOpen, onClose }: { 
  user: OnlineUser | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  if (!user) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-xl flex items-center space-x-2">
            <span>{user.name}</span>
            {user.isVerified && <Shield className="h-5 w-5 text-blue-400" />}
            {user.isPremium && <Crown className="h-5 w-5 text-yellow-400" />}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            {user.accountType} profile • {user.age} years old
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <img 
            src={user.profileImage} 
            alt={user.name}
            className="w-full h-64 object-cover rounded-lg"
          />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-white/60" />
                <span className="text-white/80">{user.location}</span>
              </div>
              <Badge className={`${user.lastActive === 'Online now' ? 'bg-green-500' : 'bg-orange-500'} border-0`}>
                {user.lastActive}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/60">Distance:</span>
              <span className="text-white">{user.distance}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                {user.accountType}
              </Badge>
              {user.isPremium && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                  Premium
                </Badge>
              )}
              {user.isVerified && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
                  Verified
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">
              Send Message
            </Button>
            <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function EventDetailModal({ event, isOpen, onClose }: { 
  event: CommunityEvent | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  if (!event) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-xl">{event.title}</DialogTitle>
          <DialogDescription className="text-white/70">
            Event Details
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center text-white/70">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{event.date} at {event.time}</span>
                </div>
                <div className="flex items-center text-white/70">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center text-white/70">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{event.attendees}/{event.maxAttendees} attending</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Price:</span>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                    {event.price}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Distance:</span>
                  <span className="text-white">{event.distance}</span>
                </div>
                {event.isVIP && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    VIP Event
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">
              Request Invitation
            </Button>
            <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function IsoPostDetailModal({ post, isOpen, onClose }: { 
  post: IsoPost | null, 
  isOpen: boolean, 
  onClose: () => void 
}) {
  if (!post) return null
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-pink-500/30 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-pink-400 text-xl">ISO Post Details</DialogTitle>
          <DialogDescription className="text-white/70">
            In Search Of Request
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-black/50 rounded-lg p-4 border border-pink-500/20">
            <h3 className="font-semibold text-white mb-3">{post.title}</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Posted by:</span>
                <span className="text-white">{post.author}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Location:</span>
                <span className="text-white">{post.location}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Category:</span>
                <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                  {post.category}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Posted:</span>
                <span className="text-white">{post.postedTime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-white/70">Responses:</span>
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-4 w-4 text-white/60" />
                  <span className="text-white">{post.responses}</span>
                </div>
              </div>
              
              {post.isUrgent && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                  Urgent Request
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button className="flex-1 bg-pink-600 hover:bg-pink-700 text-white">
              Respond to Post
            </Button>
            <Button variant="outline" className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UserCard({ user, onClick }: { user: OnlineUser, onClick: () => void }) {
  return (
    <Card 
      className="bg-black/50 border-pink-500/30 p-4 hover:border-pink-500/60 transition-all duration-300 min-w-[200px] cursor-pointer"
      onClick={onClick}
      data-testid={`user-card-${user.id}`}
    >
      <div className="relative">
        <img 
          src={user.profileImage} 
          alt={user.name}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
        {user.isVerified && (
          <Badge className="absolute top-2 right-2 bg-blue-500/90 text-white border-0 text-xs">
            ✓
          </Badge>
        )}
        {user.isPremium && (
          <Star className="absolute top-2 left-2 h-4 w-4 text-yellow-400 fill-current" />
        )}
        <div className="absolute bottom-2 left-2">
          <Badge className={`text-xs ${user.lastActive === 'Online now' ? 'bg-green-500' : 'bg-orange-500'} border-0`}>
            {user.lastActive === 'Online now' ? '● Online' : user.lastActive}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{user.name}</h3>
          <span className="text-white/60 text-xs">{user.age}</span>
        </div>
        
        <div className="flex items-center text-xs text-white/60">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{user.distance}</span>
        </div>
        
        <Badge variant="outline" className="text-xs border-pink-500/50 text-pink-400">
          {user.accountType}
        </Badge>
      </div>
    </Card>
  )
}

function EventCard({ event, onClick }: { event: CommunityEvent, onClick: () => void }) {
  return (
    <Card 
      className="bg-black/50 border-pink-500/30 p-4 hover:border-pink-500/60 transition-all duration-300 min-w-[280px] cursor-pointer"
      onClick={onClick}
      data-testid={`event-card-${event.id}`}
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-32 object-cover rounded-lg mb-3"
        />
        {event.isVIP && (
          <Badge className="absolute top-2 right-2 bg-purple-500/90 text-white border-0 text-xs">
            VIP
          </Badge>
        )}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-black/70 text-white border-0 text-xs">
            {event.price}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-white text-sm">{event.title}</h3>
        
        <div className="flex items-center text-xs text-white/60">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{event.date} at {event.time}</span>
        </div>
        
        <div className="flex items-center text-xs text-white/60">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{event.distance}</span>
        </div>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">
            <Users className="h-3 w-3 inline mr-1" />
            {event.attendees}/{event.maxAttendees}
          </span>
          <Badge variant="outline" className="border-green-500/50 text-green-400">
            Available
          </Badge>
        </div>
      </div>
    </Card>
  )
}

function IsoPostCard({ post, onClick }: { post: IsoPost, onClick: () => void }) {
  return (
    <Card 
      className="bg-black/50 border-pink-500/30 p-4 hover:border-pink-500/60 transition-all duration-300 min-w-[250px] cursor-pointer"
      onClick={onClick}
      data-testid={`iso-post-card-${post.id}`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-white text-sm leading-tight">{post.title}</h3>
          {post.isUrgent && (
            <Badge className="bg-red-500/90 text-white border-0 text-xs">
              Urgent
            </Badge>
          )}
        </div>
        
        <div className="space-y-2 text-xs text-white/60">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            <span>{post.postedTime}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            <span>{post.location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/60">by {post.author}</span>
            <Badge variant="outline" className="text-xs border-pink-500/50 text-pink-400">
              {post.category}
            </Badge>
          </div>
          <div className="flex items-center text-xs text-white/60">
            <MessageSquare className="h-3 w-3 mr-1" />
            <span>{post.responses}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Community() {
  const [onlineUsers] = useState<OnlineUser[]>([])
  const [events] = useState<CommunityEvent[]>([])
  const [isoPosts] = useState<IsoPost[]>([])
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<CommunityEvent | null>(null)
  const [selectedPost, setSelectedPost] = useState<IsoPost | null>(null)
  const [showUserDetail, setShowUserDetail] = useState(false)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [showPostDetail, setShowPostDetail] = useState(false)

  // Handle clicks
  const handleUserClick = (user: OnlineUser) => {
    setSelectedUser(user)
    setShowUserDetail(true)
  }

  const handleEventClick = (event: CommunityEvent) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
  }

  const handlePostClick = (post: IsoPost) => {
    setSelectedPost(post)
    setShowPostDetail(true)
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white mb-1">Community</h1>
        <p className="text-white/70 text-sm">Connect with verified members in your area</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-8">
        
        {/* Users Online Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">Members Online</h2>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                {onlineUsers.length} online
              </Badge>
            </div>
            <Link href="/community/users">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                data-testid="button-view-all-users"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {onlineUsers.map((user) => (
              <UserCard key={user.id} user={user} onClick={() => handleUserClick(user)} />
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                {events.length} this week
              </Badge>
            </div>
            <Link href="/events">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                data-testid="button-view-all-events"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
            ))}
          </div>
        </section>

        {/* ISO Posts Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-white">ISO Posts</h2>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                {isoPosts.length} recent
              </Badge>
            </div>
            <Link href="/community/iso">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-pink-400 hover:text-pink-300 hover:bg-pink-500/10"
                data-testid="button-view-all-iso"
              >
                View All
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          
          <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {isoPosts.map((post) => (
              <IsoPostCard key={post.id} post={post} onClick={() => handlePostClick(post)} />
            ))}
          </div>
        </section>

      </div>

      {/* Modal Dialogs */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => setShowEventDetail(false)}
      />

      <IsoPostDetailModal
        post={selectedPost}
        isOpen={showPostDetail}
        onClose={() => setShowPostDetail(false)}
      />

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}