import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  LogOut, 
  User,
  XCircle
} from 'lucide-react';
import { format, isSameDay, parse } from 'date-fns';
import toast from 'react-hot-toast';
import { exportVisitorsToExcel, exportToCSV } from '../utils/exportUtils';
import { mockApi } from '../utils/mockData';
import { showDemoToast } from '../components/UI/DemoPopup';

const Visitors = () => {
  const [visitors, setVisitors] = useState([]);
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const data = await mockApi.getVisitors();
      setVisitors(data.visitors || []);
    } catch (error) {
      console.error('Error fetching visitors:', error);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (visitorId) => {
    showDemoToast('checkout');
    try {
      setIsCheckingOut(true);
      await mockApi.checkoutVisitor(visitorId);
      
      // Optimistically update UI without waiting for fresh fetch
      setVisitors((prev) => prev.map(v => v._id === visitorId ? { ...v, status: 'Checked Out', checkOutTime: new Date().toISOString() } : v));
      setSelectedVisitor((prev) => prev ? { ...prev, status: 'Checked Out', checkOutTime: new Date().toISOString() } : prev);
      setShowModal(false);
      // Refresh in background
      fetchVisitors();
      toast.success('Visitor checked out successfully (Demo)');
      setShowCheckoutSuccess(true);
      setTimeout(() => setShowCheckoutSuccess(false), 2500);
    } catch (error) {
      console.error('Error checking out visitor:', error);
      toast.error('Failed to check out visitor');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const canEditNow = (visitor) => {
    if (visitor.status !== 'Checked In') return false;
    const diffMs = Date.now() - new Date(visitor.checkInTime).getTime();
    return diffMs <= 60 * 60 * 1000; // 1 hour
  };

  const [editData, setEditData] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEdit = (v) => {
    setEditData({
      _id: v._id,
      firstName: v.firstName,
      lastName: v.lastName,
      email: v.email,
      phone: v.phone,
      company: v.company || '',
      purpose: v.purpose,
      aadhaarId: v.aadhaarId || '',
      panId: v.panId || '',
      passportId: v.passportId || '',
      drivingLicenseId: v.drivingLicenseId || '',
      notes: v.notes || ''
    });
  };

  const saveEdit = async () => {
    if (!editData?._id) return;
    showDemoToast('update');
    setIsSavingEdit(true);
    try {
      await mockApi.updateVisitor(editData._id, editData);
      await fetchVisitors();
      setEditData(null);
      setSelectedVisitor(null);
      setShowModal(false);
      toast.success('Visitor updated successfully (Demo)');
    } catch (e) {
      console.error('Error saving edit:', e);
      toast.error('Failed to update visitor');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const term = (searchTerm || '').trim();
    const lowerTerm = term.toLowerCase();

    // Helper: normalize to safely access
    const safe = (v) => (typeof v === 'string' ? v : '').toLowerCase();

    // Helper: digits-only comparison for phone-like terms
    const onlyDigits = (v) => (v || '').replace(/\D+/g, '');

    // Helper: attempt parsing multiple common date formats; returns Date | null
    const parseDateFromQuery = (q) => {
      const trimmed = q.trim();
      // Try ISO or native parse first
      const native = new Date(trimmed);
      if (!isNaN(native)) return native;
      // Try common patterns
      const candidates = [
        ['yyyy-MM-dd', trimmed],
        ['dd/MM/yyyy', trimmed],
        ['MM/dd/yyyy', trimmed],
        ['dd-MM-yyyy', trimmed],
        ['MM-dd-yyyy', trimmed],
      ];
      for (const [fmt, s] of candidates) {
        const d = parse(s, fmt, new Date());
        if (!isNaN(d)) return d;
      }
      return null;
    };

    const isDateQuery = Boolean(term) && !!parseDateFromQuery(term);
    const dateQueryValue = isDateQuery ? parseDateFromQuery(term) : null;

    // Search functionality - enhanced to include ID fields
    const matchesName = (
      safe(visitor.firstName).includes(lowerTerm) ||
      safe(visitor.lastName).includes(lowerTerm) ||
      `${safe(visitor.firstName)} ${safe(visitor.lastName)}`.includes(lowerTerm)
    );

    const matchesEmail = safe(visitor.email).includes(lowerTerm);
    const matchesCompany = safe(visitor.company).includes(lowerTerm);

    const termDigits = onlyDigits(term);
    const matchesPhone = termDigits.length >= 2 && onlyDigits(visitor.phone || '').includes(termDigits);

    // Enhanced ID search
    const matchesAadhaar = visitor.aadhaarId && safe(visitor.aadhaarId).includes(lowerTerm);
    const matchesPAN = visitor.panId && safe(visitor.panId).includes(lowerTerm);
    const matchesPassport = visitor.passportId && safe(visitor.passportId).includes(lowerTerm);
    const matchesDL = visitor.drivingLicenseId && safe(visitor.drivingLicenseId).includes(lowerTerm);

    const checkIn = visitor.checkInTime ? new Date(visitor.checkInTime) : null;
    const checkOut = visitor.checkOutTime ? new Date(visitor.checkOutTime) : null;
    const matchesDate = isDateQuery && (
      (checkIn && isSameDay(checkIn, dateQueryValue)) ||
      (checkOut && isSameDay(checkOut, dateQueryValue))
    );

    const matchesSearch = !term || matchesName || matchesEmail || matchesCompany || matchesPhone || 
                         matchesAadhaar || matchesPAN || matchesPassport || matchesDL || matchesDate;

    // Status filter
    const matchesStatus = statusFilter === 'all' || visitor.status === statusFilter;

    // Purpose filter
    const matchesPurpose = purposeFilter === 'all' || visitor.purpose === purposeFilter;

    // Date filter
    let matchesDateFilter = true;
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const checkInDate = visitor.checkInTime ? new Date(visitor.checkInTime) : null;
      matchesDateFilter = checkInDate && isSameDay(checkInDate, filterDate);
    }

    return matchesSearch && matchesStatus && matchesPurpose && matchesDateFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Checked In':
        return <span className="status-badge status-checked-in">Checked In</span>;
      case 'Checked Out':
        return <span className="status-badge status-checked-out">Checked Out</span>;
      case 'Expired':
        return <span className="status-badge status-overdue">Expired</span>;
      default:
        return <span className="status-badge status-checked-out">{status}</span>;
    }
  };

  const getDuration = (checkInTime, checkOutTime) => {
    const start = new Date(checkInTime);
    const end = checkOutTime ? new Date(checkOutTime) : new Date();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  // Export functionality
  const handleExport = (format = 'excel') => {
    try {
      const dataToExport = filteredVisitors.length > 0 ? filteredVisitors : visitors;
      
      if (format === 'excel') {
        exportVisitorsToExcel(dataToExport, 'Visitors-Report');
        toast.success('Excel report generated successfully!');
      } else if (format === 'csv') {
        const headers = ['No', 'First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Purpose', 'Status', 'Check In', 'Check Out'];
        exportToCSV(dataToExport, 'Visitors-Report', headers);
        toast.success('CSV report generated successfully!');
      }
      setShowExportMenu(false);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  };

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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('visitorsTitle')}</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            Manage and track all visitor activities
          </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="btn-secondary flex items-center space-x-2 text-sm sm:text-base"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xs:inline">Export</span>
            </button>
            
            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('excel')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV (.csv)
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            className="btn-primary flex items-center space-x-2 text-sm sm:text-base"
            onClick={() => window.location.href = '/checkin'}
          >
            <User className="w-4 h-4" />
            <span className="hidden xs:inline">New Check-in</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, phone, email, Aadhaar, PAN, Passport, DL, or date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input w-full sm:w-40 text-sm sm:text-base"
            >
              <option value="all">Status - All</option>
              <option value="Checked In">Checked In</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Expired">Expired</option>
            </select>
            
            <button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="btn-secondary flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden xs:inline">More Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose
                </label>
                <select
                  value={purposeFilter}
                  onChange={(e) => setPurposeFilter(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="all">All Purposes</option>
                  <option value="Anti-Human Trafficking Unit">Anti-Human Trafficking Unit</option>
                  <option value="Antiterrorism Squad">Antiterrorism Squad</option>
                  <option value="Application Branch">Application Branch</option>
                  <option value="Control Room">Control Room</option>
                  <option value="Cyber Police Station">Cyber Police Station</option>
                  <option value="District Special Branch">District Special Branch</option>
                  <option value="Economic Offences Wing">Economic Offences Wing</option>
                  <option value="Local Crime Branch">Local Crime Branch</option>
                  <option value="Mahila Cell">Mahila Cell</option>
                  <option value="Security Branch">Security Branch</option>
                  <option value="Welfare Branch">Welfare Branch</option>
                  <option value="Superintendent of Police (SP)">Superintendent of Police (SP)</option>
                  <option value="Additional Superintendent of Police (Additional SP)">Additional Superintendent of Police (Additional SP)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="form-input w-full"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDateFilter('');
                    setPurposeFilter('all');
                  }}
                  className="btn-secondary w-full"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visitors Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('visitorsTitle')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                  Purpose
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden md:table-cell">
                  Check-in
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                  Duration
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('visitorsStatus')}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('visitorsActions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredVisitors.map((visitor) => (
                <tr key={visitor._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">
                          {`${(visitor.firstName || '?')[0] || '?'}`}{`${(visitor.lastName || '')[0] || ''}`}
                        </span>
                      </div>
                      <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {(visitor.firstName || '').trim()} {(visitor.lastName || '').trim()}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{visitor.company}</div>
                        {/* Mobile: Show purpose and check-in time */}
                        <div className="sm:hidden mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {visitor.purpose}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {format(new Date(visitor.checkInTime), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Purpose - hidden on mobile */}
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap relative group hidden sm:table-cell">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {visitor.purpose}
                    </span>
                    {visitor.notes && (
                      <span className="absolute left-0 bottom-full mb-2 hidden w-max max-w-xs rounded bg-gray-800 text-white text-xs px-2 py-1 shadow-lg group-hover:block z-10">
                        {visitor.notes}
                      </span>
                    )}
                  </td>
                  {/* Check-in - hidden on mobile and tablet */}
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden md:table-cell">
                    {format(new Date(visitor.checkInTime), 'MMM dd, HH:mm')}
                  </td>
                  {/* Duration - hidden on mobile, tablet, and small desktop */}
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 hidden lg:table-cell">
                    {getDuration(visitor.checkInTime, visitor.checkOutTime)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(visitor.status)}
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={async () => {
                          setSelectedVisitor(visitor);
                          setShowModal(true);
                          setLoadingHistory(true);
                          try {
                            const data = await mockApi.getVisitorHistory(visitor._id);
                            setHistory(Array.isArray(data.history) ? data.history : []);
                          } catch (e) { setHistory([]); }
                          finally { setLoadingHistory(false); }
                        }}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {visitor.status === 'Checked In' && (
                        <button
                          onClick={() => handleCheckout(visitor._id)}
                          className={`text-red-600 hover:text-red-900 p-1 ${isCheckingOut ? 'opacity-50 pointer-events-none' : ''}`}
                          title="Check Out"
                        >
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Details Modal */}
      {showModal && selectedVisitor && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content max-w-2xl bg-white dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Visitor Details
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Visit ID: {selectedVisitor._id}
            </p>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* --- Main content area with Photo and Primary Details --- */}
        <div className="flex flex-col md:flex-row gap-6 border-b border-gray-200 dark:border-gray-700 pb-6">
          {/* Visitor Photo */}
          <div className="flex-shrink-0">
            {selectedVisitor.photo ? (
              <img
                src={selectedVisitor.photo}
                alt={selectedVisitor.fullName}
                className="w-32 h-32 rounded-lg object-cover border"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border dark:border-gray-600">
                <User className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Visitor Primary Details */}
          <div className="flex-grow space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Visitor Information</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.company}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.phone}</p>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Visit Details</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Purpose</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.purpose}</p>
                </div>
                {/* Host removed */}
              </div>
            </div>
          </div>
        </div>
        
        {/* --- Timing and Security sections --- */}
        <div className="space-y-6 mt-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Timing & Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check-in</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {format(new Date(selectedVisitor.checkInTime), 'MMM dd, HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check-out</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedVisitor.checkOutTime 
                    ? format(new Date(selectedVisitor.checkOutTime), 'MMM dd, HH:mm')
                    : '—'
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {selectedVisitor.duration} min
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                {getStatusBadge(selectedVisitor.status)}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Security Information</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedVisitor.aadhaarId && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Aadhaar Card</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.aadhaarId}</p>
                  </div>
                )}
                {selectedVisitor.panId && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">PAN</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.panId}</p>
                  </div>
                )}
                {selectedVisitor.passportId && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Passport</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.passportId}</p>
                  </div>
                )}
                {selectedVisitor.drivingLicenseId && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Driving License</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.drivingLicenseId}</p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Security Level</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedVisitor.securityLevel}</p>
              </div>
            </div>
          </div>

          {selectedVisitor.notes && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
              <p className="text-sm text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border dark:border-gray-600">
                {selectedVisitor.notes}
              </p>
            </div>
          )}
        </div>

        {/* Visit History */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Past Visits</h4>
          {loadingHistory ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading history...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No previous visit records.</p>
          ) : (
            <div className="max-h-40 overflow-y-auto border dark:border-gray-600 rounded-lg divide-y dark:divide-gray-600">
              {history.map((h) => (
                <div key={h._id} className="px-3 py-2 text-sm flex justify-between bg-white dark:bg-gray-800">
                  <span className="text-gray-900 dark:text-gray-100">{format(new Date(h.checkInTime), 'MMM dd, HH:mm')}</span>
                  <span className="text-gray-600 dark:text-gray-400">{h.purpose}</span>
                  <span className="text-gray-600 dark:text-gray-400">{h.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowModal(false)}
            className="btn-secondary"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (!selectedVisitor) return;
              const v = selectedVisitor;
              const payload = {
                firstName: v.firstName,
                lastName: v.lastName,
                email: v.email,
                phone: v.phone,
                company: v.company,
                purpose: v.purpose,
                photo: v.photo,
                aadhaarId: v.aadhaarId,
                panId: v.panId,
                passportId: v.passportId,
                drivingLicenseId: v.drivingLicenseId,
              };
              navigate('/checkin', { state: { prefillVisitor: payload } });
            }}
            className="btn-primary"
          >
            Visit Again
          </button>
          {selectedVisitor.status === 'Checked In' && (
            <>
              <button
                onClick={() => handleCheckout(selectedVisitor._id)}
                className={`btn-danger ${isCheckingOut ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {isCheckingOut ? 'Checking out...' : 'Check Out'}
              </button>
              {canEditNow(selectedVisitor) && (
                <button
                  onClick={() => openEdit(selectedVisitor)}
                  className="btn-secondary"
                >
                  Edit Details
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  </div>
)}

      {/* Edit within 1 hour Modal */}
      {editData && (
        <div className="modal-overlay" onClick={() => setEditData(null)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Edit Visitor (within 1 hour)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="form-input" placeholder="First Name" value={editData.firstName} onChange={(e)=>setEditData({...editData, firstName:e.target.value})} />
                <input className="form-input" placeholder="Last Name" value={editData.lastName} onChange={(e)=>setEditData({...editData, lastName:e.target.value})} />
                <input className="form-input" placeholder="Email" value={editData.email} onChange={(e)=>setEditData({...editData, email:e.target.value})} />
                <input className="form-input" placeholder="Phone" value={editData.phone} onChange={(e)=>setEditData({...editData, phone:e.target.value})} />
                <input className="form-input md:col-span-2" placeholder="Company" value={editData.company} onChange={(e)=>setEditData({...editData, company:e.target.value})} />
                <select className="form-input" value={editData.purpose} onChange={(e)=>setEditData({...editData, purpose:e.target.value})}>
                  {['Anti-Human Trafficking Unit','Antiterrorism Squad','Application Branch','Control Room','Cyber Police Station','District Special Branch','Economic Offences Wing','Local Crime Branch','Mahila Cell','Security Branch','Welfare Branch','Superintendent of Police (SP)','Additional Superintendent of Police (Additional SP)'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input className="form-input" placeholder="Aadhaar ID" value={editData.aadhaarId} onChange={(e)=>setEditData({...editData, aadhaarId:e.target.value})} />
                <input className="form-input" placeholder="PAN ID" value={editData.panId} onChange={(e)=>setEditData({...editData, panId:e.target.value})} />
                <input className="form-input" placeholder="Passport ID" value={editData.passportId} onChange={(e)=>setEditData({...editData, passportId:e.target.value})} />
                <input className="form-input" placeholder="Driving License ID" value={editData.drivingLicenseId} onChange={(e)=>setEditData({...editData, drivingLicenseId:e.target.value})} />
                <textarea className="form-input md:col-span-2" placeholder="Notes" value={editData.notes} onChange={(e)=>setEditData({...editData, notes:e.target.value})} />
              </div>
              <div className="flex justify-end space-x-2">
                <button className="btn-secondary" onClick={()=>setEditData(null)}>Cancel</button>
                <button className="btn-primary" disabled={isSavingEdit} onClick={saveEdit}>{isSavingEdit ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout success popup */}
      {showCheckoutSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          Checked out successfully
        </div>
      )}
    </div>
  );
};

export default Visitors;
