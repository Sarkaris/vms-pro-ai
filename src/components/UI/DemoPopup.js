import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const DemoPopup = ({ show, onClose, message = 'This is a demo. Database operations are disabled.' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Demo Mode
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {message}
            </p>
            <button
              onClick={onClose}
              className="w-full btn-primary"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to show demo toast
export const showDemoToast = (action) => {
  const messages = {
    create: 'This is a demo. Data will not be saved to the database.',
    update: 'This is a demo. Changes will not be saved to the database.',
    delete: 'This is a demo. No data will be deleted from the database.',
    checkout: 'This is a demo. Checkout will not be saved to the database.',
    emergency: 'This is a demo. Emergency will not be saved to the database.',
    admin: 'This is a demo. Admin changes will not be saved to the database.',
    backup: 'This is a demo. Backup operations are not available.',
    default: 'This is a demo. Database operations are disabled.'
  };

  const message = messages[action] || messages.default;
  toast(message, {
    icon: '⚠️',
    duration: 4000,
    style: {
      background: '#FEF3C7',
      color: '#92400E',
      border: '1px solid #FCD34D'
    }
  });
};

export default DemoPopup;

