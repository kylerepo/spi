import { useState } from 'react'
import { useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Calendar, MapPin, Users, Clock, Star, Search, Filter, ArrowLeft } from 'lucide-react'
import { Link } from 'wouter'

// Mock events data - expanded
const allEvents = [
  {
    id: '1',
    title: 'Elite Social Mixer',
    date: '2024-01-15',
    time: '8:00 PM',
    location: 'Rooftop Lounge, Manhattan',
    attendees: 24,
    maxAttendees: 50,
    price: '$85',
    image: '/api/placeholder/300/200',
    isVIP: true,
    distance: '3.2 km',
    category: 'Social',
    description: 'Join Manhattan\'s most exclusive social mixer for sophisticated adults. Network with verified premium members in an upscale rooftop setting with panoramic city views.',
    ageRange: '25-45',
    dressCode: 'Cocktail Attire',
    hostName: 'Elite Events NYC'
  },
  {
    id: '2', 
    title: 'Wine & Connection Night',
    date: '2024-01-18',
    time: '7:30 PM',
    location: 'Private Club, Brooklyn',
    attendees: 18,
    maxAttendees: 30,
    price: '$65',
    image: '/api/placeholder/300/200',
    isVIP: false,
    distance: '5.1 km',
    category: 'Dining',
    description: 'Intimate wine tasting experience featuring rare vintages and curated pairings. Perfect for making meaningful connections in a relaxed atmosphere.',
    ageRange: '28-50',
    dressCode: 'Smart Casual',
    hostName: 'Brooklyn Social Club'
  },
  {
    id: '3',
    title: 'VIP Weekend Retreat',
    date: '2024-01-20',
    time: '6:00 PM',
    location: 'Exclusive Resort, Hamptons',
    attendees: 12,
    maxAttendees: 20,
    price: '$350',
    image: '/api/placeholder/300/200',
    isVIP: true,
    distance: '45.2 km',
    category: 'Travel',
    description: 'Exclusive weekend getaway for verified couples and select singles. Luxury accommodations with premium amenities and carefully curated experiences.',
    ageRange: '30-55',
    dressCode: 'Resort Elegant',
    hostName: 'SPICE Premium Events'
  },
  {
    id: '4',
    title: 'Midnight Masquerade',
    date: '2024-01-22',
    time: '10:00 PM',
    location: 'Secret Location, Manhattan',
    attendees: 35,
    maxAttendees: 60,
    price: '$120',
    image: '/api/placeholder/300/200',
    isVIP: true,
    distance: '2.8 km',
    category: 'Party',
    description: 'Mysterious and elegant masquerade ball for adventurous members. Location revealed 24 hours before the event to confirmed attendees.',
    ageRange: '25-45',
    dressCode: 'Formal + Mask Required',
    hostName: 'Midnight Society'
  },
  {
    id: '5',
    title: 'Art Gallery Opening',
    date: '2024-01-25',
    time: '6:30 PM',
    location: 'SoHo Gallery District',
    attendees: 28,
    maxAttendees: 40,
    price: '$45',
    image: '/api/placeholder/300/200',
    isVIP: false,
    distance: '4.1 km',
    category: 'Cultural',
    description: 'Sophisticated art opening featuring contemporary works by emerging artists. Network with cultured individuals who appreciate fine art and meaningful conversation.',
    ageRange: '25-60',
    dressCode: 'Gallery Chic',
    hostName: 'SoHo Arts Collective'
  }
]

function EventDetailModal({ event, isOpen, onClose }: { 
  event: typeof allEvents[0] | null, 
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
            <p className="text-white/90">{event.description}</p>
            
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
                  <span className="text-white/70">Age Range:</span>
                  <span className="text-white">{event.ageRange}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Dress Code:</span>
                  <span className="text-white text-xs">{event.dressCode}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-pink-500/30">
              <span className="text-white/70 text-sm">Hosted by {event.hostName}</span>
              <div className="flex items-center space-x-2">
                {event.isVIP && (
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
                    VIP
                  </Badge>
                )}
                <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                  {event.category}
                </Badge>
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

function EventCard({ event, onClick }: { 
  event: typeof allEvents[0], 
  onClick: () => void 
}) {
  return (
    <Card 
      className="bg-black/50 border-pink-500/30 p-4 hover:border-pink-500/60 transition-all duration-300 cursor-pointer"
      onClick={onClick}
      data-testid={`event-card-${event.id}`}
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
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
      
      <div className="space-y-3">
        <h3 className="font-semibold text-white text-lg">{event.title}</h3>
        
        <div className="space-y-2 text-sm">
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
        
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="border-pink-500/50 text-pink-400">
            {event.category}
          </Badge>
          <span className="text-white/60 text-xs">{event.distance}</span>
        </div>
      </div>
    </Card>
  )
}

export default function Events() {
  const [, setLocation] = useLocation()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedEvent, setSelectedEvent] = useState<typeof allEvents[0] | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)

  const categories = ['all', 'Social', 'Dining', 'Travel', 'Party', 'Cultural']

  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleEventClick = (event: typeof allEvents[0]) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
  }

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4 flex-shrink-0">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/community">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Events</h1>
            <p className="text-white/70 text-sm">Discover exclusive lifestyle events</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-pink-500/30 text-white placeholder-white/50"
              data-testid="input-search-events"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-32 bg-black/50 border-pink-500/30 text-white">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-pink-500/30">
              {categories.map(category => (
                <SelectItem 
                  key={category} 
                  value={category}
                  className="text-white hover:bg-pink-500/20"
                >
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-white/70 text-sm">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onClick={() => handleEventClick(event)}
            />
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-white/70 text-lg mb-2">No events found</h3>
            <p className="text-white/50 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={showEventDetail}
        onClose={() => setShowEventDetail(false)}
      />
    </div>
  )
}