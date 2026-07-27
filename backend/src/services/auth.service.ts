import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Common weak passwords to block
const COMMON_PASSWORDS = [
  'password123', '12345678', 'qwerty123', 'admin123', 
  'password', '123456789', 'qwerty', 'abc123', 
  'letmein', 'welcome', 'monkey', 'dragon'
];

export class AuthService {
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a stronger password');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async register(email: string, password: string, name?: string) {
    // Validate email format
    if (!this.validateEmail(email)) {
      throw new AppError(400, 'Invalid email format');
    }

    // Check if user exists (case insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.errors.join('. '));
    }

    // Validate name if provided
    if (name && name.trim().length < 2) {
      throw new AppError(400, 'Name must be at least 2 characters');
    }

    // Hash password with higher salt rounds for security
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with normalized email
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name?.trim() || null,
        role: 'VIEWER'
      }
    });

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    // Log registration (audit)
    await this.logAudit(user.id, 'REGISTER', user.email);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async login(email: string, password: string, ipAddress?: string) {
    // Find user (case insensitive)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Use same message for security (don't reveal if user exists)
      throw new AppError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Account is deactivated. Please contact support.');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Log failed attempt
      await this.logAudit(user.id, 'LOGIN_FAILED', user.email, ipAddress);
      throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = this.generateToken(user.id, user.email, user.role);

    // Log successful login
    await this.logAudit(user.id, 'LOGIN_SUCCESS', user.email, ipAddress);

    return {
      user: this.sanitizeUser(user),
      token
    };
  }

  async logout(userId: string) {
    await this.logAudit(userId, 'LOGOUT', 'User logged out');
    return { success: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(400, passwordValidation.errors.join('. '));
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    // Log password change
    await this.logAudit(userId, 'PASSWORD_CHANGED', 'Password changed');

    return { success: true };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return this.sanitizeUser(user);
  }

  generateToken(userId: string, email: string, role: string) {
    const payload = { userId, email, role };
    return jwt.sign(payload, JWT_SECRET, { 
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] 
    });
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new AppError(401, 'Invalid or expired token');
    }
  }

  sanitizeUser(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async logAudit(actorId: string, action: string, target?: string, ipAddress?: string) {
    try {
      // Convert details to JSON string for SQLite compatibility
      const detailsJson = JSON.stringify({ 
        timestamp: new Date().toISOString(),
        userAgent: 'SentinelX Backend'
      });

      await prisma.auditLog.create({
        data: {
          actorId,
          action,
          target,
          ipAddress,
          details: detailsJson
        }
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Audit log failed:', error);
    }
  }
}