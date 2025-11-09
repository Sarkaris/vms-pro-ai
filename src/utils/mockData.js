// Mock data service for demo mode - no API calls, no database writes

// Generate mock visitors
const generateMockVisitors = () => {
  const statuses = ['Checked In', 'Checked Out'];
  const purposes = [
    'Anti-Human Trafficking Unit',
    'Antiterrorism Squad',
    'Application Branch',
    'Control Room',
    'Cyber Police Station',
    'District Special Branch',
    'Economic Offences Wing',
    'Local Crime Branch',
    'Mahila Cell',
    'Security Branch',
    'Welfare Branch',
    'Superintendent of Police (SP)',
    'Additional Superintendent of Police (Additional SP)'
  ];
  
  const names = [
    { first: 'John', last: 'Doe' },
    { first: 'Jane', last: 'Smith' },
    { first: 'Michael', last: 'Johnson' },
    { first: 'Sarah', last: 'Williams' },
    { first: 'David', last: 'Brown' },
    { first: 'Emily', last: 'Davis' },
    { first: 'Robert', last: 'Miller' },
    { first: 'Lisa', last: 'Wilson' },
    { first: 'James', last: 'Moore' },
    { first: 'Patricia', last: 'Taylor' },
    { first: 'Amit', last: 'Sharma' },
    { first: 'Priya', last: 'Patel' },
    { first: 'Raj', last: 'Kumar' },
    { first: 'Anjali', last: 'Singh' },
    { first: 'Vikram', last: 'Rao' }
  ];

  const visitors = [];
  const now = new Date();
  
  // Generate 30-40 visitors
  for (let i = 0; i < 35; i++) {
    const name = names[i % names.length];
    const checkInTime = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    const status = Math.random() > 0.4 ? 'Checked In' : 'Checked Out';
    const checkOutTime = status === 'Checked Out' 
      ? new Date(checkInTime.getTime() + Math.random() * 4 * 60 * 60 * 1000)
      : null;
    
    visitors.push({
      _id: `visitor_${i + 1}`,
      firstName: name.first,
      lastName: name.last,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@example.com`,
      phone: `9${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      company: ['Tech Corp', 'Global Inc', 'Solutions Ltd', 'Services Co', null][Math.floor(Math.random() * 5)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      hostName: ['A. Sharma', 'K. Rao', 'S. Patel', 'R. Kumar', 'M. Singh'][Math.floor(Math.random() * 5)],
      hostEmail: `host${Math.floor(Math.random() * 5) + 1}@vms.com`,
      hostDepartment: purposes[Math.floor(Math.random() * purposes.length)],
      checkInTime: checkInTime.toISOString(),
      checkOutTime: checkOutTime?.toISOString() || null,
      status: status,
      location: ['Main Lobby', 'Reception', 'Security Desk'][Math.floor(Math.random() * 3)],
      aadhaarId: Math.random() > 0.5 ? `${Math.floor(Math.random() * 900000000000) + 100000000000}` : null,
      panId: Math.random() > 0.7 ? `ABCDE${Math.floor(Math.random() * 9000) + 1000}F` : null,
      temperature: (36.5 + Math.random() * 1.5).toFixed(1),
      notes: Math.random() > 0.7 ? 'Regular visitor' : '',
      isVip: Math.random() > 0.9,
      securityLevel: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
      photo: null
    });
  }
  
  return visitors;
};

// Mock visitors data
let mockVisitors = generateMockVisitors();

// Mock admins data
const mockAdmins = [
  {
    _id: 'admin_1',
    username: 'admin',
    email: 'admin@vms.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Super Admin',
    department: 'IT',
    isActive: true,
    permissions: {
      canViewAnalytics: true,
      canManageVisitors: true,
      canManageAdmins: true,
      canExportData: true,
      canViewReports: true
    },
    createdAt: new Date().toISOString()
  },
  {
    _id: 'admin_2',
    username: 'security1',
    email: 'security@vms.com',
    firstName: 'Security',
    lastName: 'Guard',
    role: 'Security',
    department: 'Security',
    isActive: true,
    permissions: {
      canViewAnalytics: false,
      canManageVisitors: true,
      canManageAdmins: false,
      canExportData: false,
      canViewReports: false
    },
    createdAt: new Date().toISOString()
  }
];

// Mock emergencies data
const generateMockEmergencies = () => {
  const now = Date.now();
  return [
    {
      _id: 'emergency_1',
      incidentCode: 'EMG-20251109-143036-ABCD',
      type: 'Visitor',
      severity: 'High',
      status: 'Active',
      visitorFirstName: 'John',
      visitorLastName: 'Doe',
      visitorPhone: '9876543210',
      description: 'Visitor requires immediate medical attention',
      location: 'Main Lobby',
      reportedBy: 'Security Guard',
      reportedAt: new Date(now - 30 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 30 * 60 * 1000).toISOString(),
      resolvedAt: null,
      visitorId: mockVisitors[0]?._id || null
    },
    {
      _id: 'emergency_2',
      incidentCode: 'EMG-20251109-130636-EFGH',
      type: 'Departmental',
      severity: 'Medium',
      status: 'Active',
      departmentName: 'IT Department',
      pocName: 'Rahul Mehta',
      pocPhone: '9876543211',
      headcount: 5,
      description: 'Fire alarm triggered in Building B',
      location: 'Building B',
      reportedBy: 'System',
      reportedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
      resolvedAt: null
    },
    {
      _id: 'emergency_3',
      incidentCode: 'EMG-20251109-101036-IJKL',
      type: 'Visitor',
      severity: 'Low',
      status: 'Resolved',
      visitorFirstName: 'Jane',
      visitorLastName: 'Smith',
      visitorPhone: '9876543212',
      description: 'Lost visitor badge',
      location: 'Reception',
      reportedBy: 'Receptionist',
      reportedAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
      resolvedAt: new Date(now - 4 * 60 * 60 * 1000).toISOString()
    }
  ];
};

let mockEmergencies = generateMockEmergencies();

// Mock API service
export const mockApi = {
  // Auth
  login: async (email, password) => {
    if (email === 'admin@vms.com' && password === '123') {
      return {
        token: 'demo_token_12345',
        admin: {
          _id: 'admin_1',
          email: 'admin@vms.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'Super Admin',
          department: 'IT'
        }
      };
    }
    throw new Error('Invalid credentials');
  },

  getProfile: async () => {
    return {
      _id: 'admin_1',
      email: 'admin@vms.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'Super Admin',
      department: 'IT'
    };
  }, 

  logout: async () => {
    return { success: true };
  },

  // Visitors
  getVisitors: async () => {
    // Try server first
    try {
      const response = await fetch('/api/visitors');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for visitors');
    }
    return { visitors: mockVisitors };
  },

  findVisitor: async (identifier) => {
    // Try server first
    try {
      const response = await fetch(`/api/visitors/find?id=${encodeURIComponent(identifier)}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for find visitor');
    }
    // Fallback to mock
    const visitor = mockVisitors.find(v => 
      v.phone === identifier || 
      v.aadhaarId === identifier || 
      v.panId === identifier ||
      v.passportId === identifier
    );
    if (visitor) {
      return visitor;
    }
    return null;
  },

  getActiveVisitors: async () => {
    // Try server first
    try {
      const response = await fetch('/api/visitors/current/active');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for active visitors');
    }
    return { visitors: mockVisitors.filter(v => v.status === 'Checked In') };
  },

  createVisitor: async (visitorData) => {
    const newVisitor = {
      _id: `visitor_${Date.now()}`,
      ...visitorData,
      checkInTime: new Date().toISOString(),
      status: 'Checked In',
      checkOutTime: null
    };
    mockVisitors.unshift(newVisitor);
    return newVisitor;
  },

  updateVisitor: async (id, visitorData) => {
    const index = mockVisitors.findIndex(v => v._id === id);
    if (index !== -1) {
      mockVisitors[index] = { ...mockVisitors[index], ...visitorData };
      return mockVisitors[index];
    }
    throw new Error('Visitor not found');
  },

  checkoutVisitor: async (id) => {
    const index = mockVisitors.findIndex(v => v._id === id);
    if (index !== -1) {
      mockVisitors[index].status = 'Checked Out';
      mockVisitors[index].checkOutTime = new Date().toISOString();
      return mockVisitors[index];
    }
    throw new Error('Visitor not found');
  },

  getVisitorHistory: async (id) => {
    // Try server first
    try {
      const response = await fetch(`/api/visitors/${id}/history`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for visitor history');
    }
    // Return mock history
    return {
      history: [
        {
          checkInTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          checkOutTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
          purpose: 'Meeting',
          hostName: 'A. Sharma'
        }
      ]
    };
  },

  // Analytics
  getDashboard: async () => {
    // Try server first
    try {
      const response = await fetch('/api/analytics/dashboard');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for dashboard');
    }
    const currentVisitors = mockVisitors.filter(v => v.status === 'Checked In').length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = mockVisitors.filter(v => 
      new Date(v.checkInTime) >= today
    ).length;
    
    const overdueCount = mockVisitors.filter(v => {
      if (v.status !== 'Checked In') return false;
      const checkIn = new Date(v.checkInTime);
      const hoursSinceCheckIn = (Date.now() - checkIn.getTime()) / (1000 * 60 * 60);
      return hoursSinceCheckIn > 4; // Overdue if checked in more than 4 hours ago
    }).length;

    const activeEmergencies = mockEmergencies.filter(e => e.status === 'Active').length;

    // Popular purposes
    const purposeCounts = {};
    mockVisitors.forEach(v => {
      purposeCounts[v.purpose] = (purposeCounts[v.purpose] || 0) + 1;
    });
    const popularPurposes = Object.entries(purposeCounts)
      .map(([name, count]) => ({ name, count, percentage: Math.round((count / mockVisitors.length) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Top hosts
    const hostCounts = {};
    mockVisitors.forEach(v => {
      if (v.hostName) {
        hostCounts[v.hostName] = (hostCounts[v.hostName] || 0) + 1;
      }
    });
    const topHosts = Object.entries(hostCounts)
      .map(([name, count]) => ({ _id: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Hourly distribution
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => {
      const hour = String(i).padStart(2, '0') + ':00';
      const count = Math.floor(Math.random() * 20) + (i >= 9 && i <= 17 ? 10 : 0);
      return { hour, count };
    });

    // Department data
    const deptCounts = {};
    mockVisitors.forEach(v => {
      deptCounts[v.purpose] = (deptCounts[v.purpose] || 0) + 1;
    });
    const departmentData = Object.entries(deptCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / mockVisitors.length) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    // Recent activity
    const recentActivity = mockVisitors
      .filter(v => v.status === 'Checked In')
      .slice(0, 5)
      .map(v => ({
        name: `${v.firstName} ${v.lastName}`,
        action: 'checked in',
        at: v.checkInTime
      }));

    return {
      currentVisitors,
      todayVisitors,
      overdueCount,
      activeEmergencies,
      recentCheckins: todayVisitors,
      popularPurposes,
      topHosts,
      hourlyDistribution,
      departmentData,
      recentActivity
    };
  },

  getTraffic: async (period, startDate, endDate) => {
    // Try server first
    try {
      const url = `/api/analytics/traffic?period=${period}${startDate ? `&startDate=${startDate}` : ''}${endDate ? `&endDate=${endDate}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for traffic');
    }
    // Fallback
    const dashboard = await mockApi.getDashboard();
    return {
      departmentData: dashboard.departmentData,
      hourlyData: dashboard.hourlyDistribution
    };
  },

  getSidebar: async () => {
    // Try server first
    try {
      const response = await fetch('/api/analytics/sidebar');
      if (response.ok) {
        const data = await response.json();
        // Server returns: { currentVisitors, todayTotal, recentActivity }
        // Ensure we return the expected structure
        return {
          currentVisitors: Number(data.currentVisitors || 0),
          todayVisitors: Number(data.todayTotal || data.todayVisitors || 0), // Server uses todayTotal
          recentActivity: data.recentActivity || []
        };
      } else {
        console.log('Sidebar API response not OK:', response.status);
      }
    } catch (error) {
      console.log('Using mock data for sidebar:', error);
    }
    // Fallback to mock data
    const dashboard = await mockApi.getDashboard();
    return {
      currentVisitors: Number(dashboard.currentVisitors || 0),
      todayVisitors: Number(dashboard.todayVisitors || 0),
      recentActivity: dashboard.recentActivity || []
    };
  },

  // Emergencies
  getEmergencies: async (filters = {}) => {
    // Try server first
    try {
      let url = '/api/emergencies?';
      if (filters.status) url += `status=${filters.status}&`;
      if (filters.type) url += `type=${filters.type}&`;
      if (filters.search) url += `q=${filters.search}&`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for emergencies');
    }
    // Fallback
    let filtered = [...mockEmergencies];
    
    if (filters.status) {
      filtered = filtered.filter(e => e.status === filters.status);
    }
    if (filters.type) {
      filtered = filtered.filter(e => e.type === filters.type);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.description.toLowerCase().includes(search) ||
        e.location.toLowerCase().includes(search)
      );
    }
    
    return { emergencies: filtered };
  },

  createEmergency: async (emergencyData) => {
    const ts = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const incidentCode = `EMG-${ts.getFullYear()}${pad(ts.getMonth()+1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}${pad(ts.getSeconds())}-${Math.random().toString(36).substring(2,6).toUpperCase()}`;
    
    const newEmergency = {
      _id: `emergency_${Date.now()}`,
      incidentCode: incidentCode,
      ...emergencyData,
      status: 'Active',
      reportedAt: ts.toISOString(),
      createdAt: ts.toISOString(),
      updatedAt: ts.toISOString(),
      resolvedAt: null
    };
    mockEmergencies.unshift(newEmergency);
    return newEmergency;
  },

  resolveEmergency: async (id) => {
    const index = mockEmergencies.findIndex(e => e._id === id);
    if (index !== -1) {
      mockEmergencies[index].status = 'Resolved';
      mockEmergencies[index].resolvedAt = new Date().toISOString();
      return mockEmergencies[index];
    }
    throw new Error('Emergency not found');
  },

  cancelEmergency: async (id) => {
    const index = mockEmergencies.findIndex(e => e._id === id);
    if (index !== -1) {
      mockEmergencies[index].status = 'Cancelled';
      return mockEmergencies[index];
    }
    throw new Error('Emergency not found');
  },

  // Analytics endpoints
  getAnalyticsTrends: async (period) => {
    // Try server first
    try {
      const response = await fetch(`/api/analytics/trends?period=${period}`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for trends');
    }
    // Fallback
    const days = period === '1d' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 7;
    return {
      trends: Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        visitors: Math.floor(Math.random() * 50) + 20,
        count: Math.floor(Math.random() * 50) + 20
      }))
    };
  },

  getSecurityInsights: async () => {
    // Try server first
    try {
      const response = await fetch('/api/analytics/security');
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.log('Using mock data for security insights');
    }
    // Fallback
    return {
      totalIncidents: 5,
      resolvedIncidents: 3,
      activeIncidents: 2,
      averageResponseTime: '15 minutes'
    };
  },

  // Admin
  getAdmins: async () => {
    // Try server first
    try {
      const response = await fetch('/api/admin');
      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      }
    } catch (error) {
      console.log('Using mock data for admins');
    }
    return mockAdmins;
  },

  createAdmin: async (adminData) => {
    const newAdmin = {
      _id: `admin_${Date.now()}`,
      ...adminData,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    mockAdmins.push(newAdmin);
    return newAdmin;
  },

  updateAdmin: async (id, adminData) => {
    const index = mockAdmins.findIndex(a => a._id === id);
    if (index !== -1) {
      mockAdmins[index] = { ...mockAdmins[index], ...adminData };
      return mockAdmins[index];
    }
    throw new Error('Admin not found');
  },

  deactivateAdmin: async (id) => {
    const index = mockAdmins.findIndex(a => a._id === id);
    if (index !== -1) {
      mockAdmins[index].isActive = false;
      return mockAdmins[index];
    }
    throw new Error('Admin not found');
  }
};

// Helper to show demo popup
export const showDemoPopup = (action, callback) => {
  const messages = {
    create: 'This is a demo. Data will not be saved to the database.',
    update: 'This is a demo. Changes will not be saved to the database.',
    delete: 'This is a demo. No data will be deleted from the database.',
    checkout: 'This is a demo. Checkout will not be saved to the database.',
    checkout_visitor: 'This is a demo. Visitor checkout will not be saved to the database.',
    emergency: 'This is a demo. Emergency will not be saved to the database.',
    admin: 'This is a demo. Admin changes will not be saved to the database.',
    backup: 'This is a demo. Backup operations are not available.',
    default: 'This is a demo. Database operations are disabled.'
  };

  const message = messages[action] || messages.default;
  
  if (window.confirm(`${message}\n\nWould you like to continue with the demo?`)) {
    if (callback) callback();
  }
};

