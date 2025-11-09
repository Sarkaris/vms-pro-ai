import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import {
  Users,
  UserPlus,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  Eye,
  EyeOff,
  BarChart,
  Download
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart as RechartsBarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { useNavigate } from "react-router-dom";
  import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    currentVisitors: 0,
    todayVisitors: 0,
    overdueCount: 0,
    activeEmergencies: 0,
    recentCheckins: 0,
    topHosts: [],
    popularPurposes: [],
    hourlyDistribution: [],
    departmentData: [],
    recentActivity: []
  });
  const [useDemo, setUseDemo] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In demo mode, always use demo data
    if (useDemo) {
      setLoading(false);
      return;
    }
    
    // Fetch data
    fetchDashboardData();
  }, [useDemo]);

  const fetchDashboardData = async () => {
    try {
      const { mockApi } = await import('../utils/mockData');
      const [dashboardJson, trafficJson, sidebarJson, emergenciesJson] = await Promise.all([
        mockApi.getDashboard(),
        mockApi.getTraffic('7d'),
        mockApi.getSidebar(),
        mockApi.getEmergencies()
      ]);
      
      // Format department data for chart
      const formattedDeptData = (trafficJson.departmentData || []).map(item => ({
        name: item._id || item.name || 'Unknown Department',
        count: item.count || 0,
        percentage: Math.round((item.count / (trafficJson.departmentData || []).reduce((sum, dept) => sum + (dept.count || 0), 0)) * 100) || 0
      }));
      
      // If no department data, use fallback data with new police departments
      const departmentData = formattedDeptData.length > 0 ? formattedDeptData : [
        { name: 'Anti-Human Trafficking Unit', count: 12, percentage: 11 },
        { name: 'Antiterrorism Squad', count: 15, percentage: 14 },
        { name: 'Application Branch', count: 6, percentage: 5 },
        { name: 'Control Room', count: 10, percentage: 9 },
        { name: 'Cyber Police Station', count: 20, percentage: 18 },
        { name: 'District Special Branch', count: 14, percentage: 13 },
        { name: 'Economic Offences Wing', count: 11, percentage: 10 },
        { name: 'Local Crime Branch', count: 9, percentage: 8 },
        { name: 'Mahila Cell', count: 7, percentage: 6 },
        { name: 'Security Branch', count: 8, percentage: 7 },
        { name: 'Welfare Branch', count: 6, percentage: 5 },
        { name: 'Superintendent of Police (SP)', count: 4, percentage: 4 },
        { name: 'Additional Superintendent of Police (Additional SP)', count: 2, percentage: 2 }
      ];
      const formattedPopular = (dashboardJson.popularPurposes || []).map(p => ({
        name: p._id || p.name || 'Unknown',
        count: p.count || 0
      }));
      
      // Calculate active emergencies count
      const activeEmergencies = emergenciesJson.emergencies 
        ? emergenciesJson.emergencies.filter(emergency => emergency.status === 'Active').length 
        : 0;
      
      setDashboardData({
        ...dashboardJson,
        activeEmergencies: activeEmergencies,
        popularPurposes: formattedPopular,
        departmentData: departmentData, // Use the fallback data if needed
        recentActivity: sidebarJson.recentActivity || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to demo data on error
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899'];

  // Demo data for dashboard (fallback / preview)
  const demo = {
    currentVisitors: 12,
    todayVisitors: 47,
    overdueCount: 3,
    activeEmergencies: 2,
    recentCheckins: 5,
    topHosts: [{ _id: 'A. Sharma', count: 6 }, { _id: 'K. Rao', count: 4 }, { _id: 'S. Patel', count: 3 }],
    popularPurposes: [
      { name: 'Cyber Police Station', count: 30, percentage: 35 },
      { name: 'Antiterrorism Squad', count: 25, percentage: 29 },
      { name: 'District Special Branch', count: 15, percentage: 18 },
      { name: 'Economic Offences Wing', count: 10, percentage: 12 },
      { name: 'Anti-Human Trafficking Unit', count: 8, percentage: 9 },
      { name: 'Control Room', count: 6, percentage: 7 },
      { name: 'Superintendent of Police (SP)', count: 4, percentage: 5 },
      { name: 'Mahila Cell', count: 3, percentage: 3 }
    ],
    hourlyDistribution: [
      { hour: '09:00', count: 2 }, { hour: '10:00', count: 5 }, { hour: '11:00', count: 8 }, 
      { hour: '12:00', count: 12 }, { hour: '13:00', count: 10 }, { hour: '14:00', count: 15 },
      { hour: '15:00', count: 18 }, { hour: '16:00', count: 20 }, { hour: '17:00', count: 16 },
      { hour: '18:00', count: 8 }, { hour: '19:00', count: 4 }, { hour: '20:00', count: 2 }
    ],
    departmentData: [
      { name: 'Anti-Human Trafficking Unit', count: 12, percentage: 11 },
      { name: 'Antiterrorism Squad', count: 15, percentage: 14 },
      { name: 'Application Branch', count: 6, percentage: 5 },
      { name: 'Control Room', count: 10, percentage: 9 },
      { name: 'Cyber Police Station', count: 20, percentage: 18 },
      { name: 'District Special Branch', count: 14, percentage: 13 },
      { name: 'Economic Offences Wing', count: 11, percentage: 10 },
      { name: 'Local Crime Branch', count: 9, percentage: 8 },
      { name: 'Mahila Cell', count: 7, percentage: 6 },
      { name: 'Security Branch', count: 8, percentage: 7 },
      { name: 'Welfare Branch', count: 6, percentage: 5 },
      { name: 'Superintendent of Police (SP)', count: 4, percentage: 4 },
      { name: 'Additional Superintendent of Police (Additional SP)', count: 2, percentage: 2 }
    ],
    recentActivity: [
      { name: 'John Doe', action: 'checked in', at: new Date().toISOString() },
      { name: 'Sarah Wilson', action: 'checked out', at: new Date(Date.now() - 5*60000).toISOString() },
      { name: 'Mike Johnson', action: 'checked in', at: new Date(Date.now() - 8*60000).toISOString() },
      { name: 'Alex Brown', action: 'overdue', at: new Date(Date.now() - 15*60000).toISOString() }
    ]
  };

  // For Security role, always use live data, not demo data
  const data = (user?.role === 'Security') ? dashboardData : (useDemo ? demo : dashboardData);

  const stats = [
    {
      name: t('currentVisitors') || 'Current Visitors',
      value: data.currentVisitors,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      darkBgColor: 'dark:bg-green-900/20',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: t('todaysTotal') || "Today's Total",
      value: data.todayVisitors,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      darkBgColor: 'dark:bg-blue-900/20',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: t('overdueVisits') || 'Overdue Visits',
      value: data.overdueCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      darkBgColor: 'dark:bg-red-900/20',
      change: '-2%',
      changeType: 'negative'
    },
    {
      name: t('recentCheckins') || 'Recent Check-ins',
      value: data.recentCheckins,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      darkBgColor: 'dark:bg-purple-900/20',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  if (loading && !useDemo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Simplified dashboard for Security guards
  if (user?.role === 'Security') {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Security Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
              Welcome back, {user.firstName}!
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Essential Stats - Mobile First Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Current Visitors</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1 sm:mt-2">{data.currentVisitors}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Today's Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1 sm:mt-2">{data.todayVisitors}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Active Emergencies</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mt-1 sm:mt-2">
                  {data.activeEmergencies || 0}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Quick Actions</h3>
            <div className="space-y-2 sm:space-y-3">
              <button
                className="w-full btn-primary flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                onClick={() => navigate("/checkin")}
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>New Check-in</span>
              </button>
              <button 
                className="w-full btn-secondary flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                onClick={() => navigate("/visitors")}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>View Visitors</span>
              </button>
              <button 
                className="w-full btn-secondary flex items-center justify-center space-x-2 py-3 sm:py-2 text-sm sm:text-base"
                onClick={() => navigate("/emergency")}
              >
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>View Emergencies</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Recent Activity</h3>
            <div className="space-y-2 sm:space-y-3">
              {data.recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
                </div>
              ) : (
                data.recentActivity.slice(0, 4).map((activity, index) => {
                  const isCheckIn = activity.action === 'checked in';
                  const isCheckOut = activity.action === 'checked out';
                  const isOverdue = activity.action === 'overdue';
                  
                  return (
                    <div key={index} className="flex items-center space-x-2 sm:space-x-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        isCheckIn ? 'bg-green-500' : 
                        isCheckOut ? 'bg-red-500' : 
                        isOverdue ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-900 dark:text-gray-100 truncate">
                          {activity.name} {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(activity.at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generate and export enhanced dashboard report
  const exportDashboardReport = async () => {
    try {
    // Format date for filename
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
      // Create HTML report with proper formatting and charts
      const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visitor Management System - Dashboard Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            color: #333;
            margin: 0;
        }
        .section {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #667eea;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        .insights {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2196f3;
        }
        .insights h4 {
            margin: 0 0 10px 0;
            color: #1976d2;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .table th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-checked-in {
            background-color: #d4edda;
            color: #155724;
        }
        .status-checked-out {
            background-color: #f8d7da;
            color: #721c24;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            color: #666;
            border-top: 1px solid #ddd;
        }
        @media print {
            body { background-color: white; }
            .section { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Visitor Management System</h1>
        <p>Dashboard Report - ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <h3>Total Visitors Today</h3>
            <p class="value">${data.todayVisitors}</p>
        </div>
        <div class="summary-card">
            <h3>Current Visitors</h3>
            <p class="value">${data.currentVisitors}</p>
        </div>
        <div class="summary-card">
            <h3>Overdue Visits</h3>
            <p class="value">${data.overdueCount}</p>
        </div>
        <div class="summary-card">
            <h3>Recent Check-ins</h3>
            <p class="value">${data.recentCheckins}</p>
        </div>
    </div>

    <div class="section">
        <h2>Department Analysis</h2>
        <div class="chart-container">
            <canvas id="departmentChart"></canvas>
        </div>
        <div class="insights">
            <h4>Key Insights</h4>
            <p>${data.departmentData && data.departmentData.length > 0 
                ? `${data.departmentData[0].name} department received the highest traffic with ${data.departmentData[0].count} visitors (${data.departmentData[0].percentage}%).`
                : 'No department data available.'}</p>
        </div>
    </div>

    <div class="section">
        <h2>Visit Purpose Analysis</h2>
        <div class="chart-container">
            <canvas id="purposeChart"></canvas>
        </div>
        <div class="insights">
            <h4>Key Insights</h4>
            <p>${data.popularPurposes && data.popularPurposes.length > 0 
                ? `Most visitors came for "${data.popularPurposes[0].name}" (${data.popularPurposes[0].count} visitors).`
                : 'No purpose data available.'}</p>
        </div>
    </div>

    <div class="section">
        <h2>Hourly Distribution</h2>
        <div class="chart-container">
            <canvas id="hourlyChart"></canvas>
        </div>
    </div>

    <div class="section">
        <h2>Recent Activity</h2>
        ${data.recentActivity && data.recentActivity.length > 0 ? `
        <table class="table">
            <thead>
                <tr>
                    <th>Visitor</th>
                    <th>Action</th>
                    <th>Time</th>
                </tr>
            </thead>
            <tbody>
                ${data.recentActivity.map(activity => `
                <tr>
                    <td>${activity.name}</td>
                    <td><span class="status-badge status-${activity.action.replace(' ', '-')}">${activity.action}</span></td>
                    <td>${new Date(activity.at).toLocaleString()}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p>No recent activity available.</p>'}
    </div>

    <div class="footer">
        <p>Report generated by Visitor Management System on ${today.toLocaleString()}</p>
        <p>This report contains confidential information and should be handled appropriately.</p>
    </div>

    <script>
        // Department Chart
        const deptCtx = document.getElementById('departmentChart').getContext('2d');
        new Chart(deptCtx, {
            type: 'doughnut',
            data: {
                labels: ${JSON.stringify(data.departmentData.map(d => d.name))},
                datasets: [{
                    data: ${JSON.stringify(data.departmentData.map(d => d.count))},
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });

        // Purpose Chart
        const purposeCtx = document.getElementById('purposeChart').getContext('2d');
        new Chart(purposeCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(data.popularPurposes.map(p => p.name))},
                datasets: [{
                    label: 'Visitors',
                    data: ${JSON.stringify(data.popularPurposes.map(p => p.count))},
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Hourly Chart
        const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
        new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(data.hourlyDistribution.map(h => h.hour || h._id))},
                datasets: [{
                    label: 'Visitors',
                    data: ${JSON.stringify(data.hourlyDistribution.map(h => h.count))},
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>`;

      // Create and download the HTML file
      const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
      link.download = `vms-dashboard-report-${dateStr}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
      
      toast.success('Enhanced report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('dashboard') || 'Dashboard'}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            {t('dashboardSubtitle') || "Welcome back! Here's what's happening at your facility today."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
              {connected ? (t('realtimeConnected') || 'Real-time Connected') : (t('disconnected') || 'Disconnected')}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setUseDemo(!useDemo)}
              className={`btn-secondary flex items-center justify-center space-x-2 text-xs sm:text-sm ${useDemo ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
            >
              {useDemo ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{useDemo ? 'Demo Data' : 'Live Data'}</span>
            </button>
            <button 
              onClick={exportDashboardReport}
              className="btn-primary flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-xs sm:text-sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 card-hover">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 truncate">{stat.name}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1 sm:mt-2">{stat.value}</p>
                  <div className="flex items-center mt-1 sm:mt-2">
                    <span className={`text-xs sm:text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">vs yesterday</span>
                  </div>
                </div>
                <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bgColor} ${stat.darkBgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Hourly Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">{t('hourlyVisitorDistribution') || 'Hourly Visitor Distribution'}</h3>
          <div className="h-48 sm:h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={useDemo ? "hour" : "_id"} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Visitors']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Visits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Department Visits</h3>
          <div className="h-48 sm:h-64 lg:h-80">
            {data.departmentData.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500 dark:text-gray-400">No department data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={data.departmentData.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={20}
                    fill="#8884d8"
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {data.departmentData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [value, 'Visitors']}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Department Statistics */}
          <div className="mt-4 space-y-2">
            {data.departmentData.slice(0, 5).map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dept.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{dept.count}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({dept.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Purpose Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('visitPurposes') || 'Visit Purposes'}</h3>
          <div className="h-80 sm:h-96 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data.popularPurposes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percentage }) => `${percentage}%`}
                  outerRadius={80}
                  innerRadius={20}
                  fill="#8884d8"
                  dataKey="count"
                  paddingAngle={2}
                >
                  {data.popularPurposes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, 'Visitors']}
                  labelFormatter={(label) => `Purpose: ${label}`}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingTop: '10px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('recentActivity') || 'Recent Activity'}</h3>
          <div className="space-y-3">
            {data.recentActivity.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            ) : (
              data.recentActivity.slice(0, 4).map((activity, index) => {
                const isCheckIn = activity.action === 'checked in';
                const isCheckOut = activity.action === 'checked out';
                const isOverdue = activity.action === 'overdue';
                
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      isCheckIn ? 'bg-green-500' : 
                      isCheckOut ? 'bg-red-500' : 
                      isOverdue ? 'bg-yellow-500' : 'bg-gray-500'
                    }`}></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {activity.name} {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('quickActions') || 'Quick Actions'}</h3>
          <div className="space-y-3">
            <button
              className="w-full btn-primary flex items-center justify-center space-x-2"
              onClick={() => navigate("/checkin")}
            >
              <UserPlus className="w-4 h-4" />
              <span>{t('newCheckin') || 'New Check-in'}</span>
            </button>
            <button className="w-full btn-secondary flex items-center justify-center space-x-2"
            onClick={() => navigate("/visitors")}
            >
              <Users className="w-4 h-4" />
              <span>{t('viewAllVisitors') || 'View All Visitors'}</span>
            </button>
            <button className="w-full btn-secondary flex items-center justify-center space-x-2"
            
            onClick={() => navigate("/analytics")}
            >
              <BarChart className="w-4 h-4" />
              <span>{t('viewAnalytics') || 'View Analytics'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
