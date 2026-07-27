import { api } from './api';

export interface Notification {
  id: string;
  type: 'alert' | 'incident' | 'system';
  title: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  timestamp: string;
  read: boolean;
  link?: string;
}

class NotificationService {
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private notifications: Notification[] = [];
  private pollInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;

  constructor() {
    // Only start polling in browser environment
    if (typeof window !== 'undefined') {
      // Check if user is logged in before starting
      const token = localStorage.getItem('token');
      if (token) {
        this.startPolling();
      }
    }
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  async fetchNotifications() {
    // Only run in browser
    if (typeof window === 'undefined') return this.notifications;
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      this.notifications = [];
      this.notifyListeners();
      return this.notifications;
    }

    try {
      // Fetch recent alerts
      const alertsResponse = await api.get('/alerts', {
        params: { limit: 10, status: 'NEW' }
      });
      
      const newAlerts = alertsResponse.data.data || [];
      
      // Fetch recent incidents
      const incidentsResponse = await api.get('/incidents', {
        params: { limit: 5, status: 'OPEN' }
      });
      
      const newIncidents = incidentsResponse.data.data || [];

      // Convert alerts to notifications
      const alertNotifications: Notification[] = newAlerts.map((alert: any) => ({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: alert.title || 'New Alert',
        message: alert.description || `Alert from ${alert.sourceIp || 'unknown source'}`,
        severity: alert.severity || 'MEDIUM',
        timestamp: alert.createdAt || new Date().toISOString(),
        read: false,
        link: `/alerts/${alert.id}`
      }));

      // Convert incidents to notifications
      const incidentNotifications: Notification[] = newIncidents.map((incident: any) => ({
        id: `incident-${incident.id}`,
        type: 'incident',
        title: incident.title || 'New Incident',
        message: incident.description || `Incident ${incident.status}`,
        severity: incident.severity || 'HIGH',
        timestamp: incident.createdAt || new Date().toISOString(),
        read: false,
        link: `/incidents/${incident.id}`
      }));

      // Combine and sort by timestamp (newest first)
      const allNotifications = [...alertNotifications, ...incidentNotifications];
      allNotifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      this.notifications = allNotifications.slice(0, 20);
      this.notifyListeners();

      return this.notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return this.notifications;
    }
  }

  startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    
    this.fetchNotifications();
    
    this.pollInterval = setInterval(() => {
      // Check if user is still logged in
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (!token) {
          this.stopPolling();
          this.notifications = [];
          this.notifyListeners();
          return;
        }
      }
      this.fetchNotifications();
    }, 30000); // Poll every 30 seconds
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  getNotifications(): Notification[] {
    return this.notifications;
  }
}

// Singleton instance - only create in browser
export const notificationService = typeof window !== 'undefined' 
  ? new NotificationService() 
  : new NotificationService();