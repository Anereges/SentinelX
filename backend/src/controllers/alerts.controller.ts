import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class AlertsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, severity, assignedTo, limit = 50, page = 1 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (status) where.status = status as string;
      if (severity) where.severity = severity as string;
      if (assignedTo) where.assignedToId = assignedTo as string;

      const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
          where,
          include: {
            rule: true,
            assignedTo: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            incident: {
              select: {
                id: true,
                title: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.alert.count({ where }),
      ]);

      res.json({
        success: true,
        data: alerts,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch alerts',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const alert = await prisma.alert.findUnique({
        where: { id },
        include: {
          rule: true,
          event: true,
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          incident: {
            include: {
              assignedTo: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
        return;
      }

      res.json({
        success: true,
        data: alert,
      });
    } catch (error) {
      console.error('Error fetching alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch alert',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, assignedToId } = req.body;

      const alert = await prisma.alert.findUnique({
        where: { id },
      });

      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
        return;
      }

      const updatedAlert = await prisma.alert.update({
        where: { id },
        data: {
          status: status || alert.status,
          assignedToId: assignedToId || alert.assignedToId,
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: updatedAlert,
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update alert',
      });
    }
  }

  async createIncidentFromAlert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, severity } = req.body;

      const alert = await prisma.alert.findUnique({
        where: { id },
      });

      if (!alert) {
        res.status(404).json({
          success: false,
          error: 'Alert not found',
        });
        return;
      }

      // Create incident
      const incident = await prisma.incident.create({
        data: {
          title: title || `Incident from alert: ${alert.title}`,
          description: description || alert.description || '',
          severity: severity || alert.severity,
          status: 'OPEN',
          assignedToId: req.user?.userId,
          alerts: {
            connect: { id: alert.id },
          },
        },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Update alert to link to incident
      await prisma.alert.update({
        where: { id },
        data: {
          incidentId: incident.id,
          status: 'INVESTIGATING',
        },
      });

      res.json({
        success: true,
        data: incident,
      });
    } catch (error) {
      console.error('Error creating incident from alert:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create incident',
      });
    }
  }
}