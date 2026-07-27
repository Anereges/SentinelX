'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { settingsStore, AppSettings } from '@/lib/settingsStore';
import {
  User,
  Bell,
  Shield,
  Database,
  Palette,
  Key,
  Globe,
  Mail,
  Zap,
  Moon,
  Sun,
  Monitor,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Server,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Fingerprint,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  AlertTriangle
} from 'lucide-react';

// General Settings Component
function GeneralSettings() {
  const { user, changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setMessage('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              value={user?.name || ''}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Your name"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="your@email.com"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
            <div className="w-full bg-gray-800 text-gray-300 rounded-lg px-4 py-2 border border-gray-700">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user?.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                user?.role === 'SECURITY_ANALYST' ? 'bg-blue-500/10 text-blue-400' :
                'bg-gray-500/10 text-gray-400'
              }`}>
                {user?.role || 'User'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Login</label>
            <div className="w-full bg-gray-800 text-gray-300 rounded-lg px-4 py-2 border border-gray-700">
              {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
        
        {message && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 flex items-center gap-3 text-sm mb-4">
            <CheckCircle className="w-5 h-5" />
            <span>{message}</span>
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 flex items-center gap-3 text-sm mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 pr-10 border border-gray-700 focus:border-blue-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
              required
            />
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Appearance Settings Component
function AppearanceSettings() {
  const [settings, setSettings] = useState<AppSettings>(settingsStore.getSettings());

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = settingsStore.updateSettings({ [key]: value });
    setSettings(newSettings);
    
    if (key === 'theme') {
      settingsStore.setTheme(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => updateSetting('theme', 'dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Moon className={`w-8 h-8 mx-auto mb-2 ${settings.theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${settings.theme === 'dark' ? 'text-white' : 'text-gray-400'}`}>Dark</p>
          </button>
          <button
            onClick={() => updateSetting('theme', 'light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'light' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Sun className={`w-8 h-8 mx-auto mb-2 ${settings.theme === 'light' ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${settings.theme === 'light' ? 'text-white' : 'text-gray-400'}`}>Light</p>
          </button>
          <button
            onClick={() => updateSetting('theme', 'system')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.theme === 'system' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <Monitor className={`w-8 h-8 mx-auto mb-2 ${settings.theme === 'system' ? 'text-blue-400' : 'text-gray-400'}`} />
            <p className={`text-sm font-medium ${settings.theme === 'system' ? 'text-white' : 'text-gray-400'}`}>System</p>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          Current theme: <span className="text-blue-400 capitalize">{settings.theme}</span>
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Compact Mode</p>
              <p className="text-sm text-gray-400">Reduce spacing and padding throughout the interface</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.compact}
                onChange={() => updateSetting('compact', !settings.compact)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-medium">Animations & Transitions</p>
              <p className="text-sm text-gray-400">Enable smooth animations throughout the interface</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.animations}
                onChange={() => updateSetting('animations', !settings.animations)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
        <p className="text-xs text-gray-400 text-center">
          Settings are saved automatically to your browser storage
        </p>
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings() {
  const [settings, setSettings] = useState<AppSettings>(settingsStore.getSettings());

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = settingsStore.updateSettings({ [key]: value });
    setSettings(newSettings);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Alert Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Alerts</p>
              <p className="text-sm text-gray-400">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailAlerts}
                onChange={() => updateSetting('emailAlerts', !settings.emailAlerts)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-medium">Critical Alerts</p>
              <p className="text-sm text-gray-400">Notify for CRITICAL severity alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.criticalAlerts}
                onChange={() => updateSetting('criticalAlerts', !settings.criticalAlerts)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-medium">High Alerts</p>
              <p className="text-sm text-gray-400">Notify for HIGH severity alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highAlerts}
                onChange={() => updateSetting('highAlerts', !settings.highAlerts)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-medium">Medium Alerts</p>
              <p className="text-sm text-gray-400">Notify for MEDIUM severity alerts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.mediumAlerts}
                onChange={() => updateSetting('mediumAlerts', !settings.mediumAlerts)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Digest & Reports</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Daily Digest</p>
              <p className="text-sm text-gray-400">Receive a daily summary of events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dailyDigest}
                onChange={() => updateSetting('dailyDigest', !settings.dailyDigest)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Security Settings Component
function SecuritySettings() {
  const [settings, setSettings] = useState<AppSettings>(settingsStore.getSettings());

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = settingsStore.updateSettings({ [key]: value });
    setSettings(newSettings);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Session Management</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
          <select
            value={settings.sessionTimeout}
            onChange={(e) => updateSetting('sessionTimeout', e.target.value)}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">1 hour</option>
            <option value="120">2 hours</option>
            <option value="480">8 hours</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// Integration Settings Component
function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Coming Soon</h3>
        <div className="text-center py-8">
          <Globe className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400">Integrations with Slack, PagerDuty, and more coming soon</p>
          <p className="text-sm text-gray-500 mt-1">Stay tuned for updates</p>
        </div>
      </div>
    </div>
  );
}

// Data Settings Component
function DataSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Export Data</p>
              <p className="text-sm text-gray-400">Export all security data as JSON</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-medium">Import Data</p>
              <p className="text-sm text-gray-400">Import security data from file</p>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Upload className="w-4 h-4" />
              Import
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Data Retention</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Retention Period</label>
          <select
            value={settingsStore.getSettings().retentionPeriod}
            onChange={(e) => settingsStore.updateSettings({ retentionPeriod: e.target.value })}
            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="365">1 year</option>
            <option value="0">Never delete</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Events older than the retention period will be automatically archived</p>
        </div>
      </div>

      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Clear All Data</p>
              <p className="text-sm text-gray-400">Permanently delete all security data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-red-500/20 pt-4">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
            </div>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// System Settings Component
function SystemSettings() {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg p-6 text-center">
        <Lock className="w-8 h-8 mx-auto mb-2" />
        <p className="text-lg font-medium">Admin Access Required</p>
        <p className="text-sm mt-1">System settings are only available to administrators</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Activity className="w-4 h-4 text-green-400" />
              <span>API Status</span>
            </div>
            <p className="text-lg font-semibold text-green-400">Running</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Database</span>
            </div>
            <p className="text-lg font-semibold text-blue-400">Connected</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>Uptime</span>
            </div>
            <p className="text-lg font-semibold text-yellow-400">3d 12h</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Activity className="w-4 h-4 text-purple-400" />
              <span>Agents Online</span>
            </div>
            <p className="text-lg font-semibold text-purple-400">2 / 2</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Maintenance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Clear Cache</p>
              <p className="text-sm text-gray-400">Clear system cache to free up memory</p>
            </div>
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              Clear Cache
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-gray-800 pt-4">
            <div>
              <p className="text-white font-medium">System Backup</p>
              <p className="text-sm text-gray-400">Create a full system backup</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
              <Download className="w-4 h-4" />
              Backup Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Settings Page
const tabs = [
  { id: 'general', label: 'General', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Globe },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'system', label: 'System', icon: Zap },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'integrations':
        return <IntegrationSettings />;
      case 'data':
        return <DataSettings />;
      case 'system':
        return <SystemSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Configure your account and platform settings</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </Layout>
  );
}