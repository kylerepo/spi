# SPICE Dating App - API Reference

## React Hooks Documentation

This document provides a comprehensive reference for all custom React hooks used in the SPICE dating app.

---

## Authentication Hooks

### `useAuth()`

Manages user authentication state and operations.

**Returns:**
```typescript
{
  user: User | null;              // Current authenticated user
  session: Session | null;        // Current session
  loading: boolean;               // Auth state loading
  signUp: (email, password, metadata?) => Promise<{error}>;
  signIn: (email, password) => Promise<{error}>;
  signOut: () => Promise<void>;
  resetPassword: (email) => Promise<{error}>;
  updatePassword: (newPassword) => Promise<{error}>;
}
```

**Example Usage:**
```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { signIn, loading } = useAuth();
  
  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      console.error('Login failed:', error);
    }
  };
  
  return <LoginForm onSubmit={handleLogin} />;
}
```

---

## Profile Hooks

### `useProfile()`

Manages user profile data and operations.

**Returns:**
```typescript
{
  profile: Profile | null;        // Current user's profile
  loading: boolean;               // Profile loading state
  error: string | null;           // Error message if any
  createProfile: (data) => Promise<{data, error}>;
  updateProfile: (updates) => Promise<{data, error}>;
  uploadPhoto: (file) => Promise<{url, error}>;
  addPhoto: (photoUrl) => Promise<{error}>;
  removePhoto: (photoUrl) => Promise<{error}>;
  refetch: () => Promise<void>;  // Manually refetch profile
}
```

**Profile Type:**
```typescript
type Profile = {
  id: string;
  user_id: string;
  profile_type: 'single' | 'couple';
  name: string;
  age: number;
  bio: string;
  location: string;
  latitude?: number;
  longitude?: number;
  gender?: string;
  orientation?: string;
  looking_for?: string[];
  interests: string[];
  photos: string[];
  is_verified: boolean;
  is_premium: boolean;
  partner_id?: string;
  created_at: string;
  updated_at: string;
}
```

**Example Usage:**
```typescript
import { useProfile } from '@/hooks/useProfile';

function ProfileEditor() {
  const { profile, updateProfile, uploadPhoto } = useProfile();
  
  const handlePhotoUpload = async (file: File) => {
    const { url, error } = await uploadPhoto(file);
    if (url) {
      await addPhoto(url);
    }
  };
  
  const handleUpdateBio = async (newBio: string) => {
    await updateProfile({ bio: newBio });
  };
  
  return <ProfileForm profile={profile} />;
}
```

---

## Discovery Hooks

### `useDiscovery(filters?)`

Fetches profiles for the discovery/swipe interface.

**Parameters:**
```typescript
interface DiscoveryFilters {
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;              // in kilometers
  profileTypes?: ('single' | 'couple')[];
  interests?: string[];
}
```

**Returns:**
```typescript
{
  profiles: Profile[];            // Array of profiles to show
  loading: boolean;               // Loading state
  error: string | null;           // Error message
  refetch: () => Promise<void>;   // Manually refetch profiles
}
```

**Example Usage:**
```typescript
import { useDiscovery } from '@/hooks/useDiscovery';

function DiscoveryScreen() {
  const filters = {
    minAge: 25,
    maxAge: 35,
    maxDistance: 50,
    interests: ['Wine Tasting', 'Travel']
  };
  
  const { profiles, loading } = useDiscovery(filters);
  
  if (loading) return <LoadingSpinner />;
  
  return <SwipeInterface profiles={profiles} />;
}
```

---

## Swipe/Matching Hooks

### `useSwipe()`

Handles swiping actions and match detection.

**Returns:**
```typescript
{
  like: (profile) => Promise<{data, error, isMatch}>;
  pass: (profile) => Promise<{data, error, isMatch}>;
  superlike: (profile) => Promise<{data, error, isMatch}>;
  loading: boolean;
  error: string | null;
}
```

**Example Usage:**
```typescript
import { useSwipe } from '@/hooks/useSwipe';

function SwipeCard({ profile }) {
  const { like, pass } = useSwipe();
  
  const handleLike = async () => {
    const { isMatch } = await like(profile);
    if (isMatch) {
      showMatchModal(profile);
    }
  };
  
  return (
    <Card>
      <button onClick={handleLike}>Like</button>
      <button onClick={() => pass(profile)}>Pass</button>
    </Card>
  );
}
```

### `useMatches()`

Retrieves all matches for the current user.

**Returns:**
```typescript
{
  matches: Array<Match & { profile: Profile }>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Match Type:**
```typescript
type Match = {
  id: string;
  user1_id: string;
  user2_id: string;
  matched_at: string;
  last_message_at?: string;
}
```

**Example Usage:**
```typescript
import { useMatches } from '@/hooks/useMatches';

function MatchesList() {
  const { matches, loading } = useMatches();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      {matches.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

---

## Messaging Hooks

### `useMessages(matchId)`

Manages real-time messaging for a specific match.

**Parameters:**
- `matchId: string` - The ID of the match/conversation

**Returns:**
```typescript
{
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content, type?) => Promise<{data, error}>;
  sendImageMessage: (file) => Promise<{error}>;
  refetch: () => Promise<void>;
}
```

**Message Type:**
```typescript
type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'image';
  is_read: boolean;
  created_at: string;
}
```

**Example Usage:**
```typescript
import { useMessages } from '@/hooks/useMessages';

function ChatInterface({ matchId }) {
  const { messages, sendMessage, loading } = useMessages(matchId);
  const [input, setInput] = useState('');
  
  const handleSend = async () => {
    await sendMessage(input);
    setInput('');
  };
  
  return (
    <div>
      <MessageList messages={messages} />
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
```

---

## Real-time Subscriptions

All hooks that support real-time updates automatically subscribe to changes:

- **`useMatches()`**: Automatically updates when new matches are created
- **`useMessages(matchId)`**: Automatically receives new messages in real-time

These subscriptions are automatically cleaned up when components unmount.

---

## Error Handling

All hooks return errors in a consistent format:

```typescript
const { data, error } = await someOperation();

if (error) {
  // Handle error
  console.error(error);
  toast.error(error.message);
}
```

---

## Best Practices

### 1. Always Check Loading States
```typescript
const { data, loading } = useProfile();

if (loading) return <LoadingSpinner />;
return <ProfileView profile={data} />;
```

### 2. Handle Errors Gracefully
```typescript
const { error } = useProfile();

if (error) {
  return <ErrorMessage message={error} />;
}
```

### 3. Use Refetch When Needed
```typescript
const { refetch } = useProfile();

// After updating profile externally
await updateSomething();
await refetch();
```

### 4. Clean Up Subscriptions
Hooks automatically clean up subscriptions, but if you need manual control:

```typescript
useEffect(() => {
  const subscription = subscribeToMessages();
  return () => subscription.unsubscribe();
}, [matchId]);
```

---

## Common Patterns

### Protected Routes
```typescript
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return children;
}
```

### Profile Completion Check
```typescript
function App() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  
  if (loading) return <LoadingSpinner />;
  if (user && !profile) return <ProfileSetup />;
  
  return <MainApp />;
}
```

### Optimistic Updates
```typescript
const { messages, sendMessage } = useMessages(matchId);

const handleSend = async (text: string) => {
  // Optimistically add message to UI
  const tempMessage = {
    id: 'temp',
    content: text,
    sender_id: currentUserId,
    created_at: new Date().toISOString()
  };
  
  setMessages([...messages, tempMessage]);
  
  // Send to server
  await sendMessage(text);
};
```

---

## TypeScript Support

All hooks are fully typed. Import types from the Supabase client:

```typescript
import { Profile, Match, Message } from '@/lib/supabase';
```

---

## Performance Tips

1. **Use filters in useDiscovery**: Don't fetch all profiles, use filters
2. **Paginate messages**: Load messages in chunks for better performance
3. **Debounce search**: When implementing search, debounce user input
4. **Memoize callbacks**: Use `useCallback` for event handlers
5. **Lazy load images**: Use lazy loading for profile photos

---

## Troubleshooting

### Hook returns null/undefined
- Check if user is authenticated
- Verify Supabase connection
- Check browser console for errors

### Real-time updates not working
- Verify Supabase Realtime is enabled
- Check RLS policies allow subscriptions
- Ensure proper cleanup of subscriptions

### Photos not uploading
- Check storage bucket exists
- Verify storage policies
- Check file size limits (10MB max)

---

For more information, see:
- [Setup Guide](./SETUP_GUIDE.md)
- [Supabase Documentation](https://supabase.com/docs)