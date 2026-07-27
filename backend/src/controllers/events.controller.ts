import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { search, eventType, severity, dateRange, limit = 50, page = 1 } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      if (eventType) where.eventType = eventType as string;
      if (severity) where.severity = severity as string;
      
      // Date range filter
      if (dateRange) {
        const now = new Date();
        let startDate = new Date(now);
        switch (dateRange) {
          case '1h':
            startDate.setHours(now.getHours() - 1);
            break;
          case '24h':
            startDate.setDate(now.getDate() - 1);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }
        where.timestamp = { gte: startDate };
      }
      
      // Search filter - search across multiple fields
      if (search) {
        const searchTerm = search as string;
        where.OR = [
          { sourceIp: { contains: searchTerm } },
          { destinationIp: { contains: searchTerm } },
          { username: { contains: searchTerm } },
          { hostname: { contains: searchTerm } },
          { eventType: { contains: searchTerm } },
          { message: { contains: searchTerm } },
          { command: { contains: searchTerm } },
          { processName: { contains: searchTerm } },
        ];
      }

      const [events, total] = await Promise.all([
        prisma.securityEvent.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          skip,
          take: Number(limit),
          include: {
            agent: {
              select: {
                name: true,
                hostname: true,
              },
            },
          },
        }),
        prisma.securityEvent.count({ where }),
      ]);

      res.json({
        success: true,
        data: events,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch events',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const event = await prisma.securityEvent.findUnique({
        where: { id },
        include: {
          agent: true,
          alerts: true,
        },
      });

      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Event not found',
        });
        return;
      }

      res.json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error('Error fetching event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch event',
      });
    }
  }
}