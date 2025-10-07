import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from './neon-db';
import { users, refreshTokens } from '../shared/neon-schema';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Compare password
  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate JWT token
  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }

  // Generate refresh token
  static generateRefreshToken(): string {
    return uuidv4();
  }

  // Register new user
  static async register(email: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (existingUser.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(password);

      // Create user
      const userId = uuidv4();
      const [newUser] = await db.insert(users).values({
        id: userId,
        email,
        password: hashedPassword,
      }).returning();

      // Generate tokens
      const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.role);

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
        },
        tokens,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    try {
      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Update last login
      await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Generate access and refresh tokens
  static async generateTokens(userId: string, email: string, role: string): Promise<AuthTokens> {
    const accessToken = this.generateToken({ userId, email, role });
    const refreshToken = this.generateRefreshToken();

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await db.insert(refreshTokens).values({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Find and validate refresh token
      const [tokenRecord] = await db
        .select()
        .from(refreshTokens)
        .where(and(
          eq(refreshTokens.token, refreshToken),
          eq(refreshTokens.expiresAt, new Date())
        ))
        .limit(1);

      if (!tokenRecord) {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const [user] = await db.select().from(users).where(eq(users.id, tokenRecord.userId)).limit(1);
      
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user.id, user.email, user.role);

      // Delete old refresh token
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));

      return tokens;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  // Logout user
  static async logout(refreshToken: string): Promise<void> {
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthUser | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      if (!user || !user.isActive) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // Verify email
  static async verifyEmail(userId: string): Promise<void> {
    try {
      await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  // Update password
  static async updatePassword(userId: string, newPassword: string): Promise<void> {
    try {
      const hashedPassword = await this.hashPassword(newPassword);
      await db.update(users).set({ password: hashedPassword }).where(eq(users.id, userId));
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }
}