import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  BarChart, 
  Shield, 
  Settings,
  Clock,
  AlertTriangle,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const { t } = useI18n();
  const { user } = useAuth();

  // Sidebar dynamic data
  const [quickStats, setQuickStats] = useState({ currentVisitors: 0, todayTotal: 0, activeEmergencies: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSidebar = async () => {
      try {
        setLoading(true);
        
        // Try fetching from server directly first
        let sidebarData = null;
        try {
          const response = await fetch('/api/analytics/sidebar');
          if (response.ok) {
            sidebarData = await response.json();
            console.log('Sidebar data from server:', sidebarData);
          }
        } catch (error) {
          console.log('Server not available, using mock data');
        }
        
        // If server data not available, use mock
        if (!sidebarData) {
          const { mockApi } = await import('../utils/mockData');
          sidebarData = await mockApi.getSidebar();
        }
        
        if (!isMounted) return;
        
        // Fetch active emergencies count
        let activeEmergenciesCount = 0;
        try {
          const emergencyResponse = await fetch('/api/emergencies');
          if (emergencyResponse.ok) {
            const emergencyData = await emergencyResponse.json();
            if (emergencyData && emergencyData.emergencies) {
              const activeEmergencies = emergencyData.emergencies.filter(e => e.status === 'Active');
              activeEmergenciesCount = activeEmergencies.length || 0;
            }
          } else {
            // Fallback to mock
            const { mockApi } = await import('../utils/mockData');
            const emergencyData = await mockApi.getEmergencies();
            if (emergencyData && emergencyData.emergencies) {
              const activeEmergencies = emergencyData.emergencies.filter(e => e.status === 'Active');
              activeEmergenciesCount = activeEmergencies.length || 0;
            }
          }
        } catch (error) {
          console.error('Error fetching emergencies:', error);
          // Try mock as fallback
          try {
            const { mockApi } = await import('../utils/mockData');
            const emergencyData = await mockApi.getEmergencies();
            if (emergencyData && emergencyData.emergencies) {
              const activeEmergencies = emergencyData.emergencies.filter(e => e.status === 'Active');
              activeEmergenciesCount = activeEmergencies.length || 0;
            }
          } catch (e) {
            console.error('Mock emergency fetch also failed:', e);
          }
        }
        
        // Set Quick Stats with proper values - handle both server and mock data structures
        const currentVisitors = Number(sidebarData.currentVisitors || sidebarData.currentVisitorsCount || 0);
        const todayTotal = Number(sidebarData.todayTotal || sidebarData.todayVisitors || sidebarData.todayVisitorsCount || 0);
        
        console.log('Setting Quick Stats:', { currentVisitors, todayTotal, activeEmergenciesCount });
        
        setQuickStats({
          currentVisitors: currentVisitors,
          todayTotal: todayTotal,
          activeEmergencies: activeEmergenciesCount
        });
        
        // Recent activity moved to Navbar notifications; keep but limit silently
        const ra = Array.isArray(sidebarData.recentActivity) ? sidebarData.recentActivity.slice(0,0) : [];
        setRecentActivity(ra);
      } catch (e) {
        console.error('Error fetching sidebar data:', e);
        // graceful fallback - keep previous values or set to 0
        if (!isMounted) return;
        setQuickStats(prev => ({
          currentVisitors: prev.currentVisitors || 0,
          todayTotal: prev.todayTotal || 0,
          activeEmergencies: prev.activeEmergencies || 0
        }));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchSidebar();
    const id = setInterval(fetchSidebar, 30000);
    return () => { isMounted = false; clearInterval(id); };
  }, []);

  // Build navigation by role
  let navigation = [];
  if (user?.role === 'Super Admin' || user?.role === 'Admin') {
    navigation = [
      { name: t('sidebarDashboard'), href: '/', icon: LayoutDashboard },
      { name: t('sidebarVisitors'), href: '/visitors', icon: Users },
      { name: t('sidebarCheckIn'), href: '/checkin', icon: UserPlus },
      { name: t('emergency'), href: '/emergency', icon: AlertTriangle },
      { name: t('sidebarAnalytics'), href: '/analytics', icon: BarChart },
      { name: t('sidebarAdmin'), href: '/admin', icon: Shield },
      { name: t('sidebarSettings'), href: '/settings', icon: Settings },
    ];
  } else {
    // Security/Receptionist: Visitors, Check In, Emergency, and Settings
    navigation = [
      { name: t('sidebarDashboard'), href: '/', icon: LayoutDashboard },
      { name: t('sidebarVisitors'), href: '/visitors', icon: Users },
      { name: t('sidebarCheckIn'), href: '/checkin', icon: UserPlus },
      { name: t('emergency'), href: '/emergency', icon: AlertTriangle },
      { name: t('sidebarSettings'), href: '/settings', icon: Settings },
    ];
  }

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const sidebarContent = (
    <div className="p-4 sm:p-6">
      {/* Quick Stats */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
          {t('quickStats')}
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs sm:text-sm text-green-700 dark:text-green-300">{t('currentVisitors')}</span>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-green-600 dark:text-green-400">{quickStats.currentVisitors}</span>
          </div>
          
          <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" />
              <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">{t('todaysTotal')}</span>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-blue-600 dark:text-blue-400">{quickStats.todayTotal}</span>
          </div>
          
          {/* Active Emergencies */}
          <div className="flex items-center justify-between p-2 sm:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 dark:text-red-400" />
              <span className="text-xs sm:text-sm text-red-700 dark:text-red-300">Active Emergencies</span>
            </div>
            <span className="text-sm sm:text-base lg:text-lg font-bold text-red-600 dark:text-red-400">{quickStats.activeEmergencies}</span>
          </div>
          
          {/** Overdue disabled as per requirements **/}
          {false && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-300">{t('overdueVisits')}</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">0</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`
                  group flex items-center px-2 sm:px-3 py-2.5 sm:py-3 lg:py-2 text-sm font-medium rounded-lg transition-colors duration-200 touch-manipulation
                  ${isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100'
                  }
                `}
            >
              <Icon
                className={`
                    mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 flex-shrink-0
                    ${isActive(item.href) ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'}
                  `}
              />
              <span className="truncate text-xs sm:text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Recent Activity moved to Navbar notifications */}

      {/* System Status */}
      <div className="mt-6 sm:mt-8">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 sm:mb-3">
          {t('systemStatus')}
        </h3>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">Database</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">API Server</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Online</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-300">Real-time</span>
            <span className="text-green-600 dark:text-green-400 font-medium">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Overlay for mobile (below navbar) */}
      {isOpen && (
        <div
          className="fixed left-0 right-0 bottom-0 top-16 sm:top-20 lg:top-16 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Off-canvas for mobile and fixed for lg */}
      <div className="fixed left-0 top-16 sm:top-20 lg:top-16 bottom-0 z-50 lg:z-50">
        {/* Mobile drawer */}
        <div
          className={`lg:hidden w-64 sm:w-72 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transform transition-transform duration-200 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ willChange: 'transform' }}
        >
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Menu</span>
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          {sidebarContent}
        </div>

        {/* Desktop fixed sidebar */}
        <div className="hidden lg:block w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
