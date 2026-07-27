import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AgentsController {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const agents = await prisma.agent.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { events: true },
          },
        },
      });

      res.json({
        success: true,
        data: agents,
      });
    } catch (error) {
      console.error('Error fetching agents:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agents',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const agent = await prisma.agent.findUnique({
        where: { id },
        include: {
          events: {
            orderBy: { timestamp: 'desc' },
            take: 10,
          },
          _count: {
            select: { events: true },
          },
        },
      });

      if (!agent) {
        res.status(404).json({
          success: false,
          error: 'Agent not found',
        });
        return;
      }

      res.json({
        success: true,
        data: agent,
      });
    } catch (error) {
      console.error('Error fetching agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agent',
      });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, hostname, os, ipAddress, version } = req.body;

      if (!name || !hostname) {
        res.status(400).json({
          success: false,
          error: 'Name and hostname are required',
        });
        return;
      }

      const agent = await prisma.agent.create({
        data: {
          name: name.trim(),
          hostname: hostname.trim(),
          os: os || null,
          ipAddress: ipAddress || null,
          version: version || '1.0.0',
          status: 'OFFLINE',
          connectedAt: new Date(),
        },
      });

      // Generate a token for the agent
      const token = Buffer.from(`${agent.id}:${Date.now()}`).toString('base64');

      res.status(201).json({
        success: true,
        data: agent,
        token: token,
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create agent',
      });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, hostname, os, ipAddress, version, status } = req.body;

      const agent = await prisma.agent.findUnique({
        where: { id },
      });

      if (!agent) {
        res.status(404).json({
          success: false,
          error: 'Agent not found',
        });
        return;
      }

      const updatedAgent = await prisma.agent.update({
        where: { id },
        data: {
          name: name || agent.name,
          hostname: hostname || agent.hostname,
          os: os !== undefined ? os : agent.os,
          ipAddress: ipAddress !== undefined ? ipAddress : agent.ipAddress,
          version: version !== undefined ? version : agent.version,
          status: status || agent.status,
          lastHeartbeatAt: status === 'ONLINE' ? new Date() : agent.lastHeartbeatAt,
        },
      });

      res.json({
        success: true,
        data: updatedAgent,
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update agent',
      });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const agent = await prisma.agent.findUnique({
        where: { id },
      });

      if (!agent) {
        res.status(404).json({
          success: false,
          error: 'Agent not found',
        });
        return;
      }

      // First delete all events associated with this agent
      await prisma.securityEvent.deleteMany({
        where: { agentId: id },
      });

      // Then delete the agent
      await prisma.agent.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Agent deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete agent',
      });
    }
  }

  async heartbeat(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const agent = await prisma.agent.findUnique({
        where: { id },
      });

      if (!agent) {
        res.status(404).json({
          success: false,
          error: 'Agent not found',
        });
        return;
      }

      const updatedAgent = await prisma.agent.update({
        where: { id },
        data: {
          status: status || 'ONLINE',
          lastHeartbeatAt: new Date(),
        },
      });

      res.json({
        success: true,
        data: updatedAgent,
      });
    } catch (error) {
      console.error('Error processing heartbeat:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process heartbeat',
      });
    }
  }
}