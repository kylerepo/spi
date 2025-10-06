import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { supabaseAdmin, supabase } from "./supabase";
import { db } from "./db";
import { storage } from "./storage";
import multer from "multer";

// Middleware to verify Supabase JWT
async function authenticateUser(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==================== PROFILE ROUTES ====================
  
  // Get current user's profile
  app.get('/api/profile', authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', req.user.id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create profile
  app.post('/api/profile', authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert([{
          user_id: req.user.id,
          ...req.body
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update profile
  app.put('/api/profile', authenticateUser, async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(req.body)
        .eq('user_id', req.user.id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== DISCOVERY ROUTES ====================
  
  // Get profiles for discovery
  app.get('/api/discovery', authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Get profiles excluding:
      // - Current user
      // - Already swiped profiles
      // - Blocked users
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .neq('user_id', req.user.id)
        .not('id', 'in', `(
          SELECT swiped_id FROM swipes WHERE swiper_id = '${currentProfile.id}'
        )`)
        .not('id', 'in', `(
          SELECT blocked_id FROM blocks WHERE blocker_id = '${currentProfile.id}'
        )`)
        .limit(20);

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SWIPE ROUTES ====================
  
  // Create a swipe
  app.post('/api/swipe', authenticateUser, async (req, res) => {
    try {
      const { swiped_id, action } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('swipes')
        .insert([{
          swiper_id: currentProfile.id,
          swiped_id,
          action
        }])
        .select()
        .single();

      if (error) throw error;

      // Check if it's a match
      if (action === 'like') {
        const { data: reverseSwipe } = await supabaseAdmin
          .from('swipes')
          .select('*')
          .eq('swiper_id', swiped_id)
          .eq('swiped_id', currentProfile.id)
          .eq('action', 'like')
          .single();

        if (reverseSwipe) {
          res.json({ ...data, isMatch: true });
          return;
        }
      }

      res.json({ ...data, isMatch: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MATCH ROUTES ====================
  
  // Get all matches
  app.get('/api/matches', authenticateUser, async (req, res) => {
    try {
      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('matches')
        .select(`
          *,
          user1:profiles!matches_user1_id_fkey(*),
          user2:profiles!matches_user2_id_fkey(*)
        `)
        .or(`user1_id.eq.${currentProfile.id},user2_id.eq.${currentProfile.id}`)
        .order('matched_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== MESSAGE ROUTES ====================
  
  // Get messages for a match
  app.get('/api/messages/:matchId', authenticateUser, async (req, res) => {
    try {
      const { matchId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send a message
  app.post('/api/messages', authenticateUser, async (req, res) => {
    try {
      const { match_id, content, type = 'text' } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('messages')
        .insert([{
          match_id,
          sender_id: currentProfile.id,
          content,
          type
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark message as read
  app.put('/api/messages/:messageId/read', authenticateUser, async (req, res) => {
    try {
      const { messageId } = req.params;

      const { data, error } = await supabaseAdmin
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== BLOCK ROUTES ====================
  
  // Block a user
  app.post('/api/block', authenticateUser, async (req, res) => {
    try {
      const { blocked_id } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('blocks')
        .insert([{
          blocker_id: currentProfile.id,
          blocked_id
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Unblock a user
  app.delete('/api/block/:blockedId', authenticateUser, async (req, res) => {
    try {
      const { blockedId } = req.params;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { error } = await supabaseAdmin
        .from('blocks')
        .delete()
        .eq('blocker_id', currentProfile.id)
        .eq('blocked_id', blockedId);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== REPORT ROUTES ====================
  
  // Report a user
  app.post('/api/report', authenticateUser, async (req, res) => {
    try {
      const { reported_id, reason } = req.body;

      const { data: currentProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const { data, error } = await supabaseAdmin
        .from('reports')
        .insert([{
          reporter_id: currentProfile.id,
          reported_id,
          reason
        }])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INTERESTS ROUTES ====================
  
  // Get all interests
  app.get('/api/interests', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('interests')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
