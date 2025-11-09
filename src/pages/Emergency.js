import React, { useState, useEffect, useRef } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, Check, X, RefreshCw, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Emergency = () => {
  const { t } = useI18n();
  const { socket } = useSocket();
  const { user } = useAuth();
  const location = useLocation();
  const selectedEmergencyRef = useRef(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState(null);
  const [stats, setStats] = useState({
    active: 0,
    resolved: 0,
    cancelled: 0,
    departmental: 0,
    visitor: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });
  
  // Extract emergency ID from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emergencyId = params.get('id');
    if (emergencyId) {
      setSelectedEmergencyId(emergencyId);
    }
  }, [location]);

  // Fetch emergencies
  const fetchEmergencies = async () => {
    try {
      setLoading(true);
      const { mockApi } = await import('../utils/mockData');
      
      const data = await mockApi.getEmergencies(filters);
      
      if (data.emergencies) {
        setEmergencies(data.emergencies);
        
        // Calculate stats
        const active = data.emergencies.filter(e => e.status === 'Active').length;
        const resolved = data.emergencies.filter(e => e.status === 'Resolved').length;
        const cancelled = data.emergencies.filter(e => e.status === 'Cancelled').length;
        const departmental = data.emergencies.filter(e => e.type === 'Departmental').length;
        const visitor = data.emergencies.filter(e => e.type === 'Visitor').length;
        
        setStats({
          active,
          resolved,
          cancelled,
          departmental,
          visitor
        });
      }
    } catch (error) {
      console.error('Error fetching emergencies:', error);
      toast.error('Failed to load emergencies');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchEmergencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  // Scroll to selected emergency when it's loaded
  useEffect(() => {
    if (selectedEmergencyId && selectedEmergencyRef.current) {
      // Scroll the selected emergency into view with a smooth animation
      selectedEmergencyRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Highlight the row temporarily
      selectedEmergencyRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        if (selectedEmergencyRef.current) {
          selectedEmergencyRef.current.classList.remove('animate-pulse');
        }
      }, 2000);
    }
  }, [selectedEmergencyId, emergencies]);

  // Socket.io for real-time updates
  useEffect(() => {
    if (!socket) return;
    
    const handleEmergencyCreated = (data) => {
      toast.success(`New emergency reported: ${data.incidentCode}`);
      fetchEmergencies();
    };
    
    const handleEmergencyUpdated = (data) => {
      toast.success(`Emergency ${data.id} status updated to ${data.status}`);
      fetchEmergencies();
    };
    
    socket.on('emergency-created', handleEmergencyCreated);
    socket.on('emergency-updated', handleEmergencyUpdated);
    
    return () => {
      socket.off('emergency-created', handleEmergencyCreated);
      socket.off('emergency-updated', handleEmergencyUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Handle emergency actions
  const resolveEmergency = async (id) => {
    const { showDemoToast } = await import('../components/UI/DemoPopup');
    showDemoToast('emergency');
    try {
      const { mockApi } = await import('../utils/mockData');
      await mockApi.resolveEmergency(id);
      toast.success('Emergency resolved successfully (Demo)');
      fetchEmergencies();
    } catch (error) {
      console.error('Error resolving emergency:', error);
      toast.error('Failed to resolve emergency');
    }
  };

  const cancelEmergency = async (id) => {
    const { showDemoToast } = await import('../components/UI/DemoPopup');
    showDemoToast('emergency');
    try {
      const { mockApi } = await import('../utils/mockData');
      await mockApi.cancelEmergency(id);
      toast.success('Emergency cancelled successfully (Demo)');
      fetchEmergencies();
    } catch (error) {
      console.error('Error cancelling emergency:', error);
      toast.error('Failed to cancel emergency');
    }
  };

  // Chart data
  const statusData = [
    { name: 'Active', value: stats.active, color: '#EF4444' },
    { name: 'Resolved', value: stats.resolved, color: '#10B981' },
    { name: 'Cancelled', value: stats.cancelled, color: '#6B7280' }
  ];

  const typeData = [
    { name: 'Departmental', value: stats.departmental, color: '#3B82F6' },
    { name: 'Visitor', value: stats.visitor, color: '#8B5CF6' }
  ];

  // const COLORS = ['#EF4444', '#10B981', '#6B7280', '#3B82F6', '#8B5CF6']; // Unused

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          <AlertTriangle className="inline-block mr-2 text-red-500 w-5 h-5 sm:w-6 sm:h-6" />
          {t('emergencyManagement')}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('searchEmergencies')}
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm px-3 sm:px-4 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="Active">{t('active')}</option>
            <option value="Resolved">{t('resolved')}</option>
            <option value="Cancelled">{t('cancelled')}</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="border border-gray-300 dark:border-gray-600 rounded-lg text-sm px-3 sm:px-4 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">{t('allTypes')}</option>
            <option value="Departmental">{t('departmental')}</option>
            <option value="Visitor">{t('visitor')}</option>
          </select>
          
          <button
            onClick={() => fetchEmergencies()}
            className="inline-flex items-center justify-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">{t('refresh')}</span>
          </button>
        </div>
      </div>
      
      {/* Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('emergencyStatus')}</h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: t('active'), value: stats.active, color: '#EF4444' },
                    { name: t('resolved'), value: stats.resolved, color: '#10B981' },
                    { name: t('cancelled'), value: stats.cancelled, color: '#6B7280' }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('emergencyTypes')}</h2>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: t('departmental'), value: stats.departmental },
                  { name: t('visitor'), value: stats.visitor }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name={t('count')}>
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Emergencies List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('code')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('type')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('reportedAt')}</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Loading emergencies...
                  </td>
                </tr>
              ) : emergencies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {t('noEmergencies')}
                  </td>
                </tr>
              ) : (
                emergencies.map((emergency) => (
                  <tr 
                    key={emergency._id} 
                    ref={emergency._id === selectedEmergencyId ? selectedEmergencyRef : null}
                    className={`${emergency.status === 'Active' ? 'bg-red-50 dark:bg-red-900/10' : ''} 
                      ${emergency._id === selectedEmergencyId ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {emergency.incidentCode || emergency.code || emergency._id?.substring(0, 8) || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emergency.type === 'Departmental' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      }`}>
                        {t(emergency.type.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="max-w-xs">
                        {emergency.formattedDescription || (
                          emergency.type === 'Departmental' ? (
                            <div>
                              <div>🏢 <span className="font-medium">Dept:</span> {emergency.departmentName || 'Not provided'}</div>
                              <div>👨‍💼 <span className="font-medium">POC:</span> {emergency.pocName || 'Not provided'}</div>
                              <div>👥 <span className="font-medium">Headcount:</span> {emergency.headcount || 0}</div>
                              <div>📍 <span className="font-medium">Location:</span> {emergency.location || 'Not specified'}</div>
                            </div>
                          ) : (
                            <div>
                              <div>👤 <span className="font-medium">Name:</span> {((emergency.visitorFirstName || '') + ' ' + (emergency.visitorLastName || '')).trim() || 'Not provided'}</div>
                              <div>📞 <span className="font-medium">Phone:</span> {emergency.visitorPhone || 'Not provided'}</div>
                              {emergency.reason && <div>📝 <span className="font-medium">Reason:</span> {emergency.reason}</div>}
                              <div>📍 <span className="font-medium">Location:</span> {emergency.location || 'Not specified'}</div>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emergency.status === 'Active' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                        emergency.status === 'Resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {t(emergency.status.toLowerCase())}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {(() => {
                        const dateStr = emergency.reportedAt || emergency.createdAt || emergency.updatedAt;
                        if (!dateStr) return <div className="text-gray-400">No date</div>;
                        
                        try {
                          const date = new Date(dateStr);
                          if (isNaN(date.getTime())) return <div className="text-gray-400">Invalid Date</div>;
                          
                          const now = new Date();
                          const diffMs = now - date;
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);
                          
                          let timeAgo = '';
                          if (diffMins < 1) timeAgo = 'Just now';
                          else if (diffMins < 60) timeAgo = `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
                          else if (diffHours < 24) timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
                          else timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
                          
                          return (
                            <>
                              <div>{date.toLocaleString()}</div>
                              <div className="text-xs text-gray-400">{timeAgo}</div>
                            </>
                          );
                        } catch (e) {
                          return <div className="text-gray-400">Invalid Date</div>;
                        }
                      })()}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {emergency.status === 'Active' && (
                        <div className="flex space-x-2">
                          {/* Only Admin and Super Admin can resolve/cancel emergencies */}
                          {(user?.role === 'Admin' || user?.role === 'Super Admin') ? (
                            <>
                              <button
                                onClick={() => resolveEmergency(emergency._id)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title={t('resolve')}
                              >
                                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button
                                onClick={() => cancelEmergency(emergency._id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title={t('cancel')}
                              >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              View Only
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Emergency;