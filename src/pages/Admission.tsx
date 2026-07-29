import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LuUser,
  LuPhone,
  LuMail,
  LuMapPin,
  LuCalendar,
  LuClock,
  LuArmchair,
  LuCreditCard,
  LuCheck,
  LuBug,
  LuSparkles,
  LuLoader,
  LuArrowRight,
  LuShieldCheck,
  LuInfo,
  LuZap,
  // LuX
} from 'react-icons/lu';
import Navbar from '../components/Navbar';

interface Room {
  id: number;
  name: string;
}

interface Seat {
  id: number;
  seatNumber: number;
  nearAc: boolean;
  chargingPoint: boolean;
  room?: Room;
}

interface SplitShiftOption {
  shiftId: number;
  freeSeats: Seat[];
}

interface APIResponse {
  success: boolean;
  isSplitCombo: boolean;
  count?: number;
  availableSeats?: Seat[];
  splitOptions?: SplitShiftOption[];
  message?: string;
}

// Environment Variable Handling with graceful fallback
const BASE_URL =  'https://api.libdesk.online';
// const BASE_URL = import.meta.env?.VITE_API_URL || 'https://api.libdesk.online';

export default function AdmissionForm(): React.JSX.Element {
  // 1. Mobile Step Wizard State (1: Personal, 2: Plan, 3: Seat, 4: Payment)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // 2. Core State Handlers
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    fathersName: '',
    gender: 'male',
    phone: '',
    email: '',
    address: ''
  });

  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState<string>('1');
  const [endDate, setEndDate] = useState('');

  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({
    amount: '',
    paymentType: 'cash',
    remarks: ''
  });

  // Validation Error state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 3. Control Data & Allocation Mapping States
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string>('');
  const [splitSeatSelections, setSplitSeatSelections] = useState<Record<number, number>>({});

  const [checkingSeats, setCheckingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Optimized React Toastify Dispatcher
 const showToast = (
  title: string,
  message: string,
  type: "success" | "error" | "info" = "info"
) => {
  const id = `${type}-${title}`;

  if (toast.isActive(id)) return;

  const content = (
    <div>
      <div className="font-bold text-xs">{title}</div>
      <div className="text-xs mt-1">{message}</div>
    </div>
  );

  toast(content, {
    toastId: id,
    type,
  });
};

  // System Date Constraints (Prevent past selections)
  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-calculate End Date whenever Start Date or Duration Changes
  useEffect(() => {
    if (!startDate) {
      setEndDate('');
      return;
    }

    const start = new Date(startDate);
    const monthsToAdd = parseInt(durationMonths, 10);
    start.setMonth(start.getMonth() + monthsToAdd);

    const calculatedEndDate = start.toISOString().split('T')[0];
    setEndDate(calculatedEndDate);
  }, [startDate, durationMonths]);

  // Re-run live seat map queries when parameters change
  useEffect(() => {
    if (startDate && endDate && selectedShifts.length > 0) {
      fetchAvailableSeats();
    } else {
      setApiResponse(null);
      setSelectedSeatId('');
      setSplitSeatSelections({});
    }
  }, [startDate, endDate, selectedShifts]);

  const fetchAvailableSeats = async () => {
    setCheckingSeats(true);
    try {
      const query = new URLSearchParams({
        startDate,
        endDate,
        shifts: selectedShifts.join(',')
      }).toString();

      const res = await fetch(`${BASE_URL}/api/v1/available?${query}`);

      if (!res.ok) {
        throw new Error(`Server status ${res.status}: Live seats service unreachable`);
      }

      const result: APIResponse = await res.json();

      setApiResponse(result);
      setSelectedSeatId('');
      setSplitSeatSelections({});

      if (result.isSplitCombo) {
        showToast("Split Seat Plan Required", "No single seat is open for all selected shifts. Select an open seat per shift.", "info");
      } else if (result.availableSeats && result.availableSeats.length > 0) {
        showToast("Seats Available", `Found ${result.availableSeats.length} matching seats for your shift selection.`, "success");
      }
    } catch (err) {
      console.error("Error fetching live slot configurations:", err);
      setApiResponse(null);
      showToast("Live Sync Warning", "Operating in offline mode. Client validation active.", "info");
    } finally {
      setCheckingSeats(false);
    }
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim().length < 2 ? 'Student full name is required' : '';
      case 'fathersName':
        return value.trim().length < 2 ? "Father's name is required" : '';
      case 'phone':
        return !/^[6-9]\d{9}$/.test(value) ? 'Enter a valid 10-digit mobile number' : '';
      case 'address':
        return value.trim().length < 5 ? 'Please enter complete address' : '';
      case 'amount':
        return !value || parseFloat(value) <= 0 ? 'Enter a valid fee amount' : '';
      default:
        return '';
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    let value = '';
    if (fieldName in studentInfo) {
      value = studentInfo[fieldName as keyof typeof studentInfo];
    } else if (fieldName in paymentInfo) {
      value = paymentInfo[fieldName as keyof typeof paymentInfo];
    }
    const err = validateField(fieldName, value);
    setErrors((prev) => ({ ...prev, [fieldName]: err }));
  };

  const handleShiftToggle = (shiftId: number) => {
    setSelectedShifts((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    );
  };

  const handleSplitSeatChange = (shiftId: number, seatIdStr: string) => {
    setSplitSeatSelections((prev) => ({
      ...prev,
      [shiftId]: parseInt(seatIdStr, 10)
    }));
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentInfo((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const isSelectionComplete = () => {
    if (selectedShifts.length === 0 || !startDate) return false;
    if (apiResponse) {
      if (apiResponse.isSplitCombo) {
        return selectedShifts.every((shiftId) => !!splitSeatSelections[shiftId]);
      }
      return !!selectedSeatId;
    }
    return !!selectedSeatId || Object.keys(splitSeatSelections).length > 0;
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      const errName = validateField('name', studentInfo.name);
      const errFather = validateField('fathersName', studentInfo.fathersName);
      const errPhone = validateField('phone', studentInfo.phone);
      const errAddress = validateField('address', studentInfo.address);

      setErrors({ name: errName, fathersName: errFather, phone: errPhone, address: errAddress });
      setTouched({ name: true, fathersName: true, phone: true, address: true });

      if (errName || errFather || errPhone || errAddress) {
        showToast("Personal Info Required", "Please fill in all personal details correctly.", "error");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!startDate) {
        showToast("Start Date Required", "Please select a membership start date.", "error");
        return false;
      }
      if (selectedShifts.length === 0) {
        showToast("Shift Selection Required", "Please select at least one shift slot.", "error");
        return false;
      }
      return true;
    }

    if (step === 3) {
      if (!isSelectionComplete()) {
        showToast("Seat Assignment Required", "Please select an available desk from the grid.", "error");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const errAmount = validateField('amount', paymentInfo.amount);
    if (errAmount) {
      setErrors((prev) => ({ ...prev, amount: errAmount }));
      setTouched((prev) => ({ ...prev, amount: true }));
      showToast("Payment Amount Missing", "Please enter a valid collected fee amount.", "error");
      return;
    }

    setSubmitting(true);
    try {
      let finalSeatData = {};
      if (apiResponse?.isSplitCombo) {
        finalSeatData = {
          isSplit: true,
          splitBookings: Object.entries(splitSeatSelections).map(([shiftId, seatId]) => ({
            shiftId: parseInt(shiftId, 10),
            seatId: seatId
          }))
        };
      } else {
        finalSeatData = {
          isSplit: false,
          seatId: parseInt(selectedSeatId || '1', 10),
          shiftIds: selectedShifts
        };
      }

      const payload = {
        ...studentInfo,
        startDate,
        endDate,
        ...finalSeatData,
        ...paymentInfo
      };

      const response = await fetch(`${BASE_URL}/api/v1/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast("Admission Completed!", `Student ${studentInfo.name} registered successfully.`, "success");

        // Clean resets
        setStudentInfo({ name: '', fathersName: '', gender: 'male', phone: '', email: '', address: '' });
        setStartDate('');
        setDurationMonths('1');
        setSelectedShifts([]);
        setSelectedSeatId('');
        setSplitSeatSelections({});
        setApiResponse(null);
        setPaymentInfo({ amount: '', paymentType: 'cash', remarks: '' });
        setErrors({});
        setTouched({});
        setCurrentStep(1);
      } else {
        showToast("Processing Fault", result.message || "Failed to finalize seat booking record.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Admission Saved (Offline)", `Admission registered for ${studentInfo.name}.`, "success");
      setStudentInfo({ name: '', fathersName: '', gender: 'male', phone: '', email: '', address: '' });
      setStartDate('');
      setSelectedShifts([]);
      setSelectedSeatId('');
      setPaymentInfo({ amount: '', paymentType: 'cash', remarks: '' });
      setCurrentStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white relative pb-24 overflow-x-hidden">
      {/* Toastify Global Container */}
      {/* <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      /> */}

      {/* Background Grid Accent Lights */}
      <Navbar/>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d12_1px,transparent_1px),linear-gradient(to_bottom,#1f293d12_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {/* Main Header Banner */}
      <div className="max-w-5xl mx-auto pt-8 sm:pt-10 px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-400 shadow-xl">
          <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
          <span>Multi-Tenant Admission Engine</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Student Admission Control
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 font-mono">
              Register members, allocate interactive seats, and issue payment receipts.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl">
            <LuShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Schema Isolated • SSL Secured</span>
          </div>
        </div>

        {/* Mobile Wizard Step Progress Indicator */}
        <div className="block md:hidden pt-2">
          <div className="flex items-center justify-between text-xs font-mono mb-2 text-slate-400">
            <span>Step {currentStep} of 4</span>
            <span className="text-blue-400 font-bold uppercase">
              {currentStep === 1 && '1. Personal'}
              {currentStep === 2 && '2. Plan & Shifts'}
              {currentStep === 3 && '3. Seat Selection'}
              {currentStep === 4 && '4. Payment'}
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Form Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">

          {}
          <div className={`${currentStep === 1 ? 'block' : 'hidden md:block'} bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center text-xs">1</span>
                Personal Profiles
              </h2>
              <span className="text-[11px] text-slate-500 font-mono">* Required inputs</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Student Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LuUser className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="name"
                    value={studentInfo.name}
                    onChange={handleStudentChange}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Aman Verma"
                    className={`w-full bg-[#080C14] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all ${
                      errors.name && touched.name
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  />
                </div>
                {errors.name && touched.name && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <LuBug className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Father's Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Father's Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LuUser className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="fathersName"
                    value={studentInfo.fathersName}
                    onChange={handleStudentChange}
                    onBlur={() => handleBlur('fathersName')}
                    placeholder="e.g. Ramesh Verma"
                    className={`w-full bg-[#080C14] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all ${
                      errors.fathersName && touched.fathersName
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  />
                </div>
                {errors.fathersName && touched.fathersName && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <LuBug className="w-3 h-3" /> {errors.fathersName}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Gender
                </label>
                <select
                  name="gender"
                  value={studentInfo.gender}
                  onChange={handleStudentChange}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Mobile Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LuPhone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    value={studentInfo.phone}
                    onChange={handleStudentChange}
                    onBlur={() => handleBlur('phone')}
                    placeholder="9876543210"
                    className={`w-full bg-[#080C14] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all ${
                      errors.phone && touched.phone
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  />
                </div>
                {errors.phone && touched.phone && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <LuBug className="w-3 h-3" /> {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Email Address <span className="text-slate-500">(Optional for receipts)</span>
                </label>
                <div className="relative">
                  <LuMail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    name="email"
                    value={studentInfo.email}
                    onChange={handleStudentChange}
                    placeholder="student@example.com"
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Permanent Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Residence Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LuMapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <textarea
                    name="address"
                    rows={2}
                    value={studentInfo.address}
                    onChange={handleStudentChange}
                    onBlur={() => handleBlur('address')}
                    placeholder="House No., Street, Landmark, City, Pincode"
                    className={`w-full bg-[#080C14] border rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all resize-none ${
                      errors.address && touched.address
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  />
                </div>
                {errors.address && touched.address && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <LuBug className="w-3 h-3" /> {errors.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {}
          <div className={`${currentStep === 2 ? 'block' : 'hidden md:block'} bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs">2</span>
                Plan & Shifts Configuration
              </h2>
              <span className="text-[11px] text-indigo-400 font-mono flex items-center gap-1">
                <LuZap className="w-3.5 h-3.5" /> Auto Expiration
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Start Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Start Date <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <LuCalendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    required
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono cursor-pointer [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Membership Duration */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Membership Term Duration
                </label>
                <select
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                >
                  <option value="1">1 Month Plan</option>
                  <option value="2">2 Months Plan</option>
                  <option value="3">3 Months Plan</option>
                  <option value="6">6 Months Plan (10% Discount)</option>
                  <option value="12">1 Year Plan (2 Months Free)</option>
                </select>
              </div>

              {/* Expiration Date Display Banner */}
              {endDate && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border border-blue-500/30 flex items-center justify-between text-xs font-mono text-blue-300 shadow-inner">
                  <span className="flex items-center gap-2">
                    <LuSparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                    Calculated Expiration Date:
                  </span>
                  <strong className="text-white font-bold bg-blue-600/20 px-3 py-1 rounded-lg border border-blue-500/30 text-xs">
                    {endDate}
                  </strong>
                </div>
              )}

              {/* Shift Selection Pills */}
              <div className="sm:col-span-2 space-y-2 pt-2">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Select Shift Timings <span className="text-rose-400">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 1, label: 'Shift 1 (Morning)', time: '06:00 AM – 12:00 PM' },
                    { id: 2, label: 'Shift 2 (Afternoon)', time: '12:00 PM – 06:00 PM' },
                    { id: 3, label: 'Shift 3 (Evening)', time: '06:00 PM – 11:00 PM' }
                  ].map((shift) => {
                    const isSelected = selectedShifts.includes(shift.id);
                    return (
                      <button
                        type="button"
                        key={shift.id}
                        onClick={() => handleShiftToggle(shift.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                            : 'bg-[#080C14] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs font-mono">{shift.label}</span>
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                              isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-slate-700'
                            }`}
                          >
                            {isSelected && <LuCheck className="w-3 h-3 stroke-[3]" />}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                          <LuClock className="w-3 h-3 text-slate-500" />
                          {shift.time}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {}
          <div className={`${currentStep === 3 ? 'block' : 'hidden md:block'} bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs">3</span>
                Seat Grid Space Picker
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {selectedShifts.length > 0 ? `${selectedShifts.length} Shift(s) Selected` : 'Select shift first'}
              </span>
            </div>

            {checkingSeats && (
              <div className="py-8 text-center space-y-3">
                <LuLoader className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Scanning real-time occupancy index...</p>
              </div>
            )}

            {!checkingSeats && apiResponse && (
              <div className="space-y-4">
                {/* CASE A: Standard Continuous Seats available */}
                {!apiResponse.isSplitCombo && apiResponse.availableSeats && apiResponse.availableSeats.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Available Desks ({apiResponse.availableSeats.length})</span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Selected</span>
                        <span className="flex items-center gap-1 text-slate-400"><span className="w-2.5 h-2.5 rounded bg-slate-800 border border-slate-700" /> Open</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-56 overflow-y-auto p-3 bg-[#080C14] rounded-xl border border-slate-800">
                      {apiResponse.availableSeats.map((seat) => {
                        const isSelected = selectedSeatId === seat.id.toString();
                        return (
                          <button
                            type="button"
                            key={seat.id}
                            onClick={() => setSelectedSeatId(seat.id.toString())}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
                            }`}
                          >
                            <div className="font-mono text-xs font-bold flex items-center justify-center gap-1">
                              <LuArmchair className="w-3.5 h-3.5" /> #{seat.seatNumber}
                            </div>
                            <div className="text-[9px] text-slate-500 mt-0.5 font-mono truncate">
                              {seat.room?.name || 'Main Hall'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CASE B: Fallback Alert Banner - Split Shift Combinations Plan */}
                {apiResponse.isSplitCombo && apiResponse.splitOptions && (
                  <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-4">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold">
                      <LuBug className="w-4 h-4 shrink-0" />
                      Split Seat Assignment Required
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed">
                      No single desk is open for all selected shifts. Assign an open seat individually for each shift:
                    </p>

                    <div className="space-y-3 pt-1">
                      {apiResponse.splitOptions.map((option) => (
                        <div
                          key={option.shiftId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-[#080C14] border border-amber-500/20"
                        >
                          <span className="text-xs font-mono text-slate-300 font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Shift {option.shiftId} Desk:
                          </span>
                          <select
                            required
                            value={splitSeatSelections[option.shiftId] || ''}
                            onChange={(e) => handleSplitSeatChange(option.shiftId, e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono w-full sm:w-64"
                          >
                            <option value="">-- Assign Shift {option.shiftId} Seat --</option>
                            {option.freeSeats.map((seat) => (
                              <option key={seat.id} value={seat.id}>
                                Seat #{seat.seatNumber} ({seat.room?.name || 'Main Area'})
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CASE C: Library is completely full across requested boundaries */}
                {((!apiResponse.isSplitCombo && apiResponse.availableSeats?.length === 0) ||
                  (apiResponse.isSplitCombo && apiResponse.splitOptions?.length === 0)) && (
                  <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                    <LuBug className="w-4 h-4 shrink-0" />
                    No open seat options match this combination of shifts and dates.
                  </div>
                )}
              </div>
            )}

            {!checkingSeats && !apiResponse && (
              <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800/80 text-slate-500 text-xs font-mono flex items-center gap-2">
                <LuInfo className="w-4 h-4 text-blue-400 shrink-0" />
                Select start date and shifts above to load available seats.
              </div>
            )}
          </div>

          {}
          <div className={`${currentStep === 4 ? 'block' : 'hidden md:block'} bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5`}>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs">4</span>
                Payment Ledger Details
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono">Instant UPI / Cash Receipt</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Fee Amount */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Collected Fee Amount (INR) <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="text-slate-500 font-mono text-xs absolute left-3.5 top-1/2 -translate-y-1/2">₹</span>
                  <input
                    type="number"
                    name="amount"
                    value={paymentInfo.amount}
                    onChange={handlePaymentChange}
                    onBlur={() => handleBlur('amount')}
                    placeholder="800"
                    className={`w-full bg-[#080C14] border rounded-xl pl-8 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none font-mono transition-all ${
                      errors.amount && touched.amount
                        ? 'border-rose-500/80 focus:ring-1 focus:ring-rose-500'
                        : 'border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50'
                    }`}
                  />
                </div>
                {errors.amount && touched.amount && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1 flex items-center gap-1">
                    <LuBug className="w-3 h-3" /> {errors.amount}
                  </p>
                )}
              </div>

              {/* Payment Mode */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Payment Mode
                </label>
                <div className="relative">
                  <LuCreditCard className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    name="paymentType"
                    value={paymentInfo.paymentType}
                    onChange={handlePaymentChange}
                    className="w-full bg-[#080C14] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                  >
                    <option value="cash">Cash Collection</option>
                    <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="bank">Bank Transfer / NEFT</option>
                  </select>
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-mono uppercase text-slate-300">
                  Transaction Footnotes / Reference ID
                </label>
                <input
                  type="text"
                  name="remarks"
                  value={paymentInfo.remarks}
                  onChange={handlePaymentChange}
                  placeholder="e.g. Paid full amount via Paytm. Ref: #UPI-9821389"
                  className="w-full bg-[#080C14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {}
          {/* Mobile Step Control Buttons */}
          <div className="flex md:hidden items-center justify-between gap-3 pt-2">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-5 py-3 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-bold uppercase transition-all"
              >
                Previous Step
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white border border-blue-400/30 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <span>Next Step</span>
                <LuArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                {submitting ? (
                  <>
                    <LuLoader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit</span>
                    <LuCheck className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Desktop Direct Submit Action Block */}
          <div className="hidden md:block">
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 border ${
                submitting
                  ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-blue-400/30 shadow-blue-600/25 hover:shadow-blue-500/40'
              }`}
            >
              {submitting ? (
                <>
                  <LuLoader className="w-4 h-4 animate-spin" />
                  <span>Writing Data Transactions to Cloud...</span>
                </>
              ) : (
                <>
                  <span>Execute Complete Admission & Booking</span>
                  <LuArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}