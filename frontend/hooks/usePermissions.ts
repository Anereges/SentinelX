'use client';

import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'ADMIN' | 'SECURITY_ANALYST' | 'VIEWER';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role as UserRole;

  const isAdmin = role === 'ADMIN';
  const isAnalyst = role === 'SECURITY_ANALYST';
  const isViewer = role === 'VIEWER';

  // View permissions
  const canViewAlerts = isAdmin || isAnalyst || isViewer;
  const canViewIncidents = isAdmin || isAnalyst || isViewer;
  const canViewDashboard = isAdmin || isAnalyst || isViewer;
  const canViewThreatHunting = isAdmin || isAnalyst || isViewer;
  const canViewAgents = isAdmin || isAnalyst;
  const canViewUsers = isAdmin || isAnalyst || isViewer;
  
  // Write permissions
  const canUpdateAlerts = isAdmin || isAnalyst;
  const canCreateAlerts = isAdmin || isAnalyst;
  const canCreateIncidents = isAdmin || isAnalyst;
  const canUpdateIncidents = isAdmin || isAnalyst;
  const canManageUsers = isAdmin;
  const canManageAgents = isAdmin;
  const canManageDetectionRules = isAdmin;
  const canChangeSettings = isAdmin || isAnalyst;
  const canViewAuditLogs = isAdmin;

  return {
    role,
    isAdmin,
    isAnalyst,
    isViewer,
    
    // View permissions
    canViewAlerts,
    canViewIncidents,
    canViewDashboard,
    canViewThreatHunting,
    canViewAgents,
    canViewUsers,
    
    // Write permissions
    canCreateAlerts,
    canUpdateAlerts,
    canCreateIncidents,
    canUpdateIncidents,
    canManageUsers,
    canManageAgents,
    canManageDetectionRules,
    canChangeSettings,
    canViewAuditLogs,
  };
}