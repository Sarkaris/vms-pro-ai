import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useSocket } from '../../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
// Removed Zustand import to fix infinite loop
import {
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Search,
  Sun,
  Moon,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import EmergencyModal from '../UI/EmergencyModal';

// Custom hook to detect clicks outside of a component
const useClickOutside = (callback) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
};

const Navbar = ({ onMobileMenuClick }) => {
  const { user, logout } = useAuth();
  const { lang, toggleLang, t } = useI18n();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { socket } = useSocket();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Use local state for notifications to avoid Zustand infinite loop
  const [notifications, setNotifications] = useState([]);
  const [emergencyNotifications, setEmergencyNotifications] = useState([]);
  const [visitorNotifications, setVisitorNotifications] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  const [darkMode, setDarkMode] = useState(false);
  
  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      const savedEmergencyNotifications = localStorage.getItem('emergencyNotifications');
      const savedRecentActivities = localStorage.getItem('recentActivities');
      
      if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
      if (savedEmergencyNotifications) setEmergencyNotifications(JSON.parse(savedEmergencyNotifications));
      if (savedRecentActivities) setRecentActivities(JSON.parse(savedRecentActivities));
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }, []);

  // Fetch notifications from database on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { mockApi } = await import('../utils/mockData');
        
        // Fetch active visitors for notifications
        const visitorData = await mockApi.getActiveVisitors();
        
        let newVisitorNotifications = [];
        if (visitorData && visitorData.visitors && Array.isArray(visitorData.visitors) && visitorData.visitors.length > 0) {
          newVisitorNotifications = visitorData.visitors.map(visitor => ({
            type: 'checkin',
            message: `${visitor.firstName || 'Visitor'} checked in`,
            at: visitor.checkInTime,
            visitorId: visitor._id
          }));
        }
        setVisitorNotifications(newVisitorNotifications);
        
        // Fetch today's check-ins for recent activities
        const allVisitors = await mockApi.getVisitors();
        if (allVisitors && allVisitors.visitors) {
          const todayVisitors = allVisitors.visitors
            .filter(v => v.status === 'Checked In')
            .slice(0, 5);
          const todayActivities = todayVisitors.map(visitor => ({
            type: 'checkin',
            message: `${visitor.firstName || 'Visitor'} checked in`,
            at: visitor.checkInTime,
            visitorId: visitor._id
          }));
          setRecentActivities(todayActivities);
        }
        
        // Fetch emergency notifications
        const emergencyData = await mockApi.getEmergencies();
        
        if (emergencyData && emergencyData.emergencies) {
          // Filter active emergencies
          const activeEmergencies = emergencyData.emergencies
            .filter(emergency => emergency.status === 'Active')
            .map(emergency => ({
              id: emergency._id,
              type: 'emergency-created',
              emergencyType: emergency.type || 'Unknown',
              message: `Emergency alert: ${emergency.type || 'Emergency'}`,
              location: emergency.location || 'Unknown location',
              incidentCode: emergency.incidentCode || '',
              status: 'Active',
              at: emergency.reportedAt || emergency.createdAt,
              priority: 'high'
            }));
          
          // Set emergency notifications
          setEmergencyNotifications(activeEmergencies);
          
          // Create regular notifications for emergencies
          const emergencyActivityNotifications = emergencyData.emergencies
            .slice(0, 5)
            .map(emergency => ({
              type: emergency.status === 'Active' ? 'emergency-created' : 'emergency-updated',
              message: emergency.status === 'Active' 
                ? `Emergency alert: ${emergency.type || 'Emergency'}`
                : `Emergency update: ${emergency.status}`,
              at: emergency.reportedAt || emergency.createdAt,
              priority: emergency.status === 'Active' ? 'high' : 'medium'
            }));
          
          // Combine visitor and emergency notifications
          const allNotifications = [...newVisitorNotifications, ...emergencyActivityNotifications];
          setNotifications(allNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);
  const [showEmergency, setShowEmergency] = useState(false);
  const navigate = useNavigate();

  // Use the custom hook on the profile menu container
  const profileMenuRef = useClickOutside(() => {
    setShowProfileMenu(false);
  });
  const notificationsRef = useClickOutside(() => {
    setShowNotifications(false);
  });

  // Effect to set the initial dark mode based on user's system preference or default to light
  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('emergencyNotifications', JSON.stringify(emergencyNotifications));
  }, [emergencyNotifications]);

  useEffect(() => {
    localStorage.setItem('recentActivities', JSON.stringify(recentActivities));
  }, [recentActivities]);

  // Listen for live visitor activity and emergencies for notifications
  useEffect(() => {
    if (!socket) return;
    const onCheckin = (payload) => {
      const newNotification = {
        type: 'checkin',
        message: `${payload?.visitor?.firstName || 'Visitor'} checked in`,
        at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setRecentActivities(prev => [newNotification, ...prev].slice(0, 5));
    };
    
    const onCheckout = (payload) => {
      const newNotification = {
        type: 'checkout',
        message: `${payload?.visitor?.firstName || 'Visitor'} checked out`,
        at: new Date().toISOString()
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setRecentActivities(prev => [newNotification, ...prev].slice(0, 5));
    };
    
    const onEmergencyCreated = (payload) => {
      const newEmergency = {
        id: payload?._id,
        type: 'emergency-created',
        emergencyType: payload?.type || 'Unknown',
        message: `Emergency alert: ${payload?.type || 'New emergency'}`,
        location: payload?.location || 'Unknown location',
        incidentCode: payload?.incidentCode || '',
        status: 'Active',
        at: new Date().toISOString(),
        priority: 'high'
      };
      
      setEmergencyNotifications(prev => [newEmergency, ...prev].slice(0, 5));
      setNotifications(prev => [newEmergency, ...prev]);
      setRecentActivities(prev => [newEmergency, ...prev].slice(0, 5));
    };
    
    const onEmergencyUpdated = (payload) => {
      const newNotification = {
        type: 'emergency-updated',
        message: `Emergency update: ${payload?.status || 'Status changed'}`,
        at: new Date().toISOString(),
        priority: 'medium'
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setRecentActivities(prev => [newNotification, ...prev].slice(0, 5));
      
      // Update emergency notifications if status changed to Resolved or Cancelled
      if (payload?.status === 'Resolved' || payload?.status === 'Cancelled') {
        setEmergencyNotifications((prev) => 
          prev.filter(item => item.id !== payload?._id)
        );
      }
    };
    
    socket.on('visitor-checkin', onCheckin);
    socket.on('visitor-checkout', onCheckout);
    socket.on('emergency-created', onEmergencyCreated);
    socket.on('emergency-updated', onEmergencyUpdated);
    
    return () => {
      socket.off('visitor-checkin', onCheckin);
      socket.off('visitor-checkout', onCheckout);
      socket.off('emergency-created', onEmergencyCreated);
      socket.off('emergency-updated', onEmergencyUpdated);
    };
  }, [socket]);

  const handleLogout = async () => {
    await logout();
    setShowProfileMenu(false);
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setDarkMode(!darkMode);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50 transition-colors duration-200">
      <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">VM</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 hidden xs:block">
                Visitor Management
              </h1>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-md mx-4 sm:mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Mobile menu button (always visible on small screens) */}
            <button
              onClick={onMobileMenuClick}
              className="lg:hidden p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            {/* Emergency button for mobile */}
            <button
              onClick={() => setShowEmergency(true)}
              className="lg:hidden p-1.5 sm:p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              aria-label="Emergency"
            >
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-1.5 sm:px-2 py-1 text-xs font-medium rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle language"
              title="Toggle language"
            >
              {lang === 'en' ? 'EN' : 'MR'}
            </button>

            {/* Emergency quick action */}
            <button
              onClick={() => setShowEmergency(true)}
              className="hidden lg:inline-flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium shadow"
            >
              <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('emergency')}</span>
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {notifications.length > 0 && (
                  <>
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full ring-1 sm:ring-2 ring-white dark:ring-gray-800"></span>
                  {/* {console.log('Notifications:', notifications.length)} */}
                  </>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-sm bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications</span>
                    <button className="text-xs text-blue-600 dark:text-blue-400" onClick={() => setNotifications([])}>Clear</button>
                  </div>
                  {/* {console.log('Notifications:', showNotifications.length)} */}
                  {/* Active Emergencies Section */}
                  {emergencyNotifications.length > 0 && (
                    <div className="border-b border-gray-100 dark:border-gray-600">
                      <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20">
                        <span className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          🚨 Active Emergencies ({emergencyNotifications.length})
                        </span>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {emergencyNotifications.map((emergency, idx) => (
                          <div 
                            key={`emergency-${idx}`} 
                            className="px-4 py-3 flex items-start space-x-3 hover:bg-red-100 dark:hover:bg-red-900/30 bg-red-50 dark:bg-red-900/10 cursor-pointer border-l-4 border-red-500"
                            onClick={() => {
                              navigate(`/emergency?id=${emergency.id}`);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="w-3 h-3 mt-1 rounded-full bg-red-500 animate-pulse"></div>
                            <div className="flex-1">
                              <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
                                {emergency.message}
                              </p>
                              <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                📍 {emergency.location} • 🆔 {emergency.incidentCode}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                🕐 {new Date(emergency.at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Active Visitors Section */}
                  {notifications.filter(n => n.type === 'checkin').length > 0 && (
                    <div className="border-b border-gray-100 dark:border-gray-600">
                      <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20">
                        <span className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          👥 Active Visitors ({notifications.filter(n => n.type === 'checkin').length})
                        </span>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {notifications.filter(n => n.type === 'checkin').map((visitor, idx) => (
                          <div 
                            key={`visitor-${idx}`} 
                            className="px-4 py-3 flex items-start space-x-3 hover:bg-green-100 dark:hover:bg-green-900/30 bg-green-50 dark:bg-green-900/10 cursor-pointer border-l-4 border-green-500"
                            onClick={() => {
                              navigate(`/visitors?id=${visitor.visitorId}`);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="w-3 h-3 mt-1 rounded-full bg-green-500"></div>
                            <div className="flex-1">
                              <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                                ✅ {visitor.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                                🕐 {new Date(visitor.at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Activities Section */}
                  <div className="border-b border-gray-100 dark:border-gray-600">
                    <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center">
                          <Bell className="w-4 h-4 mr-1" />
                          📋 Recent Activities (Last 5)
                        </span>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {recentActivities.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300 text-center">📭 No recent activity</div>
                      ) : (
                        recentActivities.slice(0, 5).map((n, idx) => (
                          <div 
                            key={`activity-${idx}`} 
                            className={`px-4 py-3 flex items-start space-x-3 hover:bg-blue-100 dark:hover:bg-blue-900/30 bg-blue-50 dark:bg-blue-900/10 cursor-pointer border-l-4 ${n.type === 'checkout' ? 'border-yellow-500' : n.type === 'checkin' ? 'border-green-500' : 'border-red-500'} ${n.type.includes('emergency') ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                            onClick={() => {
                              if (n.type.includes('emergency')) {
                                navigate('/emergency');
                                setShowNotifications(false);
                              } else if (n.type === 'checkout' || n.type === 'checkin') {
                                navigate('/visitors');
                                setShowNotifications(false);
                              }
                            }}
                          >
                            <div className={`w-3 h-3 mt-1 rounded-full ${n.type === 'checkout' ? 'bg-yellow-500' : n.type === 'checkin' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className="flex-1">
                              <p className={`text-sm ${n.type.includes('emergency') ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-blue-700 dark:text-blue-400 font-medium'}`}>
                                {n.type === 'checkout' ? '🚪 ' : n.type === 'checkin' ? '✅ ' : '🚨 '}{n.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">🕐 {new Date(n.at).toLocaleString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-expanded={showProfileMenu}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs sm:text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role}
                  </p>
                </div>
                <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showProfileMenu ? 'transform rotate-180' : ''} hidden md:block`} />
              </button>

              {/* Profile dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 sm:w-56 origin-top-right bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-50 animate-fade-in-down transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-600">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 transition-colors">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Profile</span>
                  </button>

                  <button className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center space-x-2 transition-colors">
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span>Settings</span>
                  </button>

                  <hr className="my-1 border-gray-200 dark:border-gray-600" />

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      {/* <div className="lg:hidden px-6 pb-4">
        <button onClick={onMobileMenuClick} className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
          <Menu className="w-5 h-5" />
          <span>{t('menu')}</span>
        </button>
      </div> */}
      {showEmergency && (
        <EmergencyModal onClose={() => setShowEmergency(false)} />
      )}
    </nav>
  );
};

export default Navbar;