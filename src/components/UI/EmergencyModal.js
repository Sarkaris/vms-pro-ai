import React, { useState } from 'react';
import { showDemoToast } from './DemoPopup';
import toast from 'react-hot-toast';

const EmergencyModal = ({ onClose }) => {
  const [tab, setTab] = useState('visitor');
  const [visitor, setVisitor] = useState({ firstName: '', lastName: '', phone: '' });
  const [dept, setDept] = useState({ departmentName: '', pocName: '', pocPhone: '', headcount: 1 });
  const [submitting, setSubmitting] = useState(false);

  const validVisitor = visitor.firstName.trim() && visitor.lastName.trim() && /^\d{10}$/.test(visitor.phone.trim());
  const validDept = dept.departmentName.trim() && dept.pocName.trim() && /^\d{10}$/.test(dept.pocPhone.trim()) && Number(dept.headcount) > 0;

  const submit = async () => {
    showDemoToast('emergency');
    try {
      setSubmitting(true);
      const { mockApi } = await import('../utils/mockData');
      const payload = tab === 'visitor'
        ? { 
            type: 'Visitor', 
            visitorFirstName: visitor.firstName.trim(),
            visitorLastName: visitor.lastName.trim(),
            visitorPhone: visitor.phone.trim(),
            description: `Visitor emergency: ${visitor.firstName} ${visitor.lastName}`,
            severity: 'High',
            location: 'Main Lobby',
            reportedBy: 'System'
          }
        : { 
            type: 'Departmental', 
            departmentName: dept.departmentName.trim(),
            pocName: dept.pocName.trim(),
            pocPhone: dept.pocPhone.trim(),
            headcount: Number(dept.headcount) || 1,
            description: `Departmental emergency: ${dept.departmentName}`,
            severity: 'High',
            location: dept.departmentName,
            reportedBy: dept.pocName
          };
      await mockApi.createEmergency(payload);
      toast.success('Emergency created successfully (Demo)');
      onClose();
    } catch (e) {
      console.error('Emergency submit failed', e);
      toast.error('Failed to create emergency');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Emergency</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>
        <div className="px-5 pt-4">
          <div className="flex space-x-2 mb-4">
            <button className={`px-3 py-2 rounded text-sm font-medium ${tab==='visitor'?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={()=>setTab('visitor')}>Visitor Emergency</button>
            <button className={`px-3 py-2 rounded text-sm font-medium ${tab==='dept'?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`} onClick={()=>setTab('dept')}>Departmental Emergency</button>
          </div>
        </div>
        {tab === 'visitor' ? (
          <div className="px-5 pb-5 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="form-input" placeholder="First name" value={visitor.firstName} onChange={(e)=>setVisitor({...visitor, firstName:e.target.value})} />
              <input className="form-input" placeholder="Last name" value={visitor.lastName} onChange={(e)=>setVisitor({...visitor, lastName:e.target.value})} />
            </div>
            <input className="form-input" placeholder="Phone (10 digits)" value={visitor.phone} onChange={(e)=>setVisitor({...visitor, phone:e.target.value.replace(/[^0-9]/g,'')})} />
            <div className="flex justify-end space-x-2 pt-2">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className={`btn-primary ${!validVisitor?'opacity-50 pointer-events-none':''}`} onClick={submit} disabled={!validVisitor || submitting}>{submitting?'Saving...':'Save'}</button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-5 space-y-3">
            <input className="form-input" placeholder="Department/Unit" value={dept.departmentName} onChange={(e)=>setDept({...dept, departmentName:e.target.value})} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="form-input" placeholder="Point of Contact" value={dept.pocName} onChange={(e)=>setDept({...dept, pocName:e.target.value})} />
              <input className="form-input" placeholder="POC Phone (10 digits)" value={dept.pocPhone} onChange={(e)=>setDept({...dept, pocPhone:e.target.value.replace(/[^0-9]/g,'')})} />
            </div>
            <div className="flex items-center space-x-2">
              <input type="number" min="1" className="form-input w-32" placeholder="Headcount" value={dept.headcount} onChange={(e)=>setDept({...dept, headcount:e.target.value})} />
              <div className="flex space-x-2">
                {[1,10,50,100].map(n => (
                  <button key={n} className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600" onClick={()=>setDept({...dept, headcount: Number(dept.headcount)+n})}>+{n}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button className="btn-secondary" onClick={onClose}>Cancel</button>
              <button className={`btn-primary ${!validDept?'opacity-50 pointer-events-none':''}`} onClick={submit} disabled={!validDept || submitting}>{submitting?'Saving...':'Save'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyModal;


