'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { incidentsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  User,
  Calendar,
  AlertCircle,
  Plus,
  X,
  Edit,
  Save,
  Trash2
} from 'lucide-react';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
  } | null;
  alerts: {
    id: string;
    title: string;
    severity: string;
    status: string;
  }[];
  notes: {
    id: string;
    content: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  timeline: {
    id: string;
    event: string;
    details: string;
    createdAt: string;
  }[];
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

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteLoading, setNoteLoading] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState('');

  const incidentId = params.id as string;

  useEffect(() => {
    if (incidentId) {
      fetchIncident();
      fetchUsers();
    }
  }, [incidentId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchIncident = async () => {
    try {
      const response = await incidentsApi.getById(incidentId);
      setIncident(response.data.data);
      setNewStatus(response.data.data.status);
      if (response.data.data.assignedTo) {
        setSelectedUser(response.data.data.assignedTo.id);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch incident');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setNoteLoading(true);
    try {
      await incidentsApi.addNote(incidentId, { content: newNote });
      setNewNote('');
      setShowNoteForm(false);
      await fetchIncident();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add note');
    } finally {
      setNoteLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const updateData: any = { status: newStatus };
      
      if (selectedUser) {
        updateData.assignedToId = selectedUser;
      }

      await incidentsApi.update(incidentId, updateData);
      setShowStatusUpdate(false);
      await fetchIncident();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update incident');
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
        return <AlertTriangle className="w-5 h-5" />;
      case 'INVESTIGATING':
        return <Clock className="w-5 h-5" />;
      case 'CONTAINMENT':
        return <Shield className="w-5 h-5" />;
      case 'ERADICATION':
        return <CheckCircle className="w-5 h-5" />;
      case 'RECOVERY':
        return <Clock className="w-5 h-5" />;
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
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

  if (error || !incident) {
    return (
      <Layout>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg">{error || 'Incident not found'}</p>
          <button
            onClick={() => router.push('/incidents')}
            className="mt-4 text-blue-400 hover:text-blue-300"
          >
            ← Back to Incidents
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/incidents')}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{incident.title}</h1>
              <p className="text-sm text-gray-400">Incident ID: {incident.id.substring(0, 8)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowStatusUpdate(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Edit className="w-4 h-4" />
            Update Status
          </button>
        </div>

        {/* Status Update Modal */}
        {showStatusUpdate && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Update Incident</h2>
                <button
                  onClick={() => setShowStatusUpdate(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="INVESTIGATING">INVESTIGATING</option>
                    <option value="CONTAINMENT">CONTAINMENT</option>
                    <option value="ERADICATION">ERADICATION</option>
                    <option value="RECOVERY">RECOVERY</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Assign To
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Update
                  </button>
                  <button
                    onClick={() => setShowStatusUpdate(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Incident Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Incident Details */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <p className="text-gray-300">{incident.description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-sm text-gray-300">{formatDate(incident.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Updated</p>
                  <p className="text-sm text-gray-300">{formatDate(incident.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-sm text-gray-300">{incident.category || 'Uncategorized'}</p>
                </div>
                {incident.resolvedAt && (
                  <div>
                    <p className="text-xs text-gray-400">Resolved</p>
                    <p className="text-sm text-gray-300">{formatDate(incident.resolvedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Associated Alerts */}
            {incident.alerts && incident.alerts.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Associated Alerts ({incident.alerts.length})
                </h3>
                <div className="space-y-2">
                  {incident.alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3">
                      <div>
                        <p className="text-sm text-white">{alert.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity}
                          </span>
                          <span className="text-xs text-gray-500">{alert.status}</span>
                        </div>
                      </div>
                      <button className="text-sm text-blue-400 hover:text-blue-300">
                        View Alert
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Notes ({incident.notes?.length || 0})
                </h3>
                <button
                  onClick={() => setShowNoteForm(!showNoteForm)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Note
                </button>
              </div>

              {showNoteForm && (
                <form onSubmit={handleAddNote} className="mb-4">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Add investigation notes..."
                    required
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={noteLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
                    >
                      {noteLoading ? 'Saving...' : 'Save Note'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {incident.notes?.length === 0 ? (
                  <p className="text-sm text-gray-400">No notes yet.</p>
                ) : (
                  incident.notes.map((note) => (
                    <div key={note.id} className="bg-gray-800/50 rounded-lg p-3">
                      <p className="text-sm text-gray-300">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-400">{note.author?.name || 'Unknown'}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Status & Timeline */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Status</h3>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStatusColor(incident.status)}`}>
                {getStatusIcon(incident.status)}
                <span className="text-sm font-medium">{incident.status}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-400">Assigned to</p>
                <p className="text-sm text-gray-300">
                  {incident.assignedTo?.name || 'Unassigned'}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-4">Timeline</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {incident.timeline?.length === 0 ? (
                  <p className="text-sm text-gray-400">No timeline events.</p>
                ) : (
                  incident.timeline?.map((event) => (
                    <div key={event.id} className="relative pl-6 border-l border-gray-700 pb-4 last:pb-0">
                      <div className="absolute left-[-6px] top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-white">{event.event}</p>
                      {event.details && (
                        <p className="text-xs text-gray-400 mt-1">{event.details}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatDate(event.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}