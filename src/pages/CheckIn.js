import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import {
  User,
  Calendar,
  Shield,
  Camera,
  CheckCircle,
  Search,
  AlertTriangle,
  Video,
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useZxing } from 'react-zxing';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { mockApi } from '../utils/mockData';
import { showDemoToast } from '../components/UI/DemoPopup';

const CheckIn = () => {
  const { emitVisitorCheckin } = useSocket();
  const location = useLocation();
  const { t, lang } = useI18n();
  const webcamRef = useRef(null);

  const initialFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    purpose: 'Cyber Police Station',
    hostName: '',
    hostEmail: '',
    hostDepartment: '',
    expectedDuration: 60,
    aadhaarId: '',
    panId: '',
    passportId: '',
    drivingLicenseId: '',
    qrCode: '',
    temperature: '',
    healthDeclaration: false,
    notes: '',
    location: 'Main Lobby',
    isVip: false,
    securityLevel: 'Low',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [capturedImage, setCapturedImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkInMode, setCheckInMode] = useState('manual');
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [visitorFound, setVisitorFound] = useState(null);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [lastAutoSearched, setLastAutoSearched] = useState('');
  // Prefill from navigation state (Visit Again)
  useEffect(() => {
    const locationState = location.state || {};
    if (locationState.prefillVisitor) {
      const data = locationState.prefillVisitor;
      const normalizedPurpose = (
        [
          'Anti-Human Trafficking Unit','Antiterrorism Squad','Application Branch','Control Room','Cyber Police Station','District Special Branch','Economic Offences Wing','Local Crime Branch','Mahila Cell','Security Branch','Welfare Branch','Superintendent of Police (SP)','Additional Superintendent of Police (Additional SP)'
        ].includes((data.purpose || '').trim())
      ) ? data.purpose : 'Anti-Human Trafficking Unit';

      setFormData(prev => ({
        ...initialFormData,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        company: data.company || '',
        purpose: normalizedPurpose,
        aadhaarId: data.aadhaarId || '',
        panId: data.panId || '',
        passportId: data.passportId || '',
        drivingLicenseId: data.drivingLicenseId || '',
        photo: data.photo || null,
      }));
      setCheckInMode('manual');
      setVisitorFound(true); // reveal the form immediately for returning visitor flow
      setCurrentStep(1);
      setErrors({});
    }
  // We intentionally run this once on mount to capture the state payload
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const handleSearch = useCallback(async (identifier) => {
  if (!identifier) {
    toast.error('Please enter an ID to search.');
    return;
  }
  setIsSearching(true);
  setVisitorFound(null);
  try {
    // Try server first, fallback to mock
    const { mockApi } = await import('../utils/mockData');
    const data = await mockApi.findVisitor(identifier);

    if (data) {
      if (data.status === 'Checked In') {
        toast.error(`${data.firstName} is already checked in.`);
        setVisitorFound(null);
        return;
      }

      toast.success(`Welcome back, ${data.firstName}! Please fill out your new visit details.`);
      
      // Manually build the form data for the new visit, only taking permanent details
      // from the old record ('data').
      // Map legacy purpose to a valid department if needed
      const normalizedPurpose = (
        [
          'Anti-Human Trafficking Unit','Antiterrorism Squad','Application Branch','Control Room','Cyber Police Station','District Special Branch','Economic Offences Wing','Local Crime Branch','Mahila Cell','Security Branch','Welfare Branch','Superintendent of Police (SP)','Additional Superintendent of Police (Additional SP)'
        ].includes((data.purpose || '').trim())
      ) ? data.purpose : 'Anti-Human Trafficking Unit';

      setFormData({
        ...initialFormData,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        company: data.company,
        photo: data.photo,
        purpose: normalizedPurpose,
        aadhaarId: data.aadhaarId || '',
        panId: data.panId || '',
        passportId: data.passportId || '',
        drivingLicenseId: data.drivingLicenseId || '',
        isVip: data.isVip,
        securityLevel: data.securityLevel,
        qrCode: data.qrCode || identifier,
      });
      
      setVisitorFound(true);

    } else {
      toast.error('Visitor not found. Please fill form to register.');
      setFormData({ 
        ...initialFormData, 
        qrCode: identifier,
      });
      setVisitorFound(false);
    }
  } catch (error) {
    toast.error('An error occurred while searching.');
    setVisitorFound(false);
  } finally {
    setIsSearching(false);
    setSearchId('');
  }
}, [initialFormData]);
  // Regex patterns for validation
  const phoneRegex = /^[6-9]\d{9}$/;

  // Auto-search when manual input matches known identifier patterns (debounced)
  useEffect(() => {
    if (!searchId || isSearching) return;
    const raw = (searchId || '').toString().trim();
    const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
    const passportRegex = /^[A-Z][0-9]{7}$/;
    const aadhaarLike = /^\d{12}$/.test(raw);
    const phoneLike = phoneRegex.test(raw);
    const panLike = panRegex.test(raw.toUpperCase());
    const passportLike = passportRegex.test(raw.toUpperCase());
    if (!(aadhaarLike || phoneLike || panLike || passportLike)) return;
    if (lastAutoSearched === raw) return;
    const timer = setTimeout(() => {
      setLastAutoSearched(raw);
      handleSearch(raw);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchId, isSearching, phoneRegex, handleSearch, lastAutoSearched]);

  // Updated lists per requirements - Police Departments in alphabetical order
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
  // const securityLevels = ['Low', 'Medium', 'High']; // Unused


  const handleScanResult = useCallback((result) => {
    if (result) {
      const scannedId = result.getText();
      setIsScannerActive(false); 
      setCheckInMode('manual');
      toast.success('QR Code Scanned!');
      handleSearch(scannedId);
    }
  }, [handleSearch]);

  const { ref } = useZxing({
    onDecodeResult: handleScanResult,
    paused: !isScannerActive,
  });
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,24}$/;
  const nameRegex = /^[A-Za-z .'-]{2,50}$/; // allow letters, spaces, periods, hyphens, apostrophes
  // Accept 10-15 digits (strip formatting like dashes/spaces before testing)
  const phoneDigitsOk = (v) => (v || '').replace(/\D/g, '').length >= 10 && (v || '').replace(/\D/g, '').length <= 15;
  const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
  const passportRegex = /^[A-Z][0-9]{7}$/; // e.g., A1234567
  const drivingRegex = /^[A-Z0-9]{10,20}$/; // broad but constrained length

  const validateField = (name, rawValue, nextState) => {
    let message = '';
    const value = (rawValue || '').toString().trim();
    const state = nextState || formData;

    if (name === 'firstName' || name === 'lastName') {
      if (!nameRegex.test(value)) message = "Only letters, spaces, .' - (2-50 chars)";
    }
    if (name === 'email' && value) {
      if (!emailRegex.test(value)) message = 'Invalid email';
    }
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits && (digits.length < 10 || digits.length > 15)) message = 'Enter 10-15 digits';
    }
    if (name === 'aadhaarId' && value) {
      if (!/^\d{12}$/.test(value)) message = 'Aadhaar must be exactly 12 digits';
    }
    if (name === 'panId' && value) {
      if (!panRegex.test(value.toUpperCase())) message = 'PAN must be 10 chars (AAAAA9999A)';
    }
    if (name === 'passportId' && value) {
      if (!passportRegex.test(value.toUpperCase())) message = 'Passport must be 1 letter + 7 digits';
    }
    if (name === 'drivingLicenseId' && value) {
      if (!drivingRegex.test(value.toUpperCase())) message = 'DL must be 10-20 alphanumeric chars';
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
    return !message;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;

    // Normalize inputs as user types
    if (name === 'phone') {
      nextValue = nextValue.replace(/\D/g, '').slice(0, 15);
    }
    if (name === 'aadhaarId') {
      nextValue = nextValue.replace(/\D/g, '').slice(0, 12);
    }
    if (name === 'panId') {
      nextValue = nextValue.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    }
    if (name === 'passportId') {
      nextValue = nextValue.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    }
    if (name === 'drivingLicenseId') {
      nextValue = nextValue.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
    }
    if (name === 'email') {
      nextValue = nextValue.trim().toLowerCase();
    }

    const nextState = { ...formData, [name]: nextValue };
    setFormData(nextState);
    validateField(name, nextValue, nextState);
  };
  
  const resetForm = () => {
    setFormData(initialFormData);
    setCapturedImage(null);
    setCurrentStep(1);
    setVisitorFound(null);
    setSearchId('');
    setIsScannerActive(false);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    showDemoToast('create');
    setLoading(true);

    const isUpdate = !!formData._id;

    try {
      const visitorData = { ...formData, photo: capturedImage };
      
      // For any new record (including a returning visitor), set status to 'Checked In'.
      if (!isUpdate) {
        visitorData.checkInTime = new Date().toISOString();
        visitorData.status = 'Checked In'; 
      }

      let result;
      if (isUpdate) {
        result = await mockApi.updateVisitor(formData._id, visitorData);
      } else {
        result = await mockApi.createVisitor(visitorData);
        emitVisitorCheckin(result);
      }

      if (result) {
        toast.success(`Visitor ${isUpdate ? 'details updated' : 'checked in'} successfully!`);
        resetForm();
      } else {
        const serverMessage = (result && result.message) ? String(result.message) : '';
        throw new Error(serverMessage || 'Failed to submit visitor data');
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (step) => {
    const stepErrors = {};
    if (step === 1) {
      if (!formData.firstName) stepErrors.firstName = 'First name is required';
      if (!formData.lastName) stepErrors.lastName = 'Last name is required';
      if (!formData.email) stepErrors.email = 'Email is required';
      if (!formData.phone) stepErrors.phone = 'Phone is required';
      validateField('firstName', formData.firstName);
      validateField('lastName', formData.lastName);
      validateField('email', formData.email);
      validateField('phone', formData.phone);
    }
    if (step === 2) {
      if (!formData.purpose) stepErrors.purpose = 'Purpose of visit is required';
    }
    if (step === 3) {
      const hasId = !!(formData.aadhaarId || formData.panId || formData.passportId || formData.drivingLicenseId);
      if (!hasId) {
        stepErrors.aadhaarId = 'At least one ID document must be provided';
      }
      if (formData.aadhaarId) validateField('aadhaarId', formData.aadhaarId);
      if (formData.panId) validateField('panId', formData.panId);
      if (formData.passportId) validateField('passportId', formData.passportId);
      if (formData.drivingLicenseId) validateField('drivingLicenseId', formData.drivingLicenseId);
    }
    setErrors((prev) => ({ ...prev, ...stepErrors }));
    const hasError = Object.values({ ...errors, ...stepErrors }).some(Boolean);
    if (hasError) {
      toast.error('Please correct highlighted fields before proceeding.');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  
  const isStepValid = (step) => {
    switch (step) {
      case 1: {
        const nameOk = nameRegex.test((formData.firstName || '').trim()) &&
                       nameRegex.test((formData.lastName || '').trim());
        const emailOk = !!(formData.email && emailRegex.test((formData.email || '').trim()));
        const phoneOk = phoneDigitsOk(formData.phone);
        return nameOk && emailOk && phoneOk;
      }
      case 2:
        return !!formData.purpose;
      case 3: {
        const hasId = !!(formData.aadhaarId || formData.panId || formData.passportId || formData.drivingLicenseId);
        if (!hasId) return false;
        
        // Validate each ID field if it has a value
        if (formData.aadhaarId && !/^\d{12}$/.test(formData.aadhaarId)) return false;
        if (formData.panId && !panRegex.test(formData.panId.toUpperCase())) return false;
        if (formData.passportId && !passportRegex.test(formData.passportId.toUpperCase())) return false;
        if (formData.drivingLicenseId && !drivingRegex.test(formData.drivingLicenseId.toUpperCase())) return false;
        
        return true;
      }
      case 4:
        return !!capturedImage;
      default:
        return false;
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    setShowWebcam(false);
    toast.success('Photo captured successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 p-4 sm:p-6 pb-12">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{t('visitorCheckIn')}</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">{t('findReturning')}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          <button 
            onClick={() => { setCheckInMode('manual'); setIsScannerActive(false); }} 
            className={`px-4 py-2 text-sm font-medium ${checkInMode === 'manual' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('manualEntry')}
          </button>
          <button 
            onClick={() => setCheckInMode('scan')} 
            className={`px-4 py-2 text-sm font-medium ${checkInMode === 'scan' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
            {t('scanQr')}
          </button>
        </div>

        {checkInMode === 'manual' && (
           <div className="flex items-center gap-4">
          <input
             type="text"
             value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!isSearching) handleSearch(searchId);
              }
            }}
             placeholder={t('searchPlaceholder')}
             className="form-input flex-grow"
           />
           <button onClick={() => handleSearch(searchId)} disabled={isSearching} className="bg-black text-white hover:bg-gray-800 disabled:opacity-50 px-4 py-2 rounded-lg flex items-center whitespace-nowrap transition-colors">
             {isSearching ? <div className="loading-spinner mr-2"></div> : <Search className="w-4 h-4 mr-2" />}
             {isSearching ? '...' : t('search')}
           </button>
         </div>
        )}

        {checkInMode === 'scan' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600 dark:text-gray-300">Point the QR code at the camera</p>
            <div className="w-full max-w-sm mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              {isScannerActive ? ( <video ref={ref} className="w-full" /> ) : ( <div className="text-gray-400 dark:text-gray-300">Camera is off</div> )}
            </div>
            {!isScannerActive ? (
              <button type="button" onClick={() => setIsScannerActive(true)} className="btn-primary inline-flex items-center gap-2">
                <Video className="w-5 h-5" /> {t('startCamera')}
              </button>
            ) : (
              <button type="button" onClick={() => setIsScannerActive(false)} className="btn-secondary inline-flex items-center gap-2">
                <Video className="w-5 h-5" /> {t('stopCamera')}
              </button>
            )}
          </div>
        )}

        {visitorFound !== null && (
         <div className={`mt-4 p-4 rounded-lg flex items-center ${visitorFound ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'}`}>
             {visitorFound ? <CheckCircle className="w-5 h-5 mr-3 text-green-600" /> : <AlertTriangle className="w-5 h-5 mr-3 text-yellow-600" />}
            <p className={`${visitorFound ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'} text-sm`}>
              {visitorFound ? `Welcome back, ${formData.firstName}. Please verify your details below and proceed.` : `No record found. Please fill the form to register a new visit.`}
            </p>
          </div>
        )}
      </div>
      
       {visitorFound !== null && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
           {currentStep === 1 && (
             <div className="space-y-6">
               <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                    <User className="w-5 h-5 mr-2" /> Visitor Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="form-label">{t('firstName')} *</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
                        {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label className="form-label">{t('lastName')} *</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
                        {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                        <label className="form-label">{t('emailAddress')} *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
                        {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="form-label">{t('phoneNumber')} *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" required />
                        {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="form-label">Occupation</label>
                        <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" />
                    </div>
                </div>
            </div>
           )}

            {currentStep === 2 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Calendar className="w-5 h-5 mr-2" /> Visit Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="form-label">{t('purposeOfVisit')} *</label>
                            <select name="purpose" value={formData.purpose} onChange={handleChange} className="form-input dark:bg-gray-700 dark:text-white dark:border-gray-600" required>
                                {purposes.map(p => <option key={p} value={p} className="dark:bg-gray-700 dark:text-white">{lang === 'mr' ? t(p) : p}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">{t('expectedDuration')}</label>
                            <input type="number" name="expectedDuration" value={formData.expectedDuration} onChange={handleChange} className="form-input" min="15"/>
                        </div>
                        {/* Host fields removed per requirements */}
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Shield className="w-5 h-5 mr-2" /> ID Verification
                    </h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            Please provide at least one valid ID document. You can fill multiple IDs if available.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label">Aadhaar Card Number</label>
                                <input 
                                    type="text" 
                                    name="aadhaarId" 
                                    value={formData.aadhaarId} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="12-digit Aadhaar number"
                                />
                                {errors.aadhaarId && <p className="text-red-600 text-xs mt-1">{errors.aadhaarId}</p>}
                            </div>
                            <div>
                                <label className="form-label">PAN Number</label>
                                <input 
                                    type="text" 
                                    name="panId" 
                                    value={formData.panId} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="AAAAA9999A"
                                />
                                {errors.panId && <p className="text-red-600 text-xs mt-1">{errors.panId}</p>}
                            </div>
                            <div>
                                <label className="form-label">Passport Number</label>
                                <input 
                                    type="text" 
                                    name="passportId" 
                                    value={formData.passportId} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="A1234567"
                                />
                                {errors.passportId && <p className="text-red-600 text-xs mt-1">{errors.passportId}</p>}
                            </div>
                            <div>
                                <label className="form-label">Driving License Number</label>
                                <input 
                                    type="text" 
                                    name="drivingLicenseId" 
                                    value={formData.drivingLicenseId} 
                                    onChange={handleChange} 
                                    className="form-input" 
                                    placeholder="DL1234567890"
                                />
                                {errors.drivingLicenseId && <p className="text-red-600 text-xs mt-1">{errors.drivingLicenseId}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Camera className="w-5 h-5 mr-2" /> Photo Capture
                    </h2>
                    <div className="text-center">
                        {!capturedImage ? (
                            <div className="space-y-4">
                                {!showWebcam ? (
                                    <button type="button" onClick={() => setShowWebcam(true)} className="btn-primary">Take Photo</button>
                                ) : (
                                    <div className="space-y-4">
                                        <Webcam ref={webcamRef} width={320} height={240} screenshotFormat="image/jpeg" />
                                        <div>
                                            <button type="button" onClick={capturePhoto} className="btn-primary">Capture</button>
                                            <button type="button" onClick={() => setShowWebcam(false)} className="btn-secondary ml-2">Cancel</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <img src={capturedImage} alt="Visitor" className="mx-auto w-64 h-48 object-cover rounded-lg border-2 border-green-500" />
                                <button type="button" onClick={() => { setCapturedImage(null); setShowWebcam(true); }} className="btn-secondary">Retake Photo</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="fixed left-0 right-0 bottom-0 bg-white dark:bg-gray-900 p-4 border-t border-gray-200 dark:border-gray-700 md:static md:bg-transparent md:p-0">
                <div className="flex justify-between">
                    <button type="button" onClick={prevStep} disabled={currentStep === 1} className="btn-secondary disabled:opacity-50">{t('previous')}</button>
                    {currentStep < 4 ? (
                        <button type="button" onClick={nextStep} disabled={!isStepValid(currentStep)} className="btn-primary disabled:opacity-50">{t('next')}</button>
                    ) : (
                        <button type="submit" disabled={loading || !isStepValid(4)} className="btn-primary disabled:opacity-50 flex items-center">
                            {loading ? <><div className="loading-spinner mr-2"></div><span>...</span></> : <><CheckCircle className="w-4 h-4 mr-2" /><span>{formData._id ? 'Update Details' : t('completeCheckIn')}</span></>}
                        </button>
                    )}
                </div>
            </div>
        </form>
      )}
    </div>
  );
};

export default CheckIn;




