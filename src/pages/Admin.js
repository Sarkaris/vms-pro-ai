import React, { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { mockApi } from '../utils/mockData';
import { showDemoToast } from '../components/UI/DemoPopup';
import { 
  Users, 
  Shield, 
  Plus, 
  UserCheck,
  AlertTriangle
} from 'lucide-react';

const Admin = () => {
  const [admins, setAdmins] = useState([]);
  const { t, lang } = useI18n();
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Admin',
    department: '',
    permissions: {
      canViewAnalytics: true,
      canManageVisitors: true,
      canManageAdmins: false,
      canExportData: true,
      canViewReports: true
    }
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  // const fetchAdmins = async () => {
  //   try {
  //     const response = await fetch('/api/admin');
  //     const data = await response.json();
  //     setAdmins(data);
  //   } catch (error) {
  //     console.error('Error fetching admins:', error);
  //     setAdmins([])
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // ...
const fetchAdmins = async () => {
  setLoading(true);
  try {
    const data = await mockApi.getAdmins();
    setAdmins(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error('Error fetching admins:', error);
    toast.error('Failed to load admins');
    setAdmins([]);
  } finally {
    setLoading(false);
  }
};
// ...
  const handleSubmit = async (e) => {
    e.preventDefault();
    showDemoToast('admin');
    try {
      if (editingAdmin) {
        await mockApi.updateAdmin(editingAdmin._id, formData);
        toast.success('Admin updated (Demo)');
      } else {
        await mockApi.createAdmin(formData);
        toast.success('Account created (Demo)');
      }

      await fetchAdmins();
      setShowModal(false);
      setEditingAdmin(null);
      resetForm();
    } catch (error) {
      console.error('Error saving admin:', error);
      toast.error('Failed to save');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      username: admin.username,
      email: admin.email,
      password: '',
      firstName: admin.firstName,
      lastName: admin.lastName,
      role: admin.role,
      department: admin.department,
      permissions: admin.permissions
    });
    setShowModal(true);
  };

  // eslint-disable-next-line no-unused-vars
  const handleDelete = async (adminId) => {
    if (window.confirm('Are you sure you want to deactivate this admin?')) {
      showDemoToast('delete');
      try {
        await mockApi.deactivateAdmin(adminId);
        toast.success('Admin deactivated (Demo)');
        await fetchAdmins();
      } catch (error) {
        console.error('Error deactivating admin:', error);
        toast.error('Failed to deactivate');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'Admin',
      department: '',
      permissions: {
        canViewAnalytics: true,
        canManageVisitors: true,
        canManageAdmins: false,
        canExportData: true,
        canViewReports: true
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permissionKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      'Super Admin': 'bg-red-100 text-red-800',
      'Admin': 'bg-blue-100 text-blue-800',
      'Security': 'bg-yellow-100 text-yellow-800',
      'Receptionist': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  // Restrict role choices based on current user role
  const { user } = useAuth();
  let roles = ['Security', 'Receptionist'];
  
  // If Super Admin, can also create Admin/Super Admin
  if (user?.role === 'Super Admin') {
    roles = ['Super Admin', 'Admin', 'Security', 'Receptionist'];
  } else if (user?.role === 'Admin') {
    roles = ['Security', 'Receptionist'];
  }
  const departments = [
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('adminManagement')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage system administrators and their permissions
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAdmin(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center justify-center space-x-2 px-3 sm:px-4 py-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">{t('addAdmin')}</span>
        </button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Total Admins</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{admins?.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Super Admins</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {admins?.filter(a => a.role === 'Super Admin').length ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Active Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {admins?.filter(a => {
                  if (!a.lastLogin) return false;
                  const today = new Date();
                  const lastLogin = new Date(a.lastLogin);
                  return lastLogin.toDateString() === today.toDateString();
                }).length ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">Security Staff</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {admins?.filter(a => a.role === 'Security').length ?? 0}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">
                          {admin.firstName.charAt(0)}{admin.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {admin.firstName} {admin.lastName}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(admin.role)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {admin.department}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {admin.lastLogin 
                      ? new Date(admin.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/** Hide edit/deactivate for Admin role users; allow for Super Admin */}
                    {admins && (admins.find(a => a.email === admin.email)) && (
                      <div className="flex items-center space-x-2">
                        {/* Buttons will render conditionally in future if needed */}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Admin Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {editingAdmin ? 'Edit Admin' : 'Add New Admin'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Password {!editingAdmin && '*'}</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      required={!editingAdmin}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="form-label">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept} className="dark:bg-gray-700 dark:text-white">{lang === 'mr' ? t(dept) : dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <label className="form-label">Permissions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="permissions.canViewAnalytics"
                        checked={formData.permissions.canViewAnalytics}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">View Analytics</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="permissions.canManageVisitors"
                        checked={formData.permissions.canManageVisitors}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manage Visitors</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="permissions.canManageAdmins"
                        checked={formData.permissions.canManageAdmins}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Manage Admins</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="permissions.canExportData"
                        checked={formData.permissions.canExportData}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Export Data</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="permissions.canViewReports"
                        checked={formData.permissions.canViewReports}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">View Reports</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingAdmin ? 'Update Admin' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
