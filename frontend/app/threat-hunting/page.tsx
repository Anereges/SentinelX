'use client';

import { Layout } from '@/components/layout/Layout';
import { Search, Filter, Calendar, Download, X, AlertCircle, Clock, Server, User, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { eventsApi } from '@/lib/api';

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  sourceIp: string | null;
  destinationIp: string | null;
  username: string | null;
  hostname: string | null;
  processName: string | null;
  command: string | null;
  severity: string | null;
  message: string | null;
  agent: {
    name: string;
    hostname: string;
  } | null;
}

export default function ThreatHuntingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    eventType: '',
    severity: '',
    dateRange: '24h',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });

  const eventTypes = [
    'AUTHENTICATION_FAILURE',
    'AUTHENTICATION_SUCCESS',
    'SSH_LOGIN',
    'PRIVILEGE_ESCALATION',
    'PROCESS_EXECUTION',
    'FILE_CHANGE',
    'NETWORK_CONNECTION',
    'PORT_SCAN',
    'SUSPICIOUS_PROCESS',
  ];

  const severityLevels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

  const handleSearch = async (page = 1) => {
    if (!searchQuery.trim() && !filters.eventType && !filters.severity) {
      setError('Please enter a search term or apply filters');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params: any = {
        page,
        limit: pagination.limit,
        ...filters,
      };

      // Add search query if provided
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await eventsApi.getAll(params);
      
      if (response.data.data.length === 0) {
        setError('No events found matching your search criteria');
      }
      
      setEvents(response.data.data);
      setPagination({
        ...pagination,
        page,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      });
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.response?.data?.error || 'Failed to search events');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(1);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      eventType: '',
      severity: '',
      dateRange: '24h',
    });
    setEvents([]);
    setHasSearched(false);
    setError('');
  };

  const getSeverityColor = (severity: string | null) => {
    const colors: Record<string, string> = {
      CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
      HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      MEDIUM: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    };
    return colors[severity || ''] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('AUTH') || eventType.includes('LOGIN')) {
      return <User className="w-4 h-4" />;
    } else if (eventType.includes('PROCESS') || eventType.includes('EXECUTION')) {
      return <Server className="w-4 h-4" />;
    } else if (eventType.includes('NETWORK') || eventType.includes('CONNECTION')) {
      return <Globe className="w-4 h-4" />;
    } else {
      return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  // Auto-search on filter change
  useEffect(() => {
    if (hasSearched) {
      handleSearch(1);
    }
  }, [filters.eventType, filters.severity, filters.dateRange]);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Threat Hunting</h1>
          <p className="text-gray-400 mt-1">Search and investigate security events across your environment</p>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by IP (192.168.1.1), username, hostname, domain, or event type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => handleSearch(1)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filters:</span>
            </div>

            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
              className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Events</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Severity</option>
              {severityLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="bg-gray-800 text-gray-300 rounded-lg px-3 py-1.5 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Search Tips */}
        {!hasSearched && !loading && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium text-gray-300">Start Hunting for Threats</p>
              <p className="text-sm mt-2 max-w-md mx-auto">
                Search by IP address, username, hostname, domain, or event type.
                <br />
                <span className="text-xs text-gray-500">Example: "192.168.1.1", "root", "webserver", "SSH_LOGIN"</span>
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('192.168.1.100');
                    handleSearch(1);
                  }}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                >
                  Try: 192.168.1.100
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('root');
                    handleSearch(1);
                  }}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                >
                  Try: root
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('SSH_LOGIN');
                    handleSearch(1);
                  }}
                  className="px-3 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                >
                  Try: SSH_LOGIN
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && hasSearched && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg p-6 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>{error}</p>
            <p className="text-sm mt-1 text-gray-400">Try adjusting your search terms or filters</p>
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && events.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            {/* Results Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/30">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Found <span className="text-white font-medium">{pagination.total}</span> results
                </span>
                <span className="text-xs text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
              </div>
              <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Event Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Destination</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        {formatDate(event.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(event.eventType)}
                          <span className="text-xs">{event.eventType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {event.sourceIp || '-'}
                        {event.hostname && (
                          <span className="text-xs text-gray-500 block">{event.hostname}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {event.destinationIp || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {event.username || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                          {event.severity || 'LOW'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                        {event.message || event.command || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-800 bg-gray-800/30">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSearch(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-400">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handleSearch(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  Showing {events.length} of {pagination.total} results
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}