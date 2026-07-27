import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UsersController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, role, isActive, password } = req.body;

      // Only admins can update users
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Admin role required.',
        });
        return;
      }

      // Prevent modifying yourself
      if (id === req.user?.userId) {
        res.status(400).json({
          success: false,
          error: 'You cannot modify your own account through this endpoint',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Build update data
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name.trim();
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // If password is provided, hash it
      if (password) {
        if (password.length < 8) {
          res.status(400).json({
            success: false,
            error: 'Password must be at least 8 characters',
          });
          return;
        }
        updateData.password = await bcrypt.hash(password, 12);
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Log the update
      console.log(`User ${req.user?.email} updated user ${updatedUser.email}`);

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user',
      });
    }
  }

  async deactivate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Only admins can deactivate users
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Admin role required.',
        });
        return;
      }

      // Prevent deactivating yourself
      if (id === req.user?.userId) {
        res.status(400).json({
          success: false,
          error: 'You cannot deactivate your own account',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      // Log the deactivation
      console.log(`User ${req.user?.email} deactivated user ${updatedUser.email}`);

      res.json({
        success: true,
        data: updatedUser,
        message: 'User deactivated successfully',
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to deactivate user',
      });
    }
  }

  async activate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Only admins can activate users
      if (req.user?.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions. Admin role required.',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: true },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User activated successfully',
      });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to activate user',
      });
    }
  }
}