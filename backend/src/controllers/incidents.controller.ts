import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export class IncidentsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status, severity, assignedTo, limit = 50, page = 1 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      if (status) where.status = status as string;
      if (severity) where.severity = severity as string;
      if (assignedTo) where.assignedToId = assignedTo as string;

      const [incidents, total] = await Promise.all([
        prisma.incident.findMany({
          where,
          include: {
            assignedTo: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
            alerts: {
              select: {
                id: true,
                title: true,
                severity: true,
                status: true,
              },
            },
            notes: {
              include: {
                author: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.incident.count({ where }),
      ]);

      res.json({
        success: true,
        data: incidents,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching incidents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incidents',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const incident = await prisma.incident.findUnique({
        where: { id },
        include: {
          assignedTo: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          alerts: {
            include: {
              rule: true,
              assignedTo: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
          notes: {
            include: {
              author: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          timeline: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!incident) {
        res.status(404).json({
          success: false,
          error: 'Incident not found',
        });
        return;
      }

      res.json({
        success: true,
        data: incident,
      });
    } catch (error) {
      console.error('Error fetching incident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch incident',
      });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, severity, category, assignedToId } = req.body;

      if (!title) {
        res.status(400).json({
          success: false,
          error: 'Title is required',
        });
        return;
      }

      const incident = await prisma.incident.create({
        data: {
          title,
          description,
          severity: severity || 'MEDIUM',
          category,
          status: 'OPEN',
          assignedToId: assignedToId || req.user?.userId,
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

      // Create timeline entry
      await prisma.incidentTimeline.create({
        data: {
          incidentId: incident.id,
          event: 'Incident created',
          details: `Created by ${req.user?.email}`,
        },
      });

      res.status(201).json({
        success: true,
        data: incident,
      });
    } catch (error) {
      console.error('Error creating incident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create incident',
      });
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, severity, status, assignedToId } = req.body;

      const incident = await prisma.incident.findUnique({
        where: { id },
      });

      if (!incident) {
        res.status(404).json({
          success: false,
          error: 'Incident not found',
        });
        return;
      }

      const updatedIncident = await prisma.incident.update({
        where: { id },
        data: {
          title: title || incident.title,
          description: description !== undefined ? description : incident.description,
          severity: severity || incident.severity,
          status: status || incident.status,
          assignedToId: assignedToId !== undefined ? assignedToId : incident.assignedToId,
          resolvedAt: status === 'CLOSED' ? new Date() : incident.resolvedAt,
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

      // Add timeline entry
      await prisma.incidentTimeline.create({
        data: {
          incidentId: incident.id,
          event: `Status updated to ${status || incident.status}`,
          details: `Updated by ${req.user?.email}`,
        },
      });

      res.json({
        success: true,
        data: updatedIncident,
      });
    } catch (error) {
      console.error('Error updating incident:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update incident',
      });
    }
  }

  async addNote(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        res.status(400).json({
          success: false,
          error: 'Note content is required',
        });
        return;
      }

      const note = await prisma.incidentNote.create({
        data: {
          content,
          authorId: req.user!.userId,
          incidentId: id,
        },
        include: {
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Add timeline entry
      await prisma.incidentTimeline.create({
        data: {
          incidentId: id,
          event: 'Note added',
          details: `Added by ${req.user?.email}`,
        },
      });

      res.status(201).json({
        success: true,
        data: note,
      });
    } catch (error) {
      console.error('Error adding note:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add note',
      });
    }
  }

  async getTimeline(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const timeline = await prisma.incidentTimeline.findMany({
        where: { incidentId: id },
        orderBy: { createdAt: 'asc' },
      });

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch timeline',
      });
    }
  }
}