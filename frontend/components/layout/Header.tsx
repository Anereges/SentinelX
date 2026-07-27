'use client';

import { Bell, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { NotificationDropdown } from '@/components/ui/NotificationDropdown';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Navigate to threat hunting with search query
      window.location.href = `/threat-hunting?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search events, alerts, incidents... (Press Enter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full bg-gray-800 text-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationDropdown onNotificationCount={setNotificationCount} />
          
          {/* User Info */}
          <div className="text-right border-l border-gray-700 pl-4">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">
              {user?.role || 'Loading...'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}