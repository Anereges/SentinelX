'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { Users, Shield, User, Eye, Mail, Lock, AlertCircle, X, Edit, Trash2, CheckCircle, UserCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const { isAdmin } = usePermissions();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    password: '',
    isActive: true,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      if (err.response?.status === 403) {
        setError('You need admin privileges to view users.');
      } else {
        setError('Failed to load users. Please try again.');
      }
      if (user) {
        setUsers([{
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt || null,
          createdAt: user.createdAt,
        }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userToEdit: User) => {
    setSelectedUser(userToEdit);
    setEditForm({
      name: userToEdit.name || '',
      role: userToEdit.role,
      password: '',
      isActive: userToEdit.isActive,
    });
    setShowEditModal(true);
  };

  const handleDeactivate = (userToDeactivate: User) => {
    setSelectedUser(userToDeactivate);
    setShowDeactivateModal(true);
  };

  const handleActivate = async (userId: string) => {
    setActionLoading(true);
    try {
      await api.post(`/users/${userId}/activate`);
      await fetchUsers();
      setSuccessMessage('User activated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const updateData: any = {
        name: editForm.name,
        role: editForm.role,
        isActive: editForm.isActive,
      };
      
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      await api.patch(`/users/${selectedUser.id}`, updateData);
      await fetchUsers();
      setShowEditModal(false);
      setSuccessMessage('User updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await api.post(`/users/${selectedUser.id}/deactivate`);
      await fetchUsers();
      setShowDeactivateModal(false);
      setSuccessMessage('User deactivated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to deactivate user');
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-4 h-4 text-red-400" />;
      case 'SECURITY_ANALYST':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'VIEWER':
        return <Eye className="w-4 h-4 text-gray-400" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'SECURITY_ANALYST':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'VIEWER':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Users</h1>
            <p className="text-gray-400 mt-1">
              {isAdmin ? 'Manage user accounts and permissions' : 'View user information'}
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && !isAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg p-4 flex items-start gap-3">
            <Lock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Limited Access</p>
              <p className="text-sm opacity-80">{error}</p>
              <p className="text-xs mt-1 opacity-60">You can view user information but cannot make changes.</p>
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Last Login</th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((userItem) => (
                  <tr key={userItem.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {userItem.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-white">{userItem.name}</span>
                        {userItem.id === user?.id && (
                          <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Mail className="w-4 h-4 text-gray-500" />
                        {userItem.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getRoleColor(userItem.role)}`}>
                        {getRoleIcon(userItem.role)}
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userItem.isActive 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {userItem.lastLoginAt ? new Date(userItem.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4">
                        {userItem.id !== user?.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(userItem)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {userItem.isActive ? (
                              <button
                                onClick={() => handleDeactivate(userItem)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Deactivate User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(userItem.id)}
                                className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                                title="Activate User"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Cannot modify self</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!isAdmin && users.length > 0 && (
          <div className="text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
            <span className="text-yellow-400">👁️ View-only mode</span> — You can view users but cannot make changes
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Edit User</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SECURITY_ANALYST">Security Analyst</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    New Password (optional)
                  </label>
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
                    placeholder="Leave blank to keep current password"
                    minLength={8}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters if provided</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-4 h-4 bg-gray-800 border-gray-700 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">
                    Account Active
                  </label>
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

        {/* Deactivate Modal */}
        {showDeactivateModal && selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full p-6 border border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Deactivate User</h2>
                <button
                  onClick={() => setShowDeactivateModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 inline mr-2" />
                    Are you sure you want to deactivate <strong>{selectedUser.name}</strong>?
                  </p>
                  <p className="text-gray-400 text-xs mt-2">
                    This user will lose access to the platform. This action can be reversed.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleDeactivateConfirm}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Confirm Deactivate'}
                  </button>
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}