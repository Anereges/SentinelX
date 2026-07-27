'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AlertSeverityChart } from '@/components/dashboard/AlertSeverityChart';
import { EventsTimelineChart } from '@/components/dashboard/EventsTimelineChart';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Server, 
  CheckCircle, 
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Globe,
  Users,
  Zap,
  FileText,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye
} from 'lucide-react';
import { dashboardApi, DashboardMetrics } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';

// New chart components
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  AreaChart,
  RadialBarChart,
  RadialBar,
  Legend,
  Cell
} from 'recharts';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { role, isAdmin, isAnalyst, isViewer } = usePermissions();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await dashboardApi.getMetrics();
      setMetrics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const severityData = [
    { severity: 'CRITICAL', count: metrics?.criticalAlerts || 0 },
    { severity: 'HIGH', count: metrics?.highAlerts || 0 },
    { severity: 'MEDIUM', count: metrics?.mediumAlerts || 0 },
    { severity: 'LOW', count: metrics?.lowAlerts || 0 },
  ];

  const timelineData = [
    { time: '00:00', events: 45, alerts: 12, incidents: 2 },
    { time: '04:00', events: 32, alerts: 8, incidents: 1 },
    { time: '08:00', events: 68, alerts: 25, incidents: 4 },
    { time: '12:00', events: 89, alerts: 32, incidents: 6 },
    { time: '16:00', events: 76, alerts: 28, incidents: 3 },
    { time: '20:00', events: 54, alerts: 18, incidents: 2 },
  ];

  // Top alert sources data
  const topSourcesData = [
    { source: '192.168.1.100', count: 45 },
    { source: '10.0.0.50', count: 32 },
    { source: '192.168.1.200', count: 28 },
    { source: '203.0.113.45', count: 19 },
    { source: '172.16.0.10', count: 15 },
  ];

  // Alert distribution by type
  const alertTypeData = [
    { type: 'Authentication', value: 35 },
    { type: 'Network', value: 28 },
    { type: 'Malware', value: 20 },
    { type: 'Policy', value: 12 },
    { type: 'Other', value: 5 },
  ];

  // Incident resolution time (mock)
  const resolutionData = [
    { name: '0-1h', value: 25 },
    { name: '1-4h', value: 35 },
    { name: '4-12h', value: 20 },
    { name: '12-24h', value: 12 },
    { name: '>24h', value: 8 },
  ];

  // Risk score over time
  const riskScoreData = [
    { time: 'Mon', score: 65 },
    { time: 'Tue', score: 72 },
    { time: 'Wed', score: 58 },
    { time: 'Thu', score: 85 },
    { time: 'Fri', score: 70 },
    { time: 'Sat', score: 45 },
    { time: 'Sun', score: 40 },
  ];

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6'];

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
        {/* Page Header with Role Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time security monitoring and incident overview</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
              isAdmin ? 'bg-red-500/10 text-red-400 border-red-500/20' :
              isAnalyst ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
              'bg-gray-500/10 text-gray-400 border-gray-500/20'
            }`}>
              {role}
            </span>
            {isAdmin && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                Full Access
              </span>
            )}
            {isAnalyst && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                Analyst
              </span>
            )}
            {isViewer && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                Read Only
              </span>
            )}
          </div>
        </div>

        {/* Main Metrics Grid - 6 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Events"
            value={metrics?.totalEvents || 0}
            icon={<Activity className="w-6 h-6" />}
            color="blue"
            trend={{ value: 12, label: 'vs last week' }}
          />
          <MetricCard
            title="Critical Alerts"
            value={metrics?.criticalAlerts || 0}
            icon={<AlertCircle className="w-6 h-6" />}
            color="red"
            trend={{ value: -5, label: 'vs last week' }}
          />
          <MetricCard
            title="Open Incidents"
            value={metrics?.openIncidents || 0}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="yellow"
          />
          <MetricCard
            title="Active Agents"
            value={metrics?.activeAgents || 0}
            icon={<Server className="w-6 h-6" />}
            color="green"
          />
          <MetricCard
            title="Today's Events"
            value={metrics?.eventsToday || 0}
            icon={<Zap className="w-6 h-6" />}
            color="purple"
          />
          <MetricCard
            title="Resolved"
            value={metrics?.resolvedIncidents || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
        </div>

        {/* Secondary Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Incident Response Time</p>
                <p className="text-xl font-bold text-white">2.4h</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  15% faster
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">MTTD</p>
                <p className="text-xl font-bold text-white">12.5m</p>
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  8% slower
                </p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">False Positive Rate</p>
                <p className="text-xl font-bold text-white">3.2%</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" />
                  2% improvement
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Alert Volume</p>
                <p className="text-xl font-bold text-white">247</p>
                <p className="text-xs text-blue-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  5% increase
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 - Events Timeline & Alerts by Severity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Events Over Time</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-400">Last 24 hours</span>
                <button className="text-blue-400 hover:text-blue-300">View All</button>
              </div>
            </div>
            <EventsTimelineChart data={timelineData} />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Alerts by Severity</h3>
              <span className="text-xs text-gray-400">Current distribution</span>
            </div>
            <AlertSeverityChart data={severityData} />
          </div>
        </div>

        {/* Charts Row 2 - Advanced Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Score Trend */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Risk Score Trend</h3>
              <span className="text-xs text-gray-400">7 days</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riskScoreData}>
                  <defs>
                    <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#6B7280" fontSize={11} />
                  <YAxis stroke="#6B7280" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#EF4444"
                    strokeWidth={2}
                    fill="url(#riskGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">Current Risk: <span className="text-red-400 font-medium">85</span></span>
              <span className="text-xs text-gray-400">Threshold: <span className="text-yellow-400 font-medium">70</span></span>
            </div>
          </div>

          {/* Alert Type Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Alert Distribution</h3>
              <span className="text-xs text-gray-400">By type</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#6B7280" fontSize={11} />
                  <YAxis dataKey="type" type="category" stroke="#6B7280" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                    {alertTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incident Resolution Time - Fixed RadialBar */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Resolution Time</h3>
              <span className="text-xs text-gray-400">Average: 3.2h</span>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  cx="50%"
                  cy="50%"
                  innerRadius="40%" 
                  outerRadius="100%" 
                  data={resolutionData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={15}
                  >
                    {resolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </RadialBar>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F3F4F6',
                    }}
                  />
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    formatter={(value) => <span className="text-gray-300 text-xs">{value}</span>}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 3 - Top Sources & Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Attack Sources */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Top Attack Sources</h3>
              <span className="text-xs text-gray-400">Last 24 hours</span>
            </div>
            <div className="space-y-3">
              {topSourcesData.map((source, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-xs font-medium text-gray-400">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{source.source}</span>
                      <span className="text-gray-400">{source.count} events</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-red-500' :
                          index === 1 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}
                        style={{ width: `${(source.count / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Security Health</h3>
              <span className="text-xs text-gray-400">Current status</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">Overall Health</span>
                </div>
                <p className="text-2xl font-bold text-green-400">86%</p>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">Coverage</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">94%</p>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">Performance</span>
                </div>
                <p className="text-2xl font-bold text-yellow-400">78%</p>
                <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">Endpoints</span>
                </div>
                <p className="text-2xl font-bold text-purple-400">12</p>
                <p className="text-xs text-gray-500">Active endpoints</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific message for viewers */}
        {isViewer && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-400">
              <span className="text-yellow-400">👁️ View-only mode:</span> You can view all data but cannot make changes.
              Contact an administrator for write permissions.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}