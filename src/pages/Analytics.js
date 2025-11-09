import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  MapPin,
  BarChart,
  PieChart,
  Activity,
  AlertTriangle,
  Shield,
  Eye,
  EyeOff,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import toast from 'react-hot-toast';
import { exportAnalyticsToExcel } from '../utils/exportUtils';

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

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    traffic: {},
    dashboard: {},
    trends: [],
    security: {},
    emergency: {
      active: 0,
      resolved: 0,
      cancelled: 0,
      departmental: 0,
      visitor: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [analysisType, setAnalysisType] = useState('daily'); // daily, weekly, monthly
  const [showStaticData, setShowStaticData] = useState(true);

  // Static data for demonstration
  const staticData = {
    daily: {
      hourlyData: [
        { hour: '00:00', count: 0 },
        { hour: '01:00', count: 0 },
        { hour: '02:00', count: 0 },
        { hour: '03:00', count: 0 },
        { hour: '04:00', count: 0 },
        { hour: '05:00', count: 0 },
        { hour: '06:00', count: 1 },
        { hour: '07:00', count: 2 },
        { hour: '08:00', count: 5 },
        { hour: '09:00', count: 8 },
        { hour: '10:00', count: 12 },
        { hour: '11:00', count: 15 },
        { hour: '12:00', count: 18 },
        { hour: '13:00', count: 14 },
        { hour: '14:00', count: 16 },
        { hour: '15:00', count: 20 },
        { hour: '16:00', count: 22 },
        { hour: '17:00', count: 18 },
        { hour: '18:00', count: 12 },
        { hour: '19:00', count: 8 },
        { hour: '20:00', count: 4 },
        { hour: '21:00', count: 2 },
        { hour: '22:00', count: 1 },
        { hour: '23:00', count: 0 }
      ],
      purposeData: [
        { name: 'Cyber Police Station', count: 25, percentage: 22 },
        { name: 'Antiterrorism Squad', count: 20, percentage: 18 },
        { name: 'District Special Branch', count: 18, percentage: 16 },
        { name: 'Economic Offences Wing', count: 15, percentage: 13 },
        { name: 'Anti-Human Trafficking Unit', count: 12, percentage: 11 },
        { name: 'Control Room', count: 10, percentage: 9 },
        { name: 'Local Crime Branch', count: 8, percentage: 7 },
        { name: 'Security Branch', count: 7, percentage: 6 },
        { name: 'Welfare Branch', count: 6, percentage: 5 },
        { name: 'Mahila Cell', count: 5, percentage: 4 },
        { name: 'Application Branch', count: 4, percentage: 3 },
        { name: 'Superintendent of Police (SP)', count: 3, percentage: 3 },
        { name: 'Additional Superintendent of Police (Additional SP)', count: 2, percentage: 2 }
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
        { name: 'Superintendent of Police (SP)', count: 6, percentage: 5 },
        { name: 'Mahila Cell', count: 7, percentage: 6 },
        { name: 'Security Branch', count: 8, percentage: 7 },
        { name: 'Additional Superintendent of Police (Additional SP)', count: 2, percentage: 2 }
      ],
      dailyTrends: [
        { date: '12/01', visitors: 45, avgDuration: 120 },
        { date: '12/02', visitors: 52, avgDuration: 135 },
        { date: '12/03', visitors: 38, avgDuration: 110 },
        { date: '12/04', visitors: 61, avgDuration: 145 },
        { date: '12/05', visitors: 48, avgDuration: 125 },
        { date: '12/06', visitors: 55, avgDuration: 130 },
        { date: '12/07', visitors: 42, avgDuration: 115 }
      ]
    },
    weekly: {
      hourlyData: [
        { hour: '00:00', count: 2 },
        { hour: '01:00', count: 1 },
        { hour: '02:00', count: 0 },
        { hour: '03:00', count: 0 },
        { hour: '04:00', count: 1 },
        { hour: '05:00', count: 2 },
        { hour: '06:00', count: 8 },
        { hour: '07:00', count: 15 },
        { hour: '08:00', count: 35 },
        { hour: '09:00', count: 58 },
        { hour: '10:00', count: 85 },
        { hour: '11:00', count: 105 },
        { hour: '12:00', count: 125 },
        { hour: '13:00', count: 98 },
        { hour: '14:00', count: 112 },
        { hour: '15:00', count: 140 },
        { hour: '16:00', count: 155 },
        { hour: '17:00', count: 125 },
        { hour: '18:00', count: 85 },
        { hour: '19:00', count: 58 },
        { hour: '20:00', count: 28 },
        { hour: '21:00', count: 15 },
        { hour: '22:00', count: 8 },
        { hour: '23:00', count: 3 }
      ],
      purposeData: [
        { name: 'Cyber Police Station', count: 175, percentage: 22 },
        { name: 'Antiterrorism Squad', count: 155, percentage: 19 },
        { name: 'District Special Branch', count: 125, percentage: 16 },
        { name: 'Economic Offences Wing', count: 110, percentage: 14 },
        { name: 'Anti-Human Trafficking Unit', count: 95, percentage: 12 },
        { name: 'Control Room', count: 75, percentage: 9 },
        { name: 'Local Crime Branch', count: 55, percentage: 7 },
        { name: 'Security Branch', count: 45, percentage: 6 },
        { name: 'Welfare Branch', count: 35, percentage: 4 },
        { name: 'Mahila Cell', count: 25, percentage: 3 },
        { name: 'Application Branch', count: 20, percentage: 3 },
        { name: 'Superintendent of Police (SP)', count: 15, percentage: 2 },
        { name: 'Additional Superintendent of Police (Additional SP)', count: 10, percentage: 1 }
      ],
      departmentData: [
        { name: 'Cyber Police Station', count: 245, percentage: 31 },
        { name: 'Antiterrorism Squad', count: 195, percentage: 24 },
        { name: 'District Special Branch', count: 155, percentage: 19 },
        { name: 'Economic Offences Wing', count: 125, percentage: 16 },
        { name: 'Anti-Human Trafficking Unit', count: 45, percentage: 6 },
        { name: 'Security Branch', count: 20, percentage: 3 },
        { name: 'Control Room', count: 15, percentage: 2 }
      ],
      dailyTrends: [
        { date: 'Week 1', visitors: 320, avgDuration: 125 },
        { date: 'Week 2', visitors: 285, avgDuration: 118 },
        { date: 'Week 3', visitors: 350, avgDuration: 135 },
        { date: 'Week 4', visitors: 295, avgDuration: 122 }
      ]
    },
    monthly: {
      hourlyData: [
        { hour: '00:00', count: 8 },
        { hour: '01:00', count: 5 },
        { hour: '02:00', count: 3 },
        { hour: '03:00', count: 2 },
        { hour: '04:00', count: 4 },
        { hour: '05:00', count: 8 },
        { hour: '06:00', count: 32 },
        { hour: '07:00', count: 60 },
        { hour: '08:00', count: 140 },
        { hour: '09:00', count: 232 },
        { hour: '10:00', count: 340 },
        { hour: '11:00', count: 420 },
        { hour: '12:00', count: 500 },
        { hour: '13:00', count: 392 },
        { hour: '14:00', count: 448 },
        { hour: '15:00', count: 560 },
        { hour: '16:00', count: 620 },
        { hour: '17:00', count: 500 },
        { hour: '18:00', count: 340 },
        { hour: '19:00', count: 232 },
        { hour: '20:00', count: 112 },
        { hour: '21:00', count: 60 },
        { hour: '22:00', count: 32 },
        { hour: '23:00', count: 12 }
      ],
      purposeData: [
        { name: 'Cyber Police Station', count: 700, percentage: 25 },
        { name: 'Antiterrorism Squad', count: 620, percentage: 22 },
        { name: 'District Special Branch', count: 500, percentage: 18 },
        { name: 'Economic Offences Wing', count: 420, percentage: 15 },
        { name: 'Anti-Human Trafficking Unit', count: 350, percentage: 12 },
        { name: 'Control Room', count: 280, percentage: 10 },
        { name: 'Local Crime Branch', count: 210, percentage: 8 },
        { name: 'Security Branch', count: 180, percentage: 6 },
        { name: 'Welfare Branch', count: 140, percentage: 5 },
        { name: 'Mahila Cell', count: 105, percentage: 4 },
        { name: 'Application Branch', count: 70, percentage: 3 },
        { name: 'Superintendent of Police (SP)', count: 56, percentage: 2 },
        { name: 'Additional Superintendent of Police (Additional SP)', count: 35, percentage: 1 }
      ],
      departmentData: [
        { name: 'Cyber Police Station', count: 980, percentage: 35 },
        { name: 'Antiterrorism Squad', count: 780, percentage: 28 },
        { name: 'District Special Branch', count: 560, percentage: 20 },
        { name: 'Economic Offences Wing', count: 420, percentage: 15 },
        { name: 'Anti-Human Trafficking Unit', count: 56, percentage: 2 }
      ],
      dailyTrends: [
        { date: 'Jan', visitors: 1250, avgDuration: 130 },
        { date: 'Feb', visitors: 1180, avgDuration: 125 },
        { date: 'Mar', visitors: 1350, avgDuration: 135 },
        { date: 'Apr', visitors: 1420, avgDuration: 140 },
        { date: 'May', visitors: 1380, avgDuration: 138 },
        { date: 'Jun', visitors: 1450, avgDuration: 142 },
        { date: 'Jul', visitors: 1520, avgDuration: 145 },
        { date: 'Aug', visitors: 1480, avgDuration: 143 },
        { date: 'Sep', visitors: 1550, avgDuration: 147 },
        { date: 'Oct', visitors: 1620, avgDuration: 150 },
        { date: 'Nov', visitors: 1580, avgDuration: 148 },
        { date: 'Dec', visitors: 1650, avgDuration: 152 }
      ]
    }
  };

  useEffect(() => {
    if (!showStaticData) {
      fetchAnalyticsData();
    }
  }, [selectedPeriod, selectedDateRange, showStaticData]);

  // Sync analysis type with server period when on live data
  useEffect(() => {
    if (!showStaticData) {
      if (analysisType === 'daily') setSelectedPeriod('1d');
      else if (analysisType === 'weekly') setSelectedPeriod('7d');
      else if (analysisType === 'monthly') setSelectedPeriod('30d');
    }
  }, [analysisType, showStaticData]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { mockApi } = await import('../utils/mockData');

      // Fetch traffic analytics
      const trafficData = await mockApi.getTraffic(selectedPeriod, selectedDateRange.startDate, selectedDateRange.endDate);

      // Fetch dashboard data
      const dashboardData = await mockApi.getDashboard();

      // Fetch trends
      const trendsData = await mockApi.getAnalyticsTrends(selectedPeriod);

      // Fetch security insights
      const securityData = await mockApi.getSecurityInsights();

      // Fetch emergency data
      const emergencyData = await mockApi.getEmergencies();
      let emergencyStats = {
        active: 0,
        resolved: 0,
        cancelled: 0,
        departmental: 0,
        visitor: 0
      };

      if (emergencyData && emergencyData.emergencies) {
        // Calculate stats
        emergencyStats = {
          active: emergencyData.emergencies.filter(e => e.status === 'Active').length,
          resolved: emergencyData.emergencies.filter(e => e.status === 'Resolved').length,
          cancelled: emergencyData.emergencies.filter(e => e.status === 'Cancelled').length,
          departmental: emergencyData.emergencies.filter(e => e.type === 'Departmental').length,
          visitor: emergencyData.emergencies.filter(e => e.type === 'Visitor').length
        };
      }

      setAnalyticsData({
        traffic: trafficData,
        dashboard: dashboardData,
        trends: trendsData,
        security: securityData,
        emergency: emergencyStats
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to static data on error
      setShowStaticData(true);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899'];

  const periodOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  const analysisTypeOptions = [
    { value: 'daily', label: 'Daily Analysis' },
    { value: 'weekly', label: 'Weekly Analysis' },
    { value: 'monthly', label: 'Monthly Analysis' }
  ];

  // Get current data based on analysis type and static/API data
  const getCurrentData = () => {
    if (showStaticData) {
      return staticData[analysisType];
    }

    // Use API data if available, otherwise fallback to static
    const currentStaticData = staticData[analysisType];

    return {
      hourlyData: analyticsData.traffic.hourlyData || currentStaticData.hourlyData,
      purposeData: analyticsData.traffic.purposeData || currentStaticData.purposeData,
      departmentData: analyticsData.traffic.departmentData || currentStaticData.departmentData,
      dailyTrends: analyticsData.traffic.dailyData || analyticsData.trends || currentStaticData.dailyTrends
    };
  };

  const formatHourlyData = (hourlyData) => {
    if (!hourlyData || hourlyData.length === 0) {
      return staticData[analysisType].hourlyData;
    }

    if (showStaticData) {
      return hourlyData;
    }

    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const data = hourlyData.find(d => d._id?.hour === hour);
      return {
        hour: `${hour}:00`,
        count: data ? data.count : 0
      };
    });
  };

  const formatDailyData = (dailyData) => {
    if (!dailyData || dailyData.length === 0) {
      return staticData[analysisType].dailyTrends;
    }

    if (showStaticData) {
      return dailyData;
    }

    return dailyData.map(day => ({
      date: `${day.month || day._id?.month || '1'}/${day.day || day._id?.day || '1'}`,
      visitors: day.count || day.visitors,
      avgDuration: day.avgDuration ? Math.round(day.avgDuration) : 0
    }));
  };

  const formatPurposeData = (purposeData) => {
    if (!purposeData || purposeData.length === 0) {
      return staticData[analysisType].purposeData;
    }

    if (showStaticData) {
      return purposeData;
    }

    const total = purposeData.reduce((sum, item) => sum + (item.count || 0), 0);
    return purposeData.map(item => ({
      name: item._id || item.name,
      count: item.count || 0,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));
  };

  const formatDepartmentData = (departmentData) => {
    if (!departmentData || departmentData.length === 0) {
      return staticData[analysisType].departmentData;
    }

    if (showStaticData) {
      return departmentData;
    }

    const total = departmentData.reduce((sum, item) => sum + (item.count || 0), 0);
    const formatted = departmentData.map(item => ({
      name: item._id || item.name || 'Unknown Department',
      count: Number(item.count) || 0,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    // console.log('Formatted department data:', formatted);
    return formatted;
  };

  const getDashboardMetrics = () => {
    if (showStaticData) {
      const currentData = staticData[analysisType];
      const totalVisitors = currentData.dailyTrends.reduce((sum, day) => sum + day.visitors, 0);
      const avgDuration = currentData.dailyTrends.reduce((sum, day) => sum + day.avgDuration, 0) / currentData.dailyTrends.length;
      const peakHour = currentData.hourlyData.reduce((max, hour) => hour.count > max.count ? hour : max, { count: 0, hour: '10:00' });
      
      // Extract hour number from format like "10:00"
      let hourNum = '10';
      if (peakHour.hour && typeof peakHour.hour === 'string' && peakHour.hour.includes(':')) {
        hourNum = peakHour.hour.split(':')[0];
      }

      return {
        todayVisitors: totalVisitors,
        currentVisitors: Math.floor(totalVisitors * 0.3),
        avgDuration: Math.round(avgDuration),
        peakHour: hourNum || '10',
        totalVisitors: totalVisitors
      };
    }

    const peakHourData = analyticsData.traffic?.peakHours?.[0];
    let peakHour = '10';
    if (peakHourData) {
      const hourValue = peakHourData._id || peakHourData.hour || '10';
      // Convert to string if it's a number
      const hourStr = String(hourValue);
      if (hourStr.includes(':')) {
        peakHour = hourStr.split(':')[0];
      } else {
        peakHour = hourStr;
      }
    }

    return {
      todayVisitors: analyticsData.dashboard?.todayVisitors || 0,
      currentVisitors: analyticsData.dashboard?.currentVisitors || 0,
      avgDuration: analyticsData.traffic?.avgDuration ? Math.round(analyticsData.traffic.avgDuration) : 0,
      peakHour: peakHour || '10',
      totalVisitors: analyticsData.dashboard?.todayVisitors || 0
    };
  };

  // Enhanced analytics report generation with detailed insights
  const exportReport = async (format = 'md') => {
    try {
      // Get current data based on analysis type
      const data = getCurrentData();
      const metrics = getDashboardMetrics();

      // Format the data for the report
      const hourlyData = formatHourlyData(data.hourlyData);
      const purposeData = formatPurposeData(data.purposeData);
      const departmentData = formatDepartmentData(data.departmentData);
      const dailyTrends = formatDailyData(data.dailyTrends);

      // Calculate additional insights
      const totalVisitors = hourlyData.reduce((sum, hour) => sum + hour.count, 0);
      const peakHourData = hourlyData.find(h => h.hour === `${metrics.peakHour}:00`);
      const avgVisitorsPerHour = totalVisitors / 24;
      const busiestHours = hourlyData.sort((a, b) => b.count - a.count).slice(0, 3);
      const quietestHours = hourlyData.sort((a, b) => a.count - b.count).slice(0, 3);
      
      // Security insights
      const unusualActivity = showStaticData ? Math.floor(Math.random() * 5) : analyticsData.security.unusualActivity?.count || 0;
      const highSecurityVisitors = showStaticData ? Math.floor(Math.random() * 3) : analyticsData.security.highSecurityVisitors?.length || 0;
      const longVisits = showStaticData ? Math.floor(Math.random() * 8) : analyticsData.security.longVisits?.length || 0;

      // Format date for filename
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const timeStr = `${String(today.getHours()).padStart(2, '0')}-${String(today.getMinutes()).padStart(2, '0')}`;

      if (format === 'pdf') {
        toast.loading('Generating comprehensive PDF report...', { id: 'export' });
        try {
          // Generate beautiful HTML-based PDF (like Dashboard)
          const reportHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visitor Management System - Analytics Report</title>
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
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 1.1em; }
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
        .insights h4 { margin: 0 0 10px 0; color: #1976d2; }
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
        <p>Analytics Report - ${analysisType.toUpperCase()} Analysis</p>
        <p>Generated: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}</p>
    </div>

    <div class="summary-grid">
        <div class="summary-card">
            <h3>Total Visitors</h3>
            <p class="value">${totalVisitors}</p>
        </div>
        <div class="summary-card">
            <h3>Current Active</h3>
            <p class="value">${metrics.currentVisitors}</p>
        </div>
        <div class="summary-card">
            <h3>Average Duration</h3>
            <p class="value">${metrics.avgDuration.toFixed(1)}m</p>
        </div>
        <div class="summary-card">
            <h3>Peak Hour</h3>
            <p class="value">${metrics.peakHour}:00</p>
        </div>
    </div>

    <div class="section">
        <h2>Department Analysis</h2>
        <div class="chart-container">
            <canvas id="departmentChart"></canvas>
        </div>
        <div class="insights">
            <h4>Key Insights</h4>
            <p>${departmentData[0]?.name || 'N/A'} received the highest traffic with ${departmentData[0]?.count || 0} visitors (${departmentData[0]?.percentage || 0}%).</p>
        </div>
    </div>

    <div class="section">
        <h2>Visit Purpose Analysis</h2>
        <div class="chart-container">
            <canvas id="purposeChart"></canvas>
        </div>
        <div class="insights">
            <h4>Key Insights</h4>
            <p>Most visitors came for "${purposeData[0]?.name || 'N/A'}" (${purposeData[0]?.count || 0} visitors).</p>
        </div>
    </div>

    <div class="section">
        <h2>Hourly Distribution</h2>
        <div class="chart-container">
            <canvas id="hourlyChart"></canvas>
        </div>
    </div>

    <div class="section">
        <h2>Detailed Department Breakdown</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Department</th>
                    <th>Visits</th>
                    <th>Percentage</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${departmentData.map((dept, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${dept.name}</td>
                    <td>${dept.count}</td>
                    <td>${dept.percentage}%</td>
                    <td>${index === 0 ? '🔴 High Traffic' : index === 1 ? '🟡 Medium Traffic' : '🟢 Normal'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Purpose Breakdown</h2>
        <table class="table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Purpose</th>
                    <th>Visits</th>
                    <th>Percentage</th>
                </tr>
            </thead>
            <tbody>
                ${purposeData.map((purpose, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${purpose.name}</td>
                    <td>${purpose.count}</td>
                    <td>${purpose.percentage}%</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
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
                labels: ${JSON.stringify(departmentData.map(d => d.name))},
                datasets: [{
                    data: ${JSON.stringify(departmentData.map(d => d.count))},
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#4BC0C0', '#9966FF', '#FF9F40', '#36A2EB', '#FFCE56'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Department Visitor Distribution' }
                }
            }
        });

        // Purpose Chart
        const purposeCtx = document.getElementById('purposeChart').getContext('2d');
        new Chart(purposeCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(purposeData.map(p => p.name))},
                datasets: [{
                    label: 'Visitors',
                    data: ${JSON.stringify(purposeData.map(p => p.count))},
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    title: { display: true, text: 'Visit Purpose Distribution' }
                }
            }
        });

        // Hourly Chart
        const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
        new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: ${JSON.stringify(hourlyData.map(h => h.hour || h._id))},
                datasets: [{
                    label: 'Visitors',
                    data: ${JSON.stringify(hourlyData.map(h => h.count))},
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
                    y: { beginAtZero: true }
                },
                plugins: {
                    title: { display: true, text: 'Hourly Visitor Distribution' }
                }
            }
        });
    </script>
</body>
</html>`;

          const blob = new Blob([reportHTML], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `VMS-Analytics-Report-${analysisType}-${dateStr}-${timeStr}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast.success('Beautiful HTML report generated successfully!', { id: 'export' });
        } catch (error) {
          console.error('Error generating PDF:', error);
          toast.error('Failed to generate PDF. Please try again.', { id: 'export' });
        }
      } else if (format === 'excel') {
        toast.loading('Generating comprehensive Excel report...', { id: 'export' });
        try {
          const { default: XLSX } = await import('xlsx');
          const { default: FileSaver } = await import('file-saver');
          
          const wb = XLSX.utils.book_new();

          // Executive Summary Sheet
          const summaryData = [
            ['VISITOR MANAGEMENT SYSTEM - ANALYTICS REPORT'],
            [''],
            ['Report Information'],
            ['Generated On', `${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`],
            ['Analysis Type', analysisType.toUpperCase()],
            ['Data Source', showStaticData ? 'Demo Data' : 'Live Database'],
            [''],
            ['Key Metrics'],
            ['Total Visitors', totalVisitors],
            ['Current Active Visitors', metrics.currentVisitors],
            ['Average Visit Duration (minutes)', metrics.avgDuration.toFixed(1)],
            ['Peak Hour', `${metrics.peakHour}:00`],
            ['Peak Hour Visitors', peakHourData?.count || 0],
            ['Average Visitors per Hour', avgVisitorsPerHour.toFixed(1)],
            [''],
            ['Security Insights'],
            ['Unusual Activity Incidents', unusualActivity],
            ['High Security Visitors', highSecurityVisitors],
            ['Long Duration Visits', longVisits],
            [''],
            ['Busiest Hours'],
            ...busiestHours.map((hour, index) => [`${index + 1}. ${hour.hour}`, hour.count]),
            [''],
            ['Quietest Hours'],
            ...quietestHours.map((hour, index) => [`${index + 1}. ${hour.hour}`, hour.count])
          ];
          const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
          XLSX.utils.book_append_sheet(wb, summarySheet, 'Executive Summary');

          // Department Analysis Sheet
          if (departmentData && departmentData.length > 0) {
            const deptData = [
              ['Department Analysis'],
              [''],
              ['Rank', 'Department', 'Total Visits', 'Percentage', 'Insights'],
              ...departmentData.map((dept, index) => [
                index + 1,
                dept.name,
                dept.count,
                `${dept.percentage}%`,
                index === 0 ? 'Highest Traffic' : index === departmentData.length - 1 ? 'Lowest Traffic' : 'Moderate Traffic'
              ])
            ];
            const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
            XLSX.utils.book_append_sheet(wb, deptSheet, 'Department Analysis');
          }

          // Purpose Analysis Sheet
          if (purposeData && purposeData.length > 0) {
            const purposeSheetData = [
              ['Visit Purpose Analysis'],
              [''],
              ['Rank', 'Purpose', 'Total Visits', 'Percentage', 'Category'],
              ...purposeData.map((purpose, index) => [
                index + 1,
                purpose.name,
                purpose.count,
                `${purpose.percentage}%`,
                purpose.percentage > 20 ? 'High Priority' : purpose.percentage > 10 ? 'Medium Priority' : 'Low Priority'
              ])
            ];
            const purposeSheet = XLSX.utils.aoa_to_sheet(purposeSheetData);
            XLSX.utils.book_append_sheet(wb, purposeSheet, 'Purpose Analysis');
          }

          // Hourly Analysis Sheet
          if (hourlyData && hourlyData.length > 0) {
            const hourlySheetData = [
              ['Hourly Visitor Distribution'],
              [''],
              ['Hour', 'Visitors', 'Category', 'Recommendation'],
              ...hourlyData.map(hour => [
                hour.hour,
                hour.count,
                hour.count > avgVisitorsPerHour * 1.5 ? 'Peak' : hour.count < avgVisitorsPerHour * 0.5 ? 'Quiet' : 'Normal',
                hour.count > avgVisitorsPerHour * 1.5 ? 'Increase Staff' : hour.count < avgVisitorsPerHour * 0.5 ? 'Reduce Staff' : 'Maintain Staff'
              ])
            ];
            const hourlySheet = XLSX.utils.aoa_to_sheet(hourlySheetData);
            XLSX.utils.book_append_sheet(wb, hourlySheet, 'Hourly Analysis');
          }

          // Trends Analysis Sheet
          if (dailyTrends && dailyTrends.length > 0) {
            const trendsData = [
              ['Visitor Trends Analysis'],
              [''],
              ['Date/Period', 'Total Visitors', 'Average Duration', 'Trend', 'Growth Rate'],
              ...dailyTrends.map((trend, index) => [
                trend.date,
                trend.visitors,
                trend.avgDuration,
                index > 0 ? (trend.visitors > dailyTrends[index - 1].visitors ? 'Increasing' : 'Decreasing') : 'Baseline',
                index > 0 ? `${(((trend.visitors - dailyTrends[index - 1].visitors) / dailyTrends[index - 1].visitors) * 100).toFixed(1)}%` : 'N/A'
              ])
            ];
            const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
            XLSX.utils.book_append_sheet(wb, trendsSheet, 'Trends Analysis');
          }

          // Security Analysis Sheet
          const securityData = [
            ['Security Analysis'],
            [''],
            ['Security Metric', 'Count', 'Risk Level', 'Action Required'],
            ['Unusual Activity', unusualActivity, unusualActivity > 3 ? 'High' : unusualActivity > 1 ? 'Medium' : 'Low', unusualActivity > 3 ? 'Immediate Review' : 'Monitor'],
            ['High Security Visitors', highSecurityVisitors, highSecurityVisitors > 2 ? 'High' : 'Medium', 'Enhanced Monitoring'],
            ['Long Duration Visits', longVisits, longVisits > 5 ? 'Medium' : 'Low', 'Check Visitor Status'],
            [''],
            ['Security Recommendations'],
            ['1. Implement additional monitoring during quiet hours'],
            ['2. Review high-security visitor protocols'],
            ['3. Establish automated alerts for long-duration visits'],
            ['4. Regular security assessment based on visitor patterns']
          ];
          const securitySheet = XLSX.utils.aoa_to_sheet(securityData);
          XLSX.utils.book_append_sheet(wb, securitySheet, 'Security Analysis');

          // Strategic Recommendations Sheet
          const recommendationsData = [
            ['Strategic Recommendations'],
            [''],
            ['Priority', 'Recommendation', 'Impact', 'Timeline', 'Resources Required'],
            ['High', `Increase staff at ${departmentData[0]?.name || 'top departments'} during peak hours`, 'High', 'Immediate', 'Additional Staff'],
            ['High', `Optimize visitor flow for "${purposeData[0]?.name || 'common purposes'}"`, 'High', '1-2 weeks', 'Process Redesign'],
            ['Medium', `Monitor unusual activity during ${quietestHours[0]?.hour}-${quietestHours[2]?.hour}`, 'Medium', 'Ongoing', 'Security Personnel'],
            ['Medium', `Prepare for ${Math.round(peakHourData?.count * 1.2 || 0)} visitors during peak hours`, 'High', '1 month', 'Capacity Planning'],
            ['Low', 'Review visitor duration trends for efficiency', 'Medium', '2-4 weeks', 'Data Analysis'],
            ['Low', 'Update emergency protocols based on insights', 'High', '1-2 months', 'Policy Review'],
            [''],
            ['Implementation Notes'],
            ['• All recommendations should be reviewed by management'],
            ['• Resource allocation should consider budget constraints'],
            ['• Implementation should be phased for minimal disruption'],
            ['• Regular monitoring and adjustment of strategies is essential']
          ];
          const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);
          XLSX.utils.book_append_sheet(wb, recommendationsSheet, 'Recommendations');

          // Generate Excel file
          const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });
          FileSaver.saveAs(blob, `VMS-Analytics-Report-${analysisType}-${dateStr}-${timeStr}.xlsx`);
          toast.success('Comprehensive Excel report generated successfully!', { id: 'export' });
        } catch (error) {
          console.error('Error generating Excel:', error);
          toast.error('Failed to generate Excel file. Please try again.', { id: 'export' });
        }
      } else {
        toast.loading('Generating comprehensive Markdown report...', { id: 'export' });
        try {
          let reportContent = `# Visitor Management System - Comprehensive Analytics Report\n\n`;
          reportContent += `## 📊 Report Information\n`;
          reportContent += `- **Generated:** ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}\n`;
          reportContent += `- **Analysis Type:** ${analysisType.toUpperCase()}\n`;
          reportContent += `- **Data Source:** ${showStaticData ? 'Demo Data' : 'Live Database'}\n`;
          reportContent += `- **Report ID:** VMS-${analysisType}-${dateStr}-${timeStr}\n\n`;

          // Executive Summary
          reportContent += `## 🎯 Executive Summary\n\n`;
          reportContent += `### Key Metrics\n`;
          reportContent += `| Metric | Value |\n`;
          reportContent += `|--------|-------|\n`;
          reportContent += `| Total Visitors | ${totalVisitors} |\n`;
          reportContent += `| Current Active Visitors | ${metrics.currentVisitors} |\n`;
          reportContent += `| Average Visit Duration | ${metrics.avgDuration.toFixed(1)} minutes |\n`;
          reportContent += `| Peak Hour | ${metrics.peakHour}:00 (${peakHourData?.count || 0} visitors) |\n`;
          reportContent += `| Average Visitors per Hour | ${avgVisitorsPerHour.toFixed(1)} |\n\n`;

          // Key Insights
          reportContent += `### 🔍 Key Insights\n`;
          reportContent += `- **Busiest Hours:** ${busiestHours.map(h => `${h.hour} (${h.count} visitors)`).join(', ')}\n`;
          reportContent += `- **Quietest Hours:** ${quietestHours.map(h => `${h.hour} (${h.count} visitors)`).join(', ')}\n`;
          reportContent += `- **Top Department:** ${departmentData[0]?.name || 'N/A'} with ${departmentData[0]?.count || 0} visits (${departmentData[0]?.percentage || 0}%)\n`;
          reportContent += `- **Primary Purpose:** ${purposeData[0]?.name || 'N/A'} with ${purposeData[0]?.count || 0} visits (${purposeData[0]?.percentage || 0}%)\n\n`;

          // Department Analysis
          reportContent += `## 🏢 Department Analysis\n\n`;
          reportContent += `| Rank | Department | Visits | Percentage | Insights |\n`;
          reportContent += `|------|------------|--------|------------|----------|\n`;
          departmentData.forEach((dept, index) => {
            const insight = index === 0 ? '🏆 Highest Traffic' : 
                          index === departmentData.length - 1 ? '📉 Lowest Traffic' : 
                          '📊 Moderate Traffic';
            reportContent += `| ${index + 1} | ${dept.name} | ${dept.count} | ${dept.percentage}% | ${insight} |\n`;
          });
          reportContent += `\n`;

          // Purpose Analysis
          reportContent += `## 🎯 Visit Purpose Analysis\n\n`;
          reportContent += `| Rank | Purpose | Visits | Percentage | Priority |\n`;
          reportContent += `|------|---------|--------|------------|----------|\n`;
          purposeData.forEach((purpose, index) => {
            const priority = purpose.percentage > 20 ? '🔴 High' : 
                           purpose.percentage > 10 ? '🟡 Medium' : 
                           '🟢 Low';
            reportContent += `| ${index + 1} | ${purpose.name} | ${purpose.count} | ${purpose.percentage}% | ${priority} |\n`;
          });
          reportContent += `\n`;

          // Time Analysis
          reportContent += `## ⏰ Time Analysis\n\n`;
          reportContent += `### Peak Hours Analysis\n`;
          busiestHours.forEach((hour, index) => {
            reportContent += `${index + 1}. **${hour.hour}** - ${hour.count} visitors\n`;
          });
          reportContent += `\n### Quiet Hours Analysis\n`;
          quietestHours.forEach((hour, index) => {
            reportContent += `${index + 1}. **${hour.hour}** - ${hour.count} visitors\n`;
          });
          reportContent += `\n`;

          // Security Insights
          reportContent += `## 🔒 Security Insights\n\n`;
          reportContent += `| Security Metric | Count | Risk Level | Action Required |\n`;
          reportContent += `|-----------------|-------|------------|-----------------|\n`;
          reportContent += `| Unusual Activity | ${unusualActivity} | ${unusualActivity > 3 ? '🔴 High' : unusualActivity > 1 ? '🟡 Medium' : '🟢 Low'} | ${unusualActivity > 3 ? 'Immediate Review' : 'Monitor'} |\n`;
          reportContent += `| High Security Visitors | ${highSecurityVisitors} | ${highSecurityVisitors > 2 ? '🔴 High' : '🟡 Medium'} | Enhanced Monitoring |\n`;
          reportContent += `| Long Duration Visits | ${longVisits} | ${longVisits > 5 ? '🟡 Medium' : '🟢 Low'} | Check Visitor Status |\n\n`;

          // Strategic Recommendations
          reportContent += `## 📋 Strategic Recommendations\n\n`;
          const recommendations = [
            { priority: '🔴 High', rec: `Increase staff at ${departmentData[0]?.name || 'top departments'} during peak hours (${metrics.peakHour}:00)`, impact: 'High', timeline: 'Immediate' },
            { priority: '🔴 High', rec: `Optimize visitor flow for "${purposeData[0]?.name || 'common purposes'}"`, impact: 'High', timeline: '1-2 weeks' },
            { priority: '🟡 Medium', rec: `Monitor unusual activity during ${quietestHours[0]?.hour}-${quietestHours[2]?.hour}`, impact: 'Medium', timeline: 'Ongoing' },
            { priority: '🟡 Medium', rec: `Prepare for ${Math.round(peakHourData?.count * 1.2 || 0)} visitors during peak hours`, impact: 'High', timeline: '1 month' },
            { priority: '🟢 Low', rec: 'Review visitor duration trends for efficiency improvements', impact: 'Medium', timeline: '2-4 weeks' },
            { priority: '🟢 Low', rec: 'Update emergency protocols based on current insights', impact: 'High', timeline: '1-2 months' }
          ];

          recommendations.forEach((rec, index) => {
            reportContent += `### ${index + 1}. ${rec.priority} Priority\n`;
            reportContent += `**Recommendation:** ${rec.rec}\n\n`;
            reportContent += `- **Impact:** ${rec.impact}\n`;
            reportContent += `- **Timeline:** ${rec.timeline}\n\n`;
          });

          // Implementation Notes
          reportContent += `## 📝 Implementation Notes\n\n`;
          reportContent += `- All recommendations should be reviewed by management before implementation\n`;
          reportContent += `- Resource allocation should consider budget constraints and operational capacity\n`;
          reportContent += `- Implementation should be phased to minimize disruption to daily operations\n`;
          reportContent += `- Regular monitoring and adjustment of strategies is essential for success\n`;
          reportContent += `- Consider pilot programs for high-impact recommendations\n\n`;

          // Footer
          reportContent += `---\n`;
          reportContent += `*Report generated by Visitor Management System Analytics Dashboard*\n`;
          reportContent += `*For questions or clarifications, contact the system administrator*\n`;

          // Create and download the file
          const blob = new Blob([reportContent], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `VMS-Analytics-Report-${analysisType}-${dateStr}-${timeStr}.md`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Comprehensive Markdown report generated successfully!', { id: 'export' });
        } catch (error) {
          console.error('Error generating Markdown:', error);
          toast.error('Failed to generate Markdown file. Please try again.', { id: 'export' });
        }
      }
    } catch (error) {
      console.error('Error in exportReport:', error);
      toast.error('Failed to generate report. Please try again.', { id: 'export' });
    }
  };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    // Get current data and format it for display
    const currentData = getCurrentData();
    const metrics = getDashboardMetrics();

    // Format data for charts and metrics
    const hourlyData = currentData && currentData.hourlyData ?
      formatHourlyData(currentData.hourlyData) : [];
    const purposeData = currentData && currentData.purposeData ?
      formatPurposeData(currentData.purposeData) : [];
    const departmentData = currentData && currentData.departmentData ?
      formatDepartmentData(currentData.departmentData) : [];
    const dailyTrends = currentData && currentData.dailyTrends ?
      formatDailyData(currentData.dailyTrends) : [];

    return (
      <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">Analytics Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
              Comprehensive insights into visitor traffic and patterns
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowStaticData(!showStaticData)}
              className={`btn-secondary flex items-center justify-center space-x-2 text-xs sm:text-sm ${showStaticData ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}
            >
              {showStaticData ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
              <span className="hidden xs:inline">{showStaticData ? 'Demo Data' : 'Live Data'}</span>
            </button>
            <div className="relative inline-block">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('exportDropdown');
                  dropdown.classList.toggle('hidden');
                }}
                className="btn-secondary flex items-center justify-center space-x-2 text-xs sm:text-sm">
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Export Report</span>
              </button>
              <div id="exportDropdown" className="hidden absolute right-0 mt-2 w-40 sm:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={() => exportReport('md')}
                    className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Markdown (.md)
                  </button>
                  <button
                    onClick={() => exportReport('pdf')}
                    className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    PDF Document (.pdf)
                  </button>
                  <button
                    onClick={() => exportReport('excel')}
                    className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <FileSpreadsheet className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Excel Spreadsheet (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Type Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Analysis Type</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                {analysisTypeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setAnalysisType(option.value)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${analysisType === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Period:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="form-input w-40"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Range:</label>
              <input
                type="date"
                value={selectedDateRange.startDate}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="form-input w-40"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={selectedDateRange.endDate}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="form-input w-40"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data Source:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="static"
                  name="dataSource"
                  checked={showStaticData}
                  onChange={() => setShowStaticData(true)}
                  className="form-radio"
                />
                <label htmlFor="static" className="text-sm text-gray-700 dark:text-gray-300">Demo Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="api"
                  name="dataSource"
                  checked={!showStaticData}
                  onChange={() => setShowStaticData(false)}
                  className="form-radio"
                />
                <label htmlFor="api" className="text-sm text-gray-700 dark:text-gray-300">Live Data</label>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Total Visitors</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.todayVisitors}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1" />
                  <span className="text-xs sm:text-sm text-green-600">+12%</span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">vs yesterday</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Current Visitors</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.currentVisitors}
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 mr-1" />
                  <span className="text-xs sm:text-sm text-blue-600">Active</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Avg. Duration</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.avgDuration?.toFixed(2)}m
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 mr-1" />
                  <span className="text-xs sm:text-sm text-red-600">-5%</span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1 hidden sm:inline">vs last week</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Peak Hour</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {metrics.peakHour}:00
                </p>
                <div className="flex items-center mt-1 sm:mt-2">
                  <BarChart className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 mr-1" />
                  <span className="text-xs sm:text-sm text-orange-600">
                    {hourlyData.find(h => h.hour === `${metrics.peakHour}:00`)?.count || 0} visitors
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Hourly Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              {analysisType === 'daily' ? 'Hourly' : analysisType === 'weekly' ? 'Weekly Hourly' : 'Monthly Hourly'} Visitor Distribution
            </h3>
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
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

          {/* Purpose Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Visit Purposes</h3>
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={purposeData}
                    cx="40%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {purposeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, 'Visitors']}
                    labelFormatter={(label) => `Purpose: ${label}`}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '11px', paddingLeft: '20px' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Purpose Statistics with scroll */}
            <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
              {purposeData.map((purpose, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-48">{purpose.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{purpose.count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({purpose.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Daily Trends */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
              {analysisType === 'daily' ? 'Daily' : analysisType === 'weekly' ? 'Weekly' : 'Monthly'} Visitor Trends
            </h3>
            <div className="h-48 sm:h-64 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'visitors' ? 'Visitors' : 'Duration (min)']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line type="monotone" dataKey="visitors" stroke="#3B82F6" strokeWidth={2} name="Visitors" />
                  <Line type="monotone" dataKey="avgDuration" stroke="#10B981" strokeWidth={2} name="Avg Duration" />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">Department Visits</h3>
            <div className="h-64 sm:h-80 lg:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={departmentData}
                    cx="40%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    innerRadius={30}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, 'Visitors']}
                    labelFormatter={(label) => `Department: ${label}`}
                  />
                  <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: '11px', paddingLeft: '20px' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            {/* Department Statistics with scroll */}
            <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
              {departmentData.map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-48">{dept.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{dept.count}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({dept.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Unusual Activity</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {showStaticData ? Math.floor(Math.random() * 5) : analyticsData.security.unusualActivity?.count || 0}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">Late night/early morning visits</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">High Security</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {showStaticData ? Math.floor(Math.random() * 3) : analyticsData.security.highSecurityVisitors?.length || 0}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Currently in building</p>
                </div>
                <Shield className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Long Visits</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {showStaticData ? Math.floor(Math.random() * 8) : analyticsData.security.longVisits?.length || 0}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">Over 4 hours</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Departments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Top Departments</h3>
          <div className="space-y-4">
            {departmentData.slice(0, 5).map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                      {dept?.name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{dept.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Department</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{dept.count}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">visitors ({dept.percentage}%)</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {showStaticData
                ? 'Currently displaying demo data. Switch to "Live Data" to see real-time analytics from your database.'
                : 'Displaying live data from your database. Switch to "Demo Data" to see sample analytics.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  };

  export default Analytics;
