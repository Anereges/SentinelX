'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  Server, 
  Plus, 
  X, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Clock,
  Copy,
  Eye
} from 'lucide-react';
import { agentsApi } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  hostname: string;
  os: string | null;
  ipAddress: string | null;
  version: string | null;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  lastHeartbeatAt: string | null;
  connectedAt: string | null;
  disconnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    events: number;
  };
}

export default function AgentsPage() {
  const { isAdmin, isAnalyst } = usePermissions();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    os: '',
    ipAddress: '',
    version: '1.0.0',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await agentsApi.getAll();
      setAgents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setActionLoading(true);

    if (!formData.name || !formData.hostname) {
      setFormError('Name and hostname are required');
      setActionLoading(false);
      return;
    }

    try {
      const response = await agentsApi.create(formData);
      await fetchAgents();
      setShowCreateModal(false);
      setFormData({ name: '', hostname: '', os: '', ipAddress: '', version: '1.0.0' });
      setSuccessMessage(`Agent "${response.data.data.name}" created successfully!`);
      
      // Show token after creation
      setSelectedAgent(response.data.data);
      setGeneratedToken(`agent_${response.data.data.id}_${Date.now()}`);
      setShowTokenModal(true);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to create agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    setFormError('');
    setActionLoading(true);

    try {
      await agentsApi.update(selectedAgent.id, formData);
      await fetchAgents();
      setShowEditModal(false);
      setSuccessMessage(`Agent "${selectedAgent.name}" updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setFormError(error.response?.data?.error || 'Failed to update agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAgent = async () => {
    if (!selectedAgent) return;

    setActionLoading(true);
    try {
      await agentsApi.delete(selectedAgent.id);
      await fetchAgents();
      setShowDeleteModal(false);
      setSuccessMessage(`Agent "${selectedAgent.name}" deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete agent');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHeartbeat = async (agentId: string) => {
  try {
    setActionLoading(true);
    const response = await agentsApi.heartbeat(agentId, { status: 'ONLINE' });
    console.log('Heartbeat response:', response.data);
    await fetchAgents();
    setSuccessMessage('Heartbeat sent successfully! Agent is now online.');
    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (error: any) {
    console.error('Failed to send heartbeat:', error);
    alert(error.response?.data?.error || 'Failed to send heartbeat. Please try again.');
  } finally {
    setActionLoading(false);
  }
};

  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      hostname: agent.hostname,
      os: agent.os || '',
      ipAddress: agent.ipAddress || '',
      version: agent.version || '1.0.0',
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDeleteModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'OFFLINE':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return <CheckCircle className="w-4 h-4" />;
      case 'OFFLINE':
        return <XCircle className="w-4 h-4" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  const copyToken = () => {
    navigator.clipboard.writeText(generatedToken);
    alert('Token copied to clipboard!');
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Agents</h1>
            <p className="text-gray-400 mt-1">Monitor and manage security agents across your infrastructure</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add Agent
            </button>
          )}
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Agents Grid */}
        <div className="grid gap-4">
          {agents.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <div className="text-gray-400">
                <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No agents found</p>
                <p className="text-sm mt-2">
                  {isAdmin 
                    ? 'Click "Add Agent" to deploy a new security agent'
                    : 'Contact an administrator to add agents'}
                </p>
              </div>
            </div>
          ) : (
            agents.map((agent) => (
              <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-2 bg-gray-800 rounded-lg">
                      <Server className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(agent.status)}`}>
                          {getStatusIcon(agent.status)}
                          {agent.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{agent.hostname}</p>
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        {agent.os && (
                          <span className="text-gray-400">{agent.os}</span>
                        )}
                        {agent.ipAddress && (
                          <span className="text-gray-400">• {agent.ipAddress}</span>
                        )}
                        {agent.version && (
                          <span className="text-gray-400">• v{agent.version}</span>
                        )}
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400 flex items-center gap-1">
                          <Activity className="w-3 h-3" />
                          {agent._count?.events || 0} events
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Created: {formatDate(agent.createdAt)}</span>
                        <span>Last Heartbeat: {formatDate(agent.lastHeartbeatAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => openEditModal(agent)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Edit Agent"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(agent)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Agent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {(isAdmin || isAnalyst) && (
                      <button
                        onClick={() => handleHeartbeat(agent.id)}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                      >
                        Send Heartbeat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Agent Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Add New Agent</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAgent} className="space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Production Server 01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hostname *
                  </label>
                  <input
                    type="text"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="prod-server-01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operating System
                  </label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Ubuntu 22.04"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="192.168.1.100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="1.0.0"
                  />
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    💡 After creation, you'll receive an agent token to configure the agent on your system.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create Agent'}
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

        {/* Edit Agent Modal */}
        {showEditModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Edit Agent</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditAgent} className="space-y-4">
                {formError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Agent Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hostname *
                  </label>
                  <input
                    type="text"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Operating System
                  </label>
                  <input
                    type="text"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    IP Address
                  </label>
                  <input
                    type="text"
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Agent Modal */}
        {showDeleteModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Delete Agent</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">
                  <AlertCircle className="w-5 h-5 inline mr-2" />
                  Are you sure you want to delete <strong>{selectedAgent.name}</strong>?
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  This action cannot be undone. All associated events will be removed.
                </p>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleDeleteAgent}
                  disabled={actionLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Token Display Modal */}
        {showTokenModal && selectedAgent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Agent Token</h2>
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    setSelectedAgent(null);
                    setGeneratedToken('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-4">
                <p className="text-green-400 text-sm font-medium">
                  ✅ Agent Created Successfully!
                </p>
              </div>

              <p className="text-sm text-gray-400 mb-2">
                Use this token to authenticate your agent with SentinelX:
              </p>

              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <code className="text-sm text-blue-400 break-all">{generatedToken}</code>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={copyToken}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Token
                </button>
                <button
                  onClick={() => {
                    setShowTokenModal(false);
                    setSelectedAgent(null);
                    setGeneratedToken('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Store this token securely. It will not be shown again.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}