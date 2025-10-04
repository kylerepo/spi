import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, Send, ArrowLeft, MoreVertical, Heart, Camera, Smile } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useRoute } from 'wouter'
import { supabase } from '@/lib/supabase'
import type { Conversation, Message, Match, Profile, ProfilePhoto } from '@shared/schema'

interface ConversationWithDetails extends Conversation {
  match: Match & {
    profile1: Profile & { profilePhotos: ProfilePhoto[] }
    profile2: Profile & { profilePhotos: ProfilePhoto[] }
  }
  unreadCount: number
  lastMessage?: Message
}

interface MessageWithSender extends Message {
  sender: Profile & { profilePhotos: ProfilePhoto[] }
}

export default function Messages() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [, params] = useRoute('/messages/:conversationId?')
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    params?.conversationId || null
  )
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ['/api/conversations'],
    enabled: !!user,
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageWithSender[]>({
    queryKey: ['/api/conversations', selectedConversation, 'messages'],
    enabled: !!user && !!selectedConversation,
    refetchInterval: 5000 // Refresh messages every 5 seconds
  })

  // Get current conversation details
  const currentConversation = conversations.find(c => c.id === selectedConversation)

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversationId: string; content: string; messageType?: string }) => {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] })
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
      setNewMessage('')
      scrollToBottom()
    },
    onError: (error: any) => {
      toast({
        title: 'Error sending message',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      })
    }
  })

  // Mark messages as read mutation
  const markReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return apiRequest(`/api/conversations/${conversationId}/mark-read`, {
        method: 'POST'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
    }
  })

  // Real-time message subscription
  useEffect(() => {
    if (!selectedConversation || !user) return

    console.log('Setting up real-time message subscription for conversation:', selectedConversation)
    
    const messageSubscription = supabase
      .channel(`messages-${selectedConversation}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation}`
        },
        (payload) => {
          console.log('New message received:', payload)
          queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation, 'messages'] })
          queryClient.invalidateQueries({ queryKey: ['/api/conversations'] })
          scrollToBottom()
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up message subscription')
      messageSubscription.unsubscribe()
    }
  }, [selectedConversation, user, queryClient])

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Mark conversation as read when opened
  useEffect(() => {
    if (selectedConversation && currentConversation && currentConversation.unreadCount > 0) {
      markReadMutation.mutate(selectedConversation)
    }
  }, [selectedConversation, currentConversation?.unreadCount])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
      messageType: 'text'
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getProfilePhoto = (photos: ProfilePhoto[]) => {
    const mainPhoto = photos.find(p => p.isProfile) || photos[0]
    return mainPhoto?.url || '/placeholder-avatar.jpg'
  }

  const getOtherProfile = (conversation: ConversationWithDetails) => {
    return conversation.match.profile1.userId === user?.id 
      ? conversation.match.profile2 
      : conversation.match.profile1
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes}m ago`
    }
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  const isMyMessage = (message: MessageWithSender) => {
    return message.senderId === user?.id
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Please log in to view your messages.</p>
      </div>
    )
  }

  // Mobile view - show conversation list or chat
  return (
    <div className="flex h-screen bg-transparent">
      {/* Conversations Sidebar */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-pink-500/30`}>
        <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
          <h1 className="text-xl font-bold text-white" data-testid="text-messages-title">
            Messages
          </h1>
          <p className="text-white/60 text-sm">Your conversations</p>
        </div>

        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="text-center py-8">
              <p className="text-white/60">Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No conversations yet</h3>
              <p className="text-white/60 mb-4">
                Start matching with people to begin chatting!
              </p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => {
                const otherProfile = getOtherProfile(conversation)
                const isSelected = conversation.id === selectedConversation
                
                return (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-colors border-0 ${
                      isSelected 
                        ? 'bg-pink-600/20 border-l-4 border-l-pink-500' 
                        : 'bg-card/30 hover:bg-card/50'
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                    data-testid={`conversation-${conversation.id}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={getProfilePhoto(otherProfile.profilePhotos)} />
                            <AvatarFallback className="bg-pink-600">
                              {otherProfile.displayName[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-pink-500 text-xs p-0 flex items-center justify-center">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white truncate" data-testid={`text-conversation-name-${conversation.id}`}>
                              {otherProfile.displayName}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-white/60">
                                {formatMessageTime(new Date(conversation.lastMessage.createdAt).toISOString())}
                              </span>
                            )}
                          </div>
                          
                          {conversation.lastMessage && (
                            <p className="text-sm text-white/60 truncate mt-1">
                              {conversation.lastMessage.senderId === user.id ? 'You: ' : ''}
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
        {selectedConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-sm border-b border-pink-500/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden text-white/60"
                    data-testid="button-back"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getProfilePhoto(getOtherProfile(currentConversation).profilePhotos)} />
                    <AvatarFallback className="bg-pink-600">
                      {getOtherProfile(currentConversation).displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="font-semibold text-white" data-testid="text-chat-partner-name">
                      {getOtherProfile(currentConversation).displayName}
                    </h2>
                    <p className="text-sm text-white/60">Active now</p>
                  </div>
                </div>
                
                <Button variant="ghost" size="sm" className="text-white/60">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <p className="text-white/60">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-pink-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Start the conversation!</h3>
                  <p className="text-white/60">
                    You matched with {getOtherProfile(currentConversation).displayName}. Say hello!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isMe = isMyMessage(message)
                    const showAvatar = index === 0 || messages[index - 1]?.senderId !== message.senderId
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                        data-testid={`message-${message.id}`}
                      >
                        {!isMe && (
                          <Avatar className={`h-8 w-8 ${showAvatar ? '' : 'invisible'}`}>
                            <AvatarImage src={getProfilePhoto(message.sender.profilePhotos)} />
                            <AvatarFallback className="bg-pink-600 text-xs">
                              {message.sender.displayName[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isMe
                              ? 'bg-pink-600 text-white'
                              : 'bg-card/50 text-white border border-pink-500/20'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-pink-100' : 'text-white/60'}`}>
                            {formatMessageTime(new Date(message.createdAt).toISOString())}
                          </p>
                        </div>
                        
                        {isMe && (
                          <div className="w-8" /> // Placeholder for alignment
                        )}
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-pink-500/30 p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-white/60">
                  <Camera className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-white/60">
                  <Smile className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="bg-card/50 border-pink-500/30"
                    disabled={sendMessageMutation.isPending}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    className="bg-pink-600 hover:bg-pink-700"
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-pink-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Select a conversation</h3>
              <p className="text-white/60">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}