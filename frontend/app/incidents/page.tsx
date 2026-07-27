'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { incidentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, AlertTriangle, CheckCircle, Clock, Plus, X, User, Calendar, AlertCircle } from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  alerts: { id: string; title: string; severity: string }[];
  notes: { id: string; content: string; createdAt: string }[];
}

const statusColors = {
  OPEN: 'bg-red-500/10 text-red-500 border-red-500/20',
  INVESTIGATING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  CONTAINMENT: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  ERADICATION: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  RECOVERY: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CLOSED: 'bg-green-500/10 text-green-500 border-green-500/20',
};

const severityColors = {
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  LOW: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  // New Incident Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM',
    category: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await incidentsApi.getAll();
      setIncidents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    return statusColors[status as keyof typeof statusColors] || statusColors.OPEN;
  };

  const getSeverityColor = (severity: string) => {
    return severityColors[severity as keyof typeof severityColors] || severityColors.MEDIUM;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <AlertTriangle className="w-4 h-4" />;
      case 'INVESTIGATING':
        return <Clock className="w-4 h-4" />;
      case 'CONTAINMENT':
        return <Shield className="w-4 h-4" />;
      case 'ERADICATION':
        return <CheckCircle className="w-4 h-4" />;
      case 'RECOVERY':
        return <Clock className="w-4 h-4" />;
      case 'CLOSED':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    if (!formData.title.trim()) {
      setFormError('Title is required');
      setFormLoading(false);
      return;
    }

    try {
      const response = await incidentsApi.create({
        title: formData.title,
        description: formData.description || 'No description provided',
        severity: formData.severity,
        category: formData.category || 'General',
        assignedToId: user?.id,
      });
      
      setShowCreateModal(false);
      setFormData({ title: '', description: '', severity: 'MEDIUM', category: '' });
      await fetchIncidents();
      // Navigate to the new incident
      router.push(`/incidents/${response.data.data.id}`);
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to create incident');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewDetails = (incidentId: string) => {
    router.push(`/incidents/${incidentId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Incidents</h1>
            <p className="text-gray-400 mt-1">Manage security incidents and response</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Incident
          </button>
        </div>

        {/* Incidents Grid */}
        <div className="grid gap-4">
          {incidents.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <div className="text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No incidents found</p>
                <p className="text-sm mt-2">Create your first incident from an alert or click "New Incident"</p>
              </div>
            </div>
          ) : (
            incidents.map((incident) => (
              <div key={incident.id} className="bg-gray-900 border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => handleViewDetails(incident.id)}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(incident.status)}`}>
                        {getStatusIcon(incident.status)}
                        {incident.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      {incident.category && (
                        <span className="text-xs text-gray-500">{incident.category}</span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(incident.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className="text-white font-medium mb-1">{incident.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{incident.description}</p>
                    
                    <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                      {incident.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Assigned to: {incident.assignedTo.name}
                        </span>
                      )}
                      <span>{incident.alerts?.length || 0} associated alerts</span>
                      <span>{incident.notes?.length || 0} notes</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetails(incident.id)}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Incident Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Create New Incident</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateIncident} className="space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 flex items-start gap-3 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter incident title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Describe the incident..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="e.g., Network, Malware, Policy"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {formLoading ? 'Creating...' : 'Create Incident'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}