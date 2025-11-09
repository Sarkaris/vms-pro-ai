import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database, 
  Save,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    department: user?.department || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    visitorCheckins: true,
    overdueVisitors: true,
    securityAlerts: true,
    systemUpdates: false
  });

  const [systemSettings, setSystemSettings] = useState({
    autoCheckout: false,
    autoCheckoutHours: 8,
    requirePhoto: true,
    requireTemperature: true,
    allowVipAccess: true,
    maxVisitorsPerDay: 100
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: false,
    backupFrequency: 'daily',
    backupRetention: 30,
    includePhotos: true,
    includeReports: true
  });

  const [backupStatus, setBackupStatus] = useState({
    lastBackup: null,
    nextBackup: null,
    backupSize: '0 MB',
    isBackingUp: false
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    ...(user?.role === 'Admin' || user?.role === 'Super Admin' ? [
      { id: 'system', name: 'System', icon: Shield },
      // { id: 'backup', name: 'Backup & Restore', icon: Database }
    ] : [])
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      if (result.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        toast.success('Password changed successfully!');
      }
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSystemChange = (setting, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleBackupChange = (setting, value) => {
    setBackupSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const createBackup = async () => {
    const { showDemoToast } = await import('../components/UI/DemoPopup');
    showDemoToast('backup');
    try {
      setBackupStatus(prev => ({ ...prev, isBackingUp: true }));
      
      // Simulate backup creation in demo mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBackupStatus(prev => ({
        ...prev,
        lastBackup: new Date().toISOString(),
        backupSize: '2.5 MB',
        isBackingUp: false
      }));
      toast.success('Backup created successfully (Demo)!');
    } catch (error) {
      console.error('Error creating backup:', error);
      setBackupStatus(prev => ({ ...prev, isBackingUp: false }));
      toast.error('Failed to create backup');
    }
  };

  const downloadBackup = async (backupId) => {
    const { showDemoToast } = await import('../components/UI/DemoPopup');
    showDemoToast('backup');
    toast.error('Backup download is disabled in demo mode');
  };

  const restoreBackup = async (file) => {
    const { showDemoToast } = await import('../components/UI/DemoPopup');
    showDemoToast('backup');
    toast.error('Backup restore is disabled in demo mode');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('settingsTitle')}</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
          Manage your account settings and system preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-700'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        value={profileData.department}
                        onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? '...' : t('saveChanges')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Security Settings</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="form-label">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="form-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="form-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="form-input pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{loading ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.emailNotifications}
                          onChange={() => handleNotificationChange('emailNotifications')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable email notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.visitorCheckins}
                          onChange={() => handleNotificationChange('visitorCheckins')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">New visitor check-ins</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.overdueVisitors}
                          onChange={() => handleNotificationChange('overdueVisitors')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Overdue visitors</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.securityAlerts}
                          onChange={() => handleNotificationChange('securityAlerts')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Security alerts</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">System Notifications</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.pushNotifications}
                          onChange={() => handleNotificationChange('pushNotifications')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable push notifications</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={notificationSettings.systemUpdates}
                          onChange={() => handleNotificationChange('systemUpdates')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">System updates and maintenance</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab - Only for Admin/Super Admin */}
            {activeTab === 'system' && (user?.role === 'Admin' || user?.role === 'Super Admin') && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">System Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Visitor Management</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoCheckout}
                          onChange={(e) => handleSystemChange('autoCheckout', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Auto-checkout overdue visitors</span>
                      </label>
                      
                      {systemSettings.autoCheckout && (
                        <div className="ml-6">
                          <label className="form-label">Auto-checkout after (hours)</label>
                          <input
                            type="number"
                            value={systemSettings.autoCheckoutHours}
                            onChange={(e) => handleSystemChange('autoCheckoutHours', parseInt(e.target.value))}
                            className="form-input w-32"
                            min="1"
                            max="24"
                          />
                        </div>
                      )}
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={systemSettings.requirePhoto}
                          onChange={(e) => handleSystemChange('requirePhoto', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require photo capture</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={systemSettings.requireTemperature}
                          onChange={(e) => handleSystemChange('requireTemperature', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Require temperature check</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={systemSettings.allowVipAccess}
                          onChange={(e) => handleSystemChange('allowVipAccess', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Allow VIP visitor access</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Limits</h3>
                    <div>
                      <label className="form-label">Maximum visitors per day</label>
                      <input
                        type="number"
                        value={systemSettings.maxVisitorsPerDay}
                        onChange={(e) => handleSystemChange('maxVisitorsPerDay', parseInt(e.target.value))}
                        className="form-input w-32"
                        min="1"
                        max="1000"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Tab - For Security/Receptionist (Limited Access) */}
            {activeTab === 'system' && (user?.role === 'Security' || user?.role === 'Receptionist') && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">System Settings</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                    <p className="text-yellow-800 dark:text-yellow-200">
                      System settings are restricted to Admin and Super Admin users only.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Tab - Only for Admin/Super Admin */}
            {activeTab === 'backup' && (user?.role === 'Admin' || user?.role === 'Super Admin') && (
              <div>
                {/* <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Backup & Restore</h2> */}
                
                {/* Backup Status */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">Backup Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Last Backup</p>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {backupStatus.lastBackup ? new Date(backupStatus.lastBackup).toLocaleString() : 'Never'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Backup Size</p>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">{backupStatus.backupSize}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Next Auto Backup</p>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {backupStatus.nextBackup ? new Date(backupStatus.nextBackup).toLocaleString() : 'Not scheduled'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manual Backup */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Manual Backup</h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Create a complete backup of all visitor data, settings, and system configuration.
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={backupSettings.includePhotos}
                                onChange={(e) => handleBackupChange('includePhotos', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include visitor photos</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={backupSettings.includeReports}
                                onChange={(e) => handleBackupChange('includeReports', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include generated reports</span>
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={createBackup}
                          disabled={backupStatus.isBackingUp}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <Database className="w-4 h-4" />
                          <span>{backupStatus.isBackingUp ? 'Creating...' : 'Create Backup'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Auto Backup Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Automatic Backup</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={backupSettings.autoBackup}
                          onChange={(e) => handleBackupChange('autoBackup', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable automatic backups</span>
                      </label>
                      
                      {backupSettings.autoBackup && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Backup Frequency</label>
                            <select
                              value={backupSettings.backupFrequency}
                              onChange={(e) => handleBackupChange('backupFrequency', e.target.value)}
                              className="form-input"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          <div>
                            <label className="form-label">Retention (days)</label>
                            <input
                              type="number"
                              value={backupSettings.backupRetention}
                              onChange={(e) => handleBackupChange('backupRetention', parseInt(e.target.value))}
                              className="form-input"
                              min="1"
                              max="365"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Restore Backup */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Restore Backup</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-yellow-800 dark:text-yellow-200 text-sm mb-3">
                            <strong>Warning:</strong> Restoring a backup will replace all current data. This action cannot be undone.
                          </p>
                          <input
                            type="file"
                            accept=".zip,.backup"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                const confirmed = window.confirm('Are you sure you want to restore this backup? This will replace all current data.');
                                if (confirmed) {
                                  restoreBackup(e.target.files[0]);
                                }
                              }
                            }}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Backup History */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Backup History</h3>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Recent backups will appear here</p>
                      </div>
                      <div className="p-4 text-center">
                        <Database className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No backups found</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
