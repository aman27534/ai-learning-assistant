import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserProfile } from '../types/index';
import { UserProfileValidator, UserProfileUtils } from '../models/user-profile';
import db from '../db';

// Simple UUID generator to avoid external dependency
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface SessionData {
  userId: string;
  email: string;
  lastActivity: Date;
  isActive: boolean;
  metadata: Record<string, any>;
}

// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly tokenExpiry: string;
  private readonly refreshTokenExpiry: string;
  private readonly saltRounds: number;

  constructor(
    jwtSecret: string = process.env.JWT_SECRET || 'default-secret',
    jwtRefreshSecret: string = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'
  ) {
    this.jwtSecret = jwtSecret;
    this.jwtRefreshSecret = jwtRefreshSecret;
    this.tokenExpiry = '1h';
    this.refreshTokenExpiry = '7d';
    this.saltRounds = 12;
  }

  // ============================================================================
  // USER REGISTRATION
  // ============================================================================

  async registerUser(email: string, password: string): Promise<{ user: UserProfile; tokens: AuthToken }> {
    // Validate email format
    if (!UserProfileValidator.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Validate password strength
    this.validatePassword(password);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.saltRounds);

    // Create user profile
    const userId = generateUUID();
    const now = new Date().toISOString();

    const userProfile: UserProfile = {
      id: userId,
      email,
      preferences: UserProfileUtils.createDefaultPreferences(),
      skillLevels: new Map(),
      learningGoals: [],
      progressHistory: [],
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };

    const stmt = db.prepare(`
        INSERT INTO users (id, email, password_hash, preferences, skill_levels, learning_goals, progress_history, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      userId,
      email,
      hashedPassword,
      JSON.stringify(userProfile.preferences),
      JSON.stringify(Object.fromEntries(userProfile.skillLevels)),
      JSON.stringify(userProfile.learningGoals),
      JSON.stringify(userProfile.progressHistory),
      now,
      now
    );

    // Generate tokens
    const tokens = this.generateTokens(userId, email);

    // Create session
    this.createSession(userId, email);

    return { user: userProfile, tokens };
  }

  // ============================================================================
  // USER LOGIN
  // ============================================================================

  async loginUser(email: string, password: string): Promise<{ user: UserProfile; tokens: AuthToken }> {
    // Find user by email
    const userRecord: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!userRecord) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userRecord.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Reconstruct UserProfile
    const user: UserProfile = {
      id: userRecord.id,
      email: userRecord.email,
      preferences: JSON.parse(userRecord.preferences),
      skillLevels: new Map(Object.entries(JSON.parse(userRecord.skill_levels))),
      learningGoals: JSON.parse(userRecord.learning_goals),
      progressHistory: JSON.parse(userRecord.progress_history),
      createdAt: new Date(userRecord.created_at),
      updatedAt: new Date(userRecord.updated_at)
    };

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    // Update or create session
    this.createSession(user.id, user.email);

    // Update last activity (updated_at)
    db.prepare('UPDATE users SET updated_at = ? WHERE id = ?').run(new Date().toISOString(), user.id);

    return { user, tokens };
  }

  // ============================================================================
  // TOKEN MANAGEMENT
  // ============================================================================

  generateTokens(userId: string, email: string): AuthToken {
    const accessToken = jwt.sign(
      { userId, email },
      this.jwtSecret,
      { expiresIn: this.tokenExpiry } as jwt.SignOptions
    );

    const refreshToken = jwt.sign(
      { userId, email, type: 'refresh' },
      this.jwtRefreshSecret,
      { expiresIn: this.refreshTokenExpiry } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour in seconds
    };
  }

  verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  verifyRefreshToken(refreshToken: string): TokenPayload {
    try {
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as TokenPayload & { type: string };

      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      return payload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthToken> {
    const payload = this.verifyRefreshToken(refreshToken);

    // Verify user still exists
    const userExists = db.prepare('SELECT 1 FROM users WHERE id = ?').get(payload.userId);
    if (!userExists) {
      throw new Error('User not found');
    }

    const session = this.getSession(payload.userId);
    if (!session || !session.isActive) {
      throw new Error('Session expired');
    }

    // Generate new tokens
    return this.generateTokens(payload.userId, payload.email);
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  createSession(userId: string, email: string): SessionData {
    const now = new Date().toISOString();

    // Upsert session
    const stmt = db.prepare(`
        INSERT INTO auth_sessions (user_id, email, last_activity, is_active, metadata)
        VALUES (?, ?, ?, 1, '{}')
        ON CONFLICT(user_id) DO UPDATE SET
        last_activity = excluded.last_activity,
        is_active = 1
    `);

    stmt.run(userId, email, now);

    return {
      userId,
      email,
      lastActivity: new Date(now),
      isActive: true,
      metadata: {}
    };
  }

  getSession(userId: string): SessionData | null {
    const row: any = db.prepare('SELECT * FROM auth_sessions WHERE user_id = ?').get(userId);
    if (!row) return null;

    return {
      userId: row.user_id,
      email: row.email,
      lastActivity: new Date(row.last_activity),
      isActive: Boolean(row.is_active),
      metadata: JSON.parse(row.metadata)
    };
  }

  updateSessionActivity(userId: string): void {
    const now = new Date().toISOString();
    db.prepare('UPDATE auth_sessions SET last_activity = ? WHERE user_id = ?').run(now, userId);
  }

  endSession(userId: string): void {
    db.prepare('UPDATE auth_sessions SET is_active = 0 WHERE user_id = ?').run(userId);
  }

  cleanupExpiredSessions(): void {
    // 24 hours ago
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE auth_sessions SET is_active = 0 WHERE last_activity < ?').run(cutoff);
  }

  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const userRecord: any = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!userRecord) return null;

    return {
      id: userRecord.id,
      email: userRecord.email,
      preferences: JSON.parse(userRecord.preferences),
      skillLevels: new Map(Object.entries(JSON.parse(userRecord.skill_levels))),
      learningGoals: JSON.parse(userRecord.learning_goals),
      progressHistory: JSON.parse(userRecord.progress_history),
      createdAt: new Date(userRecord.created_at),
      updatedAt: new Date(userRecord.updated_at)
    };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userId);
    if (!existingProfile) {
      throw new Error('User not found');
    }

    // Validate updates
    const validatedUpdates = UserProfileValidator.validatePartialUserProfile(updates);

    // Merge updates
    const updatedProfile: UserProfile = {
      ...existingProfile,
      ...validatedUpdates,
      updatedAt: new Date()
    };

    // Update DB
    const stmt = db.prepare(`
        UPDATE users SET 
        preferences = ?,
        skill_levels = ?,
        learning_goals = ?,
        progress_history = ?,
        updated_at = ?
        WHERE id = ?
    `);

    stmt.run(
      JSON.stringify(updatedProfile.preferences),
      JSON.stringify(Object.fromEntries(updatedProfile.skillLevels)),
      JSON.stringify(updatedProfile.learningGoals),
      JSON.stringify(updatedProfile.progressHistory),
      updatedProfile.updatedAt.toISOString(),
      userId
    );

    return updatedProfile;
  }

  async deleteUser(userId: string): Promise<void> {
    // Transaction
    const deleteUserTransaction = db.transaction(() => {
      db.prepare('DELETE FROM auth_sessions WHERE user_id = ?').run(userId);
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    });
    deleteUserTransaction();
  }

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const userRecord: any = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    if (!userRecord) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidCurrentPassword = await bcrypt.compare(currentPassword, userRecord.password_hash);
    if (!isValidCurrentPassword) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash and store new password
    const hashedNewPassword = await bcrypt.hash(newPassword, this.saltRounds);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashedNewPassword, userId);
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  isSessionActive(userId: string): boolean {
    const session = this.getSession(userId);
    return session ? session.isActive : false;
  }

  getActiveSessionsCount(): number {
    const result: any = db.prepare('SELECT COUNT(*) as count FROM auth_sessions WHERE is_active = 1').get();
    return result.count;
  }

  getAllUsers(): UserProfile[] {
    // This is expensive, but keeping signature
    const rows = db.prepare('SELECT * FROM users').all();
    return rows.map((userRecord: any) => ({
      id: userRecord.id,
      email: userRecord.email,
      preferences: JSON.parse(userRecord.preferences),
      skillLevels: new Map(Object.entries(JSON.parse(userRecord.skill_levels))),
      learningGoals: JSON.parse(userRecord.learning_goals),
      progressHistory: JSON.parse(userRecord.progress_history),
      createdAt: new Date(userRecord.created_at),
      updatedAt: new Date(userRecord.updated_at)
    }));
  }

  getUserByEmail(email: string): UserProfile | null {
    const userRecord: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!userRecord) return null;

    return {
      id: userRecord.id,
      email: userRecord.email,
      preferences: JSON.parse(userRecord.preferences),
      skillLevels: new Map(Object.entries(JSON.parse(userRecord.skill_levels))),
      learningGoals: JSON.parse(userRecord.learning_goals),
      progressHistory: JSON.parse(userRecord.progress_history),
      createdAt: new Date(userRecord.created_at),
      updatedAt: new Date(userRecord.updated_at)
    };
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function createAuthMiddleware(authService: AuthService) {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    try {
      const payload = authService.verifyToken(token);
      req.user = payload;

      // Update session activity
      authService.updateSessionActivity(payload.userId);

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

// ============================================================================
// ERROR CLASSES
// ============================================================================

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class SessionError extends Error {
  constructor(message: string) {
    super(message);
  }
}