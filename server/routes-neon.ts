import type { Express, Request, Response } from 'express';
import { AuthService } from './auth';
import { neonDB } from './db-neon';
import { StorageService } from './storage-neon';
import multer from 'multer';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

// Middleware to verify JWT
async function authenticateUser(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);

  try {
    const payload = AuthService.verifyToken(token);
    
    // Get user from database
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerNeonRoutes(app: Express) {
  // ==================== AUTH ROUTES ====================

  // Register
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const result = await AuthService.register(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Login
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // Refresh token
  app.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      const tokens = await AuthService.refreshAccessToken(refreshToken);
      res.json(tokens);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  });

  // Logout
  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user
  app.get('/api/auth/me', authenticateUser, async (req: Request, res: Response) => {
    try {
      const user = await neonDB.getUser(req.user!.id);
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PROFILE ROUTES ====================

  // Get current user's profile
  app.get('/api/profile', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profile = await neonDB.getProfile(req.user!.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Get photos
      const photos = await neonDB.getProfilePhotos(profile.id);
      
      // Get interests
      const interests = await neonDB.getProfileInterests(profile.id);

      res.json({
        ...profile,
        photos,
        interests,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create profile
  app.post('/api/profile', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profileData = {
        ...req.body,
        userId: req.user!.id,
        isProfileComplete: false,
      };

      const profile = await neonDB.createProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update profile
  app.put('/api/profile', authenticateUser, async (req: Request, res: Response) => {
    try {
      const existingProfile = await neonDB.getProfile(req.user!.id);
      
      if (!existingProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const profile = await neonDB.updateProfile(existingProfile.id, req.body);
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete profile setup
  app.post('/api/profile/complete', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { profileData, coupleProfileData, preferences, boundaries, safeSex } = req.body;

      // Get existing profile
      const existingProfile = await neonDB.getProfile(req.user!.id);
      if (!existingProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Update profile with complete data
      const updatedProfile = await neonDB.updateProfile(existingProfile.id, {
        ...profileData,
        isProfileComplete: true,
      });

      // Create couple profile if applicable
      if (existingProfile.accountType === 'couple' && coupleProfileData) {
        const existingCoupleProfile = await neonDB.getCoupleProfile(existingProfile.id);
        if (existingCoupleProfile) {
          await neonDB.updateCoupleProfile(existingProfile.id, coupleProfileData);
        } else {
          await neonDB.createCoupleProfile({
            profileId: existingProfile.id,
            ...coupleProfileData,
          });
        }
      }

      // Create preferences
      if (preferences) {
        const existingPreferences = await neonDB.getProfilePreferences(existingProfile.id);
        if (existingPreferences) {
          await neonDB.updateProfilePreferences(existingProfile.id, preferences);
        } else {
          await neonDB.createProfilePreferences({
            profileId: existingProfile.id,
            ...preferences,
          });
        }
      }

      // Create boundaries
      if (boundaries) {
        const existingBoundaries = await neonDB.getProfileBoundaries(existingProfile.id);
        if (existingBoundaries) {
          await neonDB.updateProfileBoundaries(existingProfile.id, boundaries);
        } else {
          await neonDB.createProfileBoundaries({
            profileId: existingProfile.id,
            ...boundaries,
          });
        }
      }

      // Create safe sex practices
      if (safeSex) {
        const existingSafeSex = await neonDB.getProfileSafeSex(existingProfile.id);
        if (existingSafeSex) {
          await neonDB.updateProfileSafeSex(existingProfile.id, safeSex);
        } else {
          await neonDB.createProfileSafeSex({
            profileId: existingProfile.id,
            ...safeSex,
          });
        }
      }

      res.json(updatedProfile);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PHOTO ROUTES ====================

  // Upload profile photo
  app.post('/api/profile/photos', authenticateUser, upload.single('photo'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No photo provided' });
      }

      // Get profile
      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Upload photo
      const result = await StorageService.uploadProfilePhoto(
        req.file.buffer,
        profile.id,
        req.file.originalname
      );

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload multiple photos
  app.post('/api/profile/photos/multiple', authenticateUser, upload.array('photos', 6), async (req: Request, res: Response) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: 'No photos provided' });
      }

      // Get profile
      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Convert files to proper format
      const files = req.files.map((file: any) => ({
        ...file,
        name: file.originalname,
      }));

      // Upload photos
      const results = await StorageService.uploadMultipleProfilePhotos(
        files as File[],
        profile.id
      );

      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get profile photos
  app.get('/api/profile/photos', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const photos = await neonDB.getProfilePhotos(profile.id);
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete photo
  app.delete('/api/profile/photos/:photoId', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { photoId } = req.params;

      // Verify photo belongs to user's profile
      const photo = await neonDB.getProfilePhoto(photoId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile || photo.profileId !== profile.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Delete photo
      const success = await StorageService.deletePhoto(photoId);
      if (success) {
        res.json({ message: 'Photo deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete photo' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set profile photo
  app.post('/api/profile/photos/:photoId/set-profile', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { photoId } = req.params;

      // Verify photo belongs to user's profile
      const photo = await neonDB.getProfilePhoto(photoId);
      if (!photo) {
        return res.status(404).json({ error: 'Photo not found' });
      }

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile || photo.profileId !== profile.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Set as profile photo
      const updatedPhoto = await neonDB.setProfilePhoto(photoId, profile.id);
      res.json(updatedPhoto);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INTERESTS ROUTES ====================

  // Get all interests
  app.get('/api/interests', async (req: Request, res: Response) => {
    try {
      const interests = await neonDB.getAllInterests();
      res.json(interests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get profile interests
  app.get('/api/profile/interests', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const interests = await neonDB.getProfileInterests(profile.id);
      res.json(interests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add interest to profile
  app.post('/api/profile/interests', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { interestId, customInterest } = req.body;

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const profileInterest = await neonDB.addProfileInterest(
        profile.id,
        interestId,
        customInterest
      );

      res.json(profileInterest);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Remove interest from profile
  app.delete('/api/profile/interests/:interestId', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { interestId } = req.params;

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      await neonDB.removeProfileInterest(interestId);
      res.json({ message: 'Interest removed successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DISCOVERY ROUTES ====================

  // Get profiles for discovery
  app.get('/api/discovery', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const profiles = await neonDB.getDiscoveryProfiles(profile.id, limit, offset);
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Swipe on profile
  app.post('/api/swipe', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { swipedId, action } = req.body;

      if (!['like', 'pass', 'superlike'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const swipe = await neonDB.createSwipe(profile.id, swipedId, action);
      
      // Check for match if it's a like or superlike
      if (action === 'like' || action === 'superlike') {
        const reverseSwipe = await neonDB.getSwipe(swipedId, profile.id);
        
        if (reverseSwipe && (reverseSwipe.action === 'like' || reverseSwipe.action === 'superlike')) {
          // Create match
          const match = await neonDB.createMatch(profile.id, swipedId);
          return res.json({ swipe, match, isMatch: true });
        }
      }

      res.json({ swipe, isMatch: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MATCH ROUTES ====================

  // Get user's matches
  app.get('/api/matches', authenticateUser, async (req: Request, res: Response) => {
    try {
      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const matches = await neonDB.getMatches(profile.id);
      res.json(matches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MESSAGE ROUTES ====================

  // Get messages for match
  app.get('/api/matches/:matchId/messages', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await neonDB.getMessages(matchId, limit, offset);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send message
  app.post('/api/matches/:matchId/messages', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;
      const { content, type = 'text' } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const message = await neonDB.createMessage(matchId, profile.id, content, type);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark messages as read
  app.post('/api/matches/:matchId/messages/read', authenticateUser, async (req: Request, res: Response) => {
    try {
      const { matchId } = req.params;

      const profile = await neonDB.getProfile(req.user!.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      await neonDB.markMessagesAsRead(matchId, profile.id);
      res.json({ message: 'Messages marked as read' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'neon-api'
    });
  });

  // Error handling middleware
  app.use((error: any, req: Request, res: Response, next: Function) => {
    console.error('API Error:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
      }
    }
    
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  });
}